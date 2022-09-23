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

router.get('/query', async (req, res) => {
    logger.debug(`Received data `, req.query);
    const { limit, category } = req.query;
    try {
        const result = await cassandraLib.select(`SELECT * FROM echelon_iot.${category} LIMIT ${limit}`, []);
        res.send(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

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
});

router.post('/alarm', async (req, res) => {
    logger.debug(`Received data `, req.body);
    const { mode } = req.body;
    try {
        const mqttInputTopic = "iot-tenant001-temp001-device007-in"; 
        const ck = "cydersg2";
        const tag = "TAG17";
        const value = mode;
        sendMessage(producer, router.mqttClient, mqttInputTopic, ck, tag, value);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

router.post('/fan', async (req, res) => {
    logger.debug(`Received data `, req.body);
    const { mode } = req.body;
    try {
        const mqttInputTopic = "iot-tenant001-temp001-device008-in"; 
        const ck = "cydersg3";
        const tag = "TAG49";
        const value = mode;
        sendMessage(producer, router.mqttClient, mqttInputTopic, ck, tag, value);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

module.exports = router;