'use strict'

var Klagobert = require('./lib/klagobert');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;
var dbPath = process.env.MONGODB_URI;

var klagobert = new Klagobert({
  token: token,
  name: name,
  dbPath: dbPath
});

klagobert.run();
