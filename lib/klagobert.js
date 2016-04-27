'use strict'

var Bot = require('slackbots');
var Db = require('./db');
var Sentiment = require('./sentiment');
var util = require('util');
var fs = require('fs');

var Klagobert = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'klagobert';
  this.started = false;
  this.channel = 2;
  this.user = null;
  this.replies = [
    'FUCK OFF!',
    'bajs är gott!',
    'sluta gnälla!',
    'sluta klaga ffs',
    'helvete!',
    'FFS!',
    'WTF'
  ];

  this.db = new Db(this.settings.dbPath);
  this.sentiment = new Sentiment();
};

util.inherits(Klagobert, Bot);

Klagobert.prototype.run = function() {
  Klagobert.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
  this.on('close', this._onClose);
};

Klagobert.prototype._onStart = function() {
  if (!this.started) {
    this._loadBotUser();
    this._welcomeMessage();
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
  if (this._isChatMessage(msg) &&
      this._isChannelConversation(msg) &&
      !this._isFromKlagobert(msg)) {

    if (this._isMentioningKlagobert(msg)) {
      this._selectCommand(msg);
    }

    this._analyzeForSentiment(msg);
  }
};

Klagobert.prototype._selectCommand = function(msg) {
  var self = this;
  var cmd = msg.text.toLowerCase();
  if (cmd.indexOf('/score-board') > -1) {
    self._generateScoreBoardMessage();
  } else if (cmd.indexOf('/me') > -1) {
    console.log('show me');
  }
};

Klagobert.prototype._analyzeForSentiment = function(msg) {
  //TODO: check for whining, calculate bitterpoints, save to db
  var self = this;
  var result = this.sentiment.analyze(msg.text);
  this._calculateBitterPoints(result.score, msg.user, function(bitterPoints) {
    self.db.updateScoreBoard(msg.user, bitterPoints);
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

Klagobert.prototype._welcomeMessage = function() {
  var reply = Math.floor(Math.random() * 6) + 1;
  var members = this.channels[this.channel].members;
  var userId = members[Math.floor(Math.random() * members.length - 1) + 1];
  var user = this._findUserById(userId);

  this.postMessageToChannel(this.channels[this.channel].name, this.replies[reply] + ' @' + user.name, { as_user: true });
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

Klagobert.prototype._generateScoreBoardMessage = function() {
  var self = this;
  var msg = '';
  this.db.getScoreBoard(function(scoreBoard) {
    for (var i = 0; i < scoreBoard.length; i++) {
      var row = scoreBoard[i];
      var user = self._findUserById(row.userId);
      msg += (i+1) + '. ' + user.name + ' | BP: ' + row.points + '\n';
    }
    self._sendMessage(msg);
  });
};

module.exports = Klagobert;
