/**
 * Winston Logger framework
 * Author: Fernando Karnagi <fernando@cyder.com.sg>
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, json, prettyPrint } = format;

const myFormat = printf(({ timestamp, label, level, message }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

// define the custom settings for each transport (file, console)
var options = {
    fileJson: {
        level: 'debug',
        filename: (process.env.LOGPATH ? process.env.LOGPATH : './logs') + "/log.json",
        handleExceptions: true,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        colorize: false,
        format: combine(
            timestamp(),
            label({ label: (process.env.LOGLABEL ? process.env.LOGLABEL : 'STREAM') }),
            json()
        ),
    },
    fileLog: {
        level: 'debug',
        filename: (process.env.LOGPATH ? process.env.LOGPATH : './logs') + "/log.txt",
        handleExceptions: true,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        colorize: false,
        format: combine(
            timestamp(),
            label({ label: (process.env.LOGLABEL ? process.env.LOGLABEL : 'STREAM') }),
            myFormat
        ),
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        colorize: true,
        format: combine(
            label({ label: (process.env.LOGLABEL ? process.env.LOGLABEL : 'STREAM') }),
            timestamp(),
            myFormat
        ),
    },
};

// instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
    transports: [
        new transports.File(options.fileJson),
        new transports.File(options.fileLog),
        new transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

const convertMessage = (params) => {
    let message = "";
    Object.keys(params).forEach(k => {
        if (params[k] instanceof Object) {
            try {
                message += `${JSON.stringify(params[k])} `;
            } catch (e) {
            }
        } else {
            message += `${params[k]} `;
        }

    });
    return message;
}

exports.debug = (...params) => {
    logger.debug(convertMessage(params));
}

exports.info = (...params) => {
    logger.info(convertMessage(params));
}

exports.warning = (...params) => {
    logger.warning(convertMessage(params));
}

exports.error = (...params) => {
    logger.error(convertMessage(params));
}