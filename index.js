/** @format */

const bodyParser = require('body-parser');
const app = require('express')();
const server = require('http').createServer(app);
const logger = require('./winston');
const cors = require('cors');

// Middlewares
// app.use(require('cors')());
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const mqttHost = process.env.MQTT_HOST;
const mqttPort = process.env.MQTT_PORT;

const mqttOptions = {
    reconnectPeriod: 1000,
    resubscribe: true,
    clientId: "iot-api",
    host: mqttHost,
    port: mqttPort,
    protocolId: 'MQTT',
    protocolVersion: 4,
};

// const liquidRoputer = require('./api/liquid');
// app.use('/api/liquid', liquidRouter);

// const analyticsRouter = require('./api/analytics');
// app.use('/api/analytics', analyticsRouter);

// Liquid Socket IO handler
const liquid = require('socket.io')(server, {
    path: '/liquid',
});

liquid.on('connection', (socket) => {
    logger.info('New client connected, socket: ', socket.id);
    require('./socket/liquid').socket(socket, mqttOptions);
});

server.listen(process.env.PORT, '0.0.0.0', () => logger.info(`Listening on port ${process.env.PORT}`));
