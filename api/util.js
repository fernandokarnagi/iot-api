/** @format */
const { Kafka, CompressionTypes } = require("kafkajs");
const uuidv1 = require("uuid/v1");
const logger = require('../winston');
const packageJson = require('../package.json');

const sendMessage = async (producer, mqttClient, mqttInputTopic, ck, tag, value) => {
    try {
        const messageObj = { "CK": ck, "DATA": [{ "ID": tag, "V": value }] }
        const mqttMessage = { "UUID": uuidv1(), "T": new Date().getTime(), "CK": ck, "DATA": [{ "ID": tag, "V": value }] }
        const message = JSON.stringify(messageObj);
        producer.send({
            topic: mqttInputTopic,
            compression: CompressionTypes.GZIP,
            messages: [
                {
                    key: mqttInputTopic,
                    value: message,
                    headers: {
                        source: packageJson.name,
                        id: uuidv1()
                    },
                },
            ],
        });

        if (mqttClient.connected) {
            const topicToSend = mqttInputTopic.replace(/-in/g, '-out').replace(/iot-/g, '').replace(/-/g, '/');
            logger.debug("sending [" + topicToSend + "] ", JSON.stringify(mqttMessage));
            mqttClient.publish(topicToSend, JSON.stringify(mqttMessage))
        }

    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    sendMessage
};
