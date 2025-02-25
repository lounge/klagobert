const Cleverbot = require('cleverbot-node');
const { cleverbotKey } = require('./config.json');


class CleverbotApi {
    constructor() {
        this.cleverbot = new Cleverbot;
        this.cleverbot.configure({ botapi: cleverbotKey });
    }

    async send(message, callback) {
        return  this.cleverbot.write(message, (response) => {
            console.log(response.output);
            callback(response.output);
        });
    }
}

module.exports = CleverbotApi;
