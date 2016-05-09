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
    klagobert.commands.clearScoreboard(function(reply) {
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
    console.log(req);
    console.log(req.param('user_name'));
    var username = req.param('user_name');
    klagobert.commands.lastWhine(username, function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('top-whines');
  });

  return router;
}
