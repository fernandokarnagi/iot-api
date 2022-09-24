/** @format */

const logger = require('../winston');
const mqtt = require('mqtt');

exports.socket = async (socketObj, mqttOptions) => {

    const mqttUrl = null;
    const mqttClient = mqtt.connect(mqttUrl, mqttOptions);

    mqttClient.on('error', (error) => {
        logger.error('error ' + mqttHost + ':' + mqttPort, error);
    });

    mqttClient.on('offline', () => {
        logger.debug('is offline ' + mqttHost + ':' + mqttPort);
    });

    mqttClient.on('reconnect', () => {
        logger.debug('is reconnecting ' + mqttHost + ':' + mqttPort);
    });

    mqttClient.on('end', () => {
        logger.debug('ended ' + mqttHost + ':' + mqttPort);
    });

    // only kafka connection awaiting is required, we can ignore this
    mqttClient.on('connect', () => {
        logger.debug('connected ' + mqttHost + ':' + mqttPort);

        client.subscribe('tenant001/building001/liquid/001', function (err) {
            if (!err) {
                console.log("subscribed to mqtt topic");
            }
        });
    });

    mqttClient.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString());
        socketObj.emit(topic, message.toString());
    })


    socketObj.on('disconnect', async () => {
        logger.info('Client disconnected, socket: ', socketObj.id);
        await mqttClient.end();
    });

};
