/** @format */

const bodyParser = require('body-parser');
const app = require('express')();
const server = require('http').createServer(app);
const logger = require('./winston');
const mqtt = require('mqtt');

// Middlewares
app.use(require('cors')());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const mqttHost = process.env.MQTT_HOST;
const mqttPort = process.env.MQTT_PORT;

const mqttOptions = {
    reconnectPeriod: 1000,
    resubscribe: true,
    clientId: "iot-app",
    host: mqttHost,
    port: mqttPort,
    protocolId: 'MQTT',
    protocolVersion: 4,
};
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
});

const liquidRouter = require('./api/liquid');
app.use('/api/liquid', liquidRouter);

const analyticsRouter = require('./api/analytics');
app.use('/api/analytics', analyticsRouter);

// Water Quality Socket IO handler
const liquid = require('socket.io')(server, {
    path: '/liquid',
});

liquid.on('connection', (socket) => {
    logger.info('New client connected, socket: ', socket.id);
    require('./socket/liquid').socket(socket);
});

const PORT = process.env.API_PORT || 3500;
server.listen(PORT, '0.0.0.0', () => logger.info(`Listening on port ${PORT}`));
