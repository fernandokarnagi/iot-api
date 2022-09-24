/** @format */

const logger = require('../winston');
const mqtt = require('mqtt');

exports.socket = async (socketObj, mqttOptions) => {

    const mqttUrl = null;
    const mqttHost = mqttOptions.host;
    const mqttPort = mqttOptions.port;

    const topicsTemp = socketObj.handshake.query.topics;
    const topics = topicsTemp.split("~")

    if (!topics) {
        return;
    }

    logger.debug("[" + socketObj.id + "] subscribing to topic: ", topics);

    const mqttClient = mqtt.connect(mqttUrl, mqttOptions);

    mqttClient.on('error', (error) => {
        logger.error("[" + socketObj.id + '] error ' + mqttHost + ':' + mqttPort, error);
    });

    mqttClient.on('offline', () => {
        logger.debug("[" + socketObj.id + '] is offline ' + mqttHost + ':' + mqttPort);
    });

    mqttClient.on('reconnect', () => {
        logger.debug("[" + socketObj.id + '] is reconnecting ' + mqttHost + ':' + mqttPort);
    });

    mqttClient.on('end', () => {
        logger.debug("[" + socketObj.id + '] ended ' + mqttHost + ':' + mqttPort);
    });

    // only kafka connection awaiting is required, we can ignore this
    mqttClient.on('connect', () => {
        logger.debug("[" + socketObj.id + '] connected ' + mqttHost + ':' + mqttPort);

        for (var i = 0; i < topics.length; i++) {
            mqttClient.subscribe(topics[i], function (err) {
                if (!err) {
                    logger.debug("[" + socketObj.id + "] subscribed to mqtt topic");
                }
            });
        }

    });

    mqttClient.on('message', function (topic, message) {
        // message is Buffer
        socketObj.emit(topic, message.toString());
    })


    socketObj.on('disconnect', async () => {
        logger.info("[" + socketObj.id + '] client disconnected');
        await mqttClient.end();
    });

};
