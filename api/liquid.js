/** @format */
const { Kafka, CompressionTypes } = require("kafkajs");
const express = require('express');
const uuidv1 = require("uuid/v1");
const router = express.Router();
const cassandraLib = require('../cassandra/cassandra');
const logger = require('../winston');
const packageJson = require('../package.json');
const { KAFKA_CLIENT_ID, KAFKA_BROKER, MODE } = process.env;
const { sendMessage } = require('./util');
const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: [KAFKA_BROKER]
})

const producer = kafka.producer();
producer.connect();

router.post('/heater', async (req, res) => {
    logger.debug(`Received data `, req.body);
    const { mode } = req.body;
    try {
        const mqttInputTopic = "iot-tenant001-temp001-device006-in";
        const ck = "cydersg";
        const tag = "TAG48";
        const value = mode;
        sendMessage(producer, router.mqttClient, mqttInputTopic, ck, tag, value);
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }
});p

module.exports = router;