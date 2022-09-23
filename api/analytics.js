/** @format */

const express = require('express');
const router = express.Router();
const uuidv1 = require("uuid/v1");
const { Kafka, CompressionTypes } = require("kafkajs");
const kafkaBroker = process.env.KAFKA_BROKER;
const kafkaClientId = process.env.KAFKA_CLIENT_ID + "-receiver";

const packageJson = require('../package.json');

const kafka = new Kafka({
    clientId: kafkaClientId,
    brokers: [kafkaBroker]
})
const logger = require('../winston');
const producer = kafka.producer();

producer.connect();

const TAG_TOPIC = {
    TAG28: {
        topic: 'iot-tenant001-egy001-device009-in',
        channel: 'cydersg'
    },
    TAG48: {
        topic: 'iot-tenant001-temp001-device006-in',
        channel: 'cydersg1'
    },
    TAG17: {
        topic: 'iot-tenant001-temp001-device007-in',
        channel: 'cydersg2'
    },
    TAG49: {
        topic: 'iot-tenant001-temp001-device008-in',
        channel: 'cydersg3'
    },
}

router.post('/send', async (req, res) => {
    logger.debug(`Received data `, req.body);
    const { tag, value } = req.body;

    const message = { "CK": TAG_TOPIC[tag].channel, "DATA": [{ "ID": tag, "V": value }] };

    logger.debug(`Send MQTT Data `, message);

    try {
        producer.send({
            topic: TAG_TOPIC[tag].topic,
            compression: CompressionTypes.GZIP,
            messages: [
                {
                    key: tag,
                    value: JSON.stringify(message),
                    headers: {
                        source: packageJson.name,
                        id: uuidv1()
                    },
                },
            ],
        });
    } catch (e) {
        console.log(e)
        logger.error("error", e);
    }
    res.sendStatus('200');
});

module.exports = router;