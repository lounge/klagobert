'use strict'

var express = require('express');
var router = express.Router();


module.exports = function(klagobert) {

  router.get('/kb-help', function(req, res) {
    var self = this;
    klagobert.commands.help(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('help');
  });

  router.get('/scoreboard', function(req, res) {
    var self = this;
    console.log(req);
    console.log(req.param('user_name'));
    klagobert.commands.scoreboard(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('scoreboard');
  });

  router.get('/reset-bp', function(req, res) {
    var self = this;
    klagobert.commands.clearScoreboard(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('reset-bp');
  });

  router.get('/top-whines', function(req, res) {
    var self = this;
    klagobert.commands.topWhines(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('top-whines');
  });

  router.get('/last-whine', function(req, res) {
    var self = this;
    klagobert.commands.lastWhine(function(reply) {
      klagobert.sendMessage(reply);
    });
    res.send('top-whines');
  });

  return router;
}