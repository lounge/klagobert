'use strict'

var Klagobert = require('./lib/klagobert');
var Db = require('./lib/db');
var Commands = require('./lib/commands');
var Messages = require('./lib/messages');
var Sentiment = require('./lib/sentiment');


var express = require('express');
var server = express();

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;
var dbPath = process.env.MONGODB_URI;
var channelId = process.env.CHANNEL_ID;

var db = new Db(dbPath);
var messages = new Messages(db);
var commands = new Commands(db, messages);
var sentiment = new Sentiment();

var klagobert = new Klagobert({
  channelId: channelId,
  token: token,
  name: name,
  db: db,
  messages: messages,
  commands: commands,
  sentiment: sentiment
});

var routes = require('./lib/routes')(klagobert);



// routes.bindKlagobert(klagobert);

server.use('/', routes);
server.listen(80);

klagobert.run();
