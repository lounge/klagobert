'use strict'

var Bot = require('slackbots');
var util = require('util');
var fs = require('fs');

var Klagobert = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'klagobert';
  this.channel = this.settings.channelId || 2;
  this.db = this.settings.db;
  this.messages = this.settings.messages;
  this.commands = this.settings.commands;
  this.sentiment = this.settings.sentiment;
  this.started = false;
  this.user = null;
  this.zunkas = 'lounge';
};

util.inherits(Klagobert, Bot);

Klagobert.prototype.run = function() {
  Klagobert.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
  this.on('close', this._onClose);
};

Klagobert.prototype._onStart = function() {
  var self = this;
  if (!this.started) {
    this._loadBotUser();
    this.messages.welcome(function(msg) {
      self.sendMessage(msg);
    });
  }
  this.started = true;
};

Klagobert.prototype._onClose = function() {
  this.messages.goodbye(function(msg) {
    self.sendMessage(msg);
  });

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
    var user = this._getMessageUser(msg);
    if (this._isChannelConversation(msg) && !this._isFromKlagobert(user.id)) {
        if (this._isMentioningKlagobert(msgContent)) {
          this.commands.selectCommand(msgContent, user, function(reply) {
            self.sendMessage(reply);
          });
        } else {
          this._analyzeSentiment(msgContent, user);
        }
      }
    }
  };

Klagobert.prototype._analyzeSentiment = function(msgContent, user) {
  var result = this.sentiment.analyze(msgContent);
  this._calculateBitterPoints(result.comparative, user.name, msgContent,
                              this._negativeScore.bind(this),
                              this._positiveScore.bind(this));
};

Klagobert.prototype._calculateBitterPoints = function(score, username, msg, negCallback, posCallback) {
  var self = this;
  this.db.getBitterPointsForUser(username, function(currentBitterPoints) {
    if (score < 0) {
      var addon = Math.abs((Math.round((score + 0.00001) * 100) / 100));

      // Zunkas_addon_score
      if (username === self.zunkas) {
        addon = (addon * 2);
      }

      negCallback(username, msg, currentBitterPoints, addon);
    } else {
      
      // Zunkas_negative_score
      var bitterPoints = currentBitterPoints - Math.abs((Math.round((score + 0.00001) * 100) / 100));
      posCallback(username, bitterPoints);
    }
  });
}

Klagobert.prototype._negativeScore = function(username, msg, bp, addons) {
  var self = this;
  this._calculateWhineStreak(username, function(streak) {
    var score = bp + (addons * streak);
    self.db.updateScoreboard(username, score);
  });

  this._calculateWhineScore(msg);
  this.db.saveLastWhineForUser(username, msg);
}

Klagobert.prototype._positiveScore = function(username, bitterPoints) {
  this.db.updateScoreboard(username, bitterPoints);
  this.db.clearWhineStreak(username);
}

Klagobert.prototype._calculateWhineScore = function(whine) {
  var self = this;
  var parsedWhine = whine.toLowerCase();
  this.db.getWhineScore(parsedWhine, function(score) {
    self.db.saveWhineScore(parsedWhine, score + 1);
  });
}

Klagobert.prototype._calculateWhineStreak = function(username, callback) {
  var self = this;
  this.db.getWhineStreak(username, function(currentStreak) {
        var streak = currentStreak + 1;
        if (streak > 1) {
          self.messages.getStreak(streak, username, function(msg) {
            self.sendMessage(msg);
          });
        }
        self.db.saveWhineStreak(username, streak);
        callback(streak);
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
    var userId;
    if (Boolean(msg.user)) {
      userId = msg.user;
    } else if (Boolean(msg.message.user)) {
      userId = msg.message.user;
    }

    return this._findUserById(userId);
};

Klagobert.prototype._isChannelConversation = function(msg) {
    return (typeof msg.channel === 'string' && (msg.channel[0] === 'C' || msg.channel[0] === 'G')) ;
};

Klagobert.prototype._isMentioningKlagobert = function(msgContent) {
    return msgContent.toUpperCase().indexOf(this.user.id) > -1 || msgContent.toLowerCase().indexOf(this.user.name) > -1;
};

Klagobert.prototype._isFromKlagobert = function (userId) {
    return userId === this.user.id;
};

Klagobert.prototype._sendReply = function(userId) {
    var user = this._findUserById(userId);
    if (user !== null) {
      //TODO: send reply msg
    }
};

Klagobert.prototype.sendMessage = function(msg) {
  // console.log(this.channels);
  this.postMessageToChannel(this.channels[this.channel].name, msg, { as_user: true });
};

module.exports = Klagobert;
