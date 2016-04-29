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
  
  this.db = new Db(this.settings.dbPath);
  this.messages = new Messages(this.db);
  this.commands = new Commands(this.db, this.messages);
  this.sentiment = new Sentiment();

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
  this.on('close', this._onClose);
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
  if (this._isChatMessage(msg)) {
    var msgContent = this._getMessageContent(msg);
    var msgUser = this._getMessageUser(msg);
    if (this._isChannelConversation(msg) && !this._isFromKlagobert(msgUser)) {
        if (this._isMentioningKlagobert(msgContent)) {
          this.commands.selectCommand(msgContent, function(reply) {
            self._sendMessage(reply);
          });
        } else {
          this._analyzeForSentiment(msgContent, msgUser);
        }
    }
  }
};

Klagobert.prototype._analyzeForSentiment = function(msgContent, msgUser) {
  //TODO: check for whining, calculate bitterpoints, save to db
  var self = this;
  var result = this.sentiment.analyze(msgContent);
  var user = this._findUserById(msgUser);
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
    return msg.type === 'message' && (Boolean(msg.text) || Boolean(msg.message.text));
};

Klagobert.prototype._getMessageContent = function(msg) {
    if (Boolean(msg.text)) {
      return msg.text;
    } else if (Boolean(msg.message.text)) {
      return msg.message.text;
    }
};

Klagobert.prototype._getMessageUser = function(msg) {
    if (Boolean(msg.user)) {
      return msg.user;
    } else if (Boolean(msg.message.user)) {
      return msg.message.user;
    }
};

Klagobert.prototype._isChannelConversation = function(msg) {
    return typeof msg.channel === 'string' && msg.channel[0] === 'C';
};

Klagobert.prototype._isMentioningKlagobert = function(msgContent) {
    return msgContent.toUpperCase().indexOf(this.user.id) > -1 || msgContent.toLowerCase().indexOf(this.user.name) > -1;
};

Klagobert.prototype._isFromKlagobert = function (msgUser) {
    return msgUser === this.user.id;
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
