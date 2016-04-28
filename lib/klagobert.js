'use strict'

var Bot = require('slackbots');
var Db = require('./db');
var Sentiment = require('./sentiment');
var Commands = require('./commands');
var Messages = require('./messages');
var util = require('util');
var fs = require('fs');

var Klagobert = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'klagobert';
  this.channel = this.settings.channelId || 2;
  this.started = false;
  this.user = null;
};

util.inherits(Klagobert, Bot);

Klagobert.prototype.run = function() {
  Klagobert.super_.call(this, this.settings);

  // for (var param in Bot) {
  //   console.log(param);
  // }

  this.db = new Db(this.settings.dbPath);
  this.messages = new Messages(this.db);
  this.commands = new Commands(this.db, this.messages);
  this.sentiment = new Sentiment();

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
  this.on('close', this._onClose);

  // this.messages.init();
};

Klagobert.prototype._onStart = function() {
  var self = this;
  if (!this.started) {
    this._loadBotUser();
    this.messages.welcome(function(msg) {
      self._sendMessage(msg);
    });
  }
  this.started = true;
};

Klagobert.prototype._onClose = function() {
  this.db.close();
  this.started = false;
};

Klagobert.prototype._onMessage = function(msg) {
  this._analyzeMessage(msg);
};

Klagobert.prototype._loadBotUser = function() {
    this.user = this._findUserByName(this.name);
};

Klagobert.prototype._findUserByName = function(username) {
    var self = this;
    var user = this.users.filter(function (user) {
        if (user.name === username) {
          return user;
        }
    })[0];

    return user;
};

Klagobert.prototype._findUserById = function(userId) {
    var user = this.users.filter(function (user) {
      if (user.id === userId) {
        return user;
      }
    })[0];

    return user;
};

Klagobert.prototype._analyzeMessage = function(msg) {
  var self = this;
  if (this._isChatMessage(msg) &&
      this._isChannelConversation(msg) &&
      !this._isFromKlagobert(msg)) {

    if (this._isMentioningKlagobert(msg)) {
      this.commands.selectCommand(msg, function(reply) {
        self._sendMessage(reply);
      });
    }

    this._analyzeForSentiment(msg);
  }
};

Klagobert.prototype._analyzeForSentiment = function(msg) {
  //TODO: check for whining, calculate bitterpoints, save to db
  var self = this;
  var result = this.sentiment.analyze(msg.text);
  var user = this._findUserById(msg.user);
  this._calculateBitterPoints(result.score, user.name, function(bitterPoints) {
    self.db.updateScoreBoard(user.name, bitterPoints);
  });
};

Klagobert.prototype._calculateBitterPoints = function(score, user, callback) {
  this.db.getBitterPointsForUser(user, function(currentBitterPoints) {
    if (score < 0) {
      callback(currentBitterPoints + Math.abs(score));
    } else {
      callback(currentBitterPoints);
    }
  });
}

Klagobert.prototype._isChatMessage = function(msg) {
    return msg.type === 'message' && Boolean(msg.text);
};

Klagobert.prototype._isChannelConversation = function(msg) {
    return typeof msg.channel === 'string' && msg.channel[0] === 'C';
};

Klagobert.prototype._isMentioningKlagobert = function(msg) {
    return msg.text.toUpperCase().indexOf(this.user.id) > -1 || msg.text.toLowerCase().indexOf(this.user.name) > -1;
};

Klagobert.prototype._isFromKlagobert = function (msg) {
    return msg.user === this.user.id;
};

Klagobert.prototype._sendReply = function(userId) {
    var user = this._findUserById(userId);
    if (user !== null) {
      //TODO: send reply msg
    }
};

Klagobert.prototype._sendMessage = function(msg) {
  this.postMessageToChannel(this.channels[this.channel].name, msg, { as_user: true });
};





module.exports = Klagobert;
