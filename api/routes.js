'use strict'

var express = require('express');
var router = express.Router();


module.exports = function(klagobert) {

  router.post('/kb-help', function(req, res) {
    var self = this;
    klagobert.commands.help(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('help');
  });

  router.post('/scoreboard', function(req, res) {
    var self = this;

    klagobert.commands.scoreboard(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('scoreboard');
  });

  router.post('/reset-bp', function(req, res) {
    var self = this;
    var username = req.body.user_name;
    klagobert.commands.clearScoreboard(function(username, reply) {
      klagobert.sendMessage(reply);
    });
    res.send('reset-bp');
  });

  router.post('/top-whines', function(req, res) {
    var self = this;
    klagobert.commands.topWhines(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('top-whines');
  });

  router.post('/last-whine', function(req, res) {
    var self = this;
    var username = req.body.user_name;
    klagobert.commands.lastWhine(username, function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('last-whine ' + username);
  });

  return router;
}
