/** @format */

const { Kafka } = require('kafkajs');
const logger = require('../winston');
const { KAFKA_CLIENT_ID, KAFKA_BROKER, MODE } = process.env;
const PREFIX = MODE && MODE === 'DEV' ? '-dev' : '';

exports.socket = async (socketObj) => {
    const { token, topic } = socketObj.handshake.query;

    const kafka = new Kafka({
        clientId: KAFKA_CLIENT_ID,
        brokers: [KAFKA_BROKER],
    });

    const consumer = kafka.consumer({ groupId: socketObj.id });
    await consumer.connect();

    // Subscribing to complete TFA for this account
    await consumer.subscribe({ topic });

    // Get notified when this socket has join Kafka Consumer Group.
    // Only when join happens, then we notify socket client to proceed with subsequent requests
    const { REQUEST } = consumer.events;
    consumer.on(REQUEST, ({ payload }) => {
        if (payload.apiName === 'JoinGroup' && !socketObj.initialized) {
            logger.debug('Sending socketInitialized event');
            socketObj.initialized = true;
            socketObj.emit('socketInitialized');
        }
    });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {

            const messageTemp = Buffer.from(message.value, 'binary'); // Read string into a buffer
            const messageObj = JSON.parse(messageTemp);
            logger.debug("Emitting to [" + socketObj.id + "], from topic [" + topic + "], message: " + JSON.stringify(messageObj));
            socketObj.emit(topic, messageObj);
        },
    });

    socketObj.on('disconnect', async () => {
        logger.info('Client disconnected, socket: ', socketObj.id);
        await consumer.disconnect();
    });

};
