'use strict'

var Klagobert = require('./lib/klagobert');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var klagobert = new Klagobert({
  token: token,
  name: name
});

klagobert.run();
