const logger = require('../winston');
const uuidv1 = require('uuid/v1');
const cassandra = require('cassandra-driver');
const { CASSANDRA_HOST, CASSANDRA_USER, CASSANDRA_PASSWORD } = process.env;

const authProvider = new cassandra.auth.PlainTextAuthProvider(CASSANDRA_USER, CASSANDRA_PASSWORD);

const client = new cassandra.Client({
    contactPoints: [CASSANDRA_HOST],
    localDataCenter: 'datacenter1',
    authProvider: authProvider
});
client.connect(function (err) {
    if (err) logger.error("Error: ", err); else logger.debug("Connected to Cassandra cluster")
});

const select = async (query, params) => {
    return new Promise(function (resolve, reject) {
        client.execute(query, params, { prepare: true }, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res.rows);
            }
        });
    });

};

const insert = async (query, params) => {
    return new Promise(function (resolve, reject) {
        client.execute(query, params, { prepare: true }, function (err) {
            if (err) {
                logger.error("err: ", err)
                reject(err);
            } else {
                resolve();
            }
        });
    });

};

module.exports = {
    select
};
