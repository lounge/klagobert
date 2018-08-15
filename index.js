'use strict'

var Klagobert = require('./lib/klagobert');
var Db = require('./data/db');
var Commands = require('./lib/commands');
var Messages = require('./lib/messages');
var Sentiment = require('./lib/sentiment');

var bodyParser = require('body-parser');
var express = require('express');
var server = express();

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;
var dbPath = process.env.MONGODB_URI;
var channelId = process.env.CHANNEL_ID;
var port =  process.env.PORT || 3000;

console.log(token);
console.log(name);
console.log(dbPath);
console.log(channelId);
console.log(port);

var db = new Db(dbPath);
var sentiment = new Sentiment();
var messages = new Messages(db, sentiment);
var commands = new Commands(db, messages);

var klagobert = new Klagobert({
  channelId: channelId,
  token: token,
  name: name,
  db: db,
  messages: messages,
  commands: commands,
  sentiment: sentiment
});

var routes = require('./api/routes')(klagobert);

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use('/', routes);
server.listen(port);

klagobert.run();
