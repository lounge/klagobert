'use strict'

var Bot = require('slackbots');
var Tools = require('./tools');
var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;
var TwilioClient = require('twilio');
var platform = os.platform();

var phoneNrs = [];

if(platform === 'win32') {
    var winsay = require('winsay');
}

//TODO: remove after reaction merge
var extend = require('extend');

class Klagobert extends Bot {

  constructor(settings) {
    super(settings);
    this.settings = settings;
    this.settings.name = this.settings.name || 'klagobert';
    this.channelName = this.settings.channelId || 'brewery';
    this.token = this.settings.token;
    this.db = this.settings.db;
    this.messages = this.settings.messages;
    this.commands = this.settings.commands;
    this.sentiment = this.settings.sentiment;
    this.started = false;
    this.user = null;
    this.tools = null;
    this.currentChannel = null;
    this.zunkas = 'zunkas';
  }

  run() {
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
    this.on('close', this._onClose);
  }

  _onStart() {
    var self = this;
    this.twilio = TwilioClient(this.settings.twilioAcc, this.settings.twilioApiKey);
    this.tools = new Tools(this.users);
    this.commands.tools = this.tools;
    this.messages.tools = this.tools;
    this.currentChannel = this._getCurrentChannel();

    if (!this.started) {
      this._loadBotUser();
      this._welcomeMessage();
    }

    this.started = true;
  }

  _onClose() {
    // this.messages.goodbye(function(msg) {
    //   this.sendMessage(msg);
    // });

    this.db.close();
    this.started = false;
  }

  _onMessage(data) {
    this._analyzeMessage(data);
  }

  _loadBotUser() {
    this.user = this.tools.findUserByName(this.settings.name);
  }

  _welcomeMessage() {
    var self = this;
    this.messages.welcome(function(msg, data) {
      self.sendMessage(msg, data);
    });

  
  }

  _analyzeMessage(data) {
    var self = this;
    if (this._isChatMessage(data)) {
      var msgContent = this._getMessageContent(data);
      var user = this._getMessageUser(data);
      if (this._isChannelConversation(data) && !this._isFromKlagobert(user.id)) {
          if (this._isMentioningKlagobert(msgContent)) {
            this.commands.selectCommand(msgContent, user, function(msg, data) {
              self.sendMessage(msg, data);
            });
          }
          this._analyzeSentiment(msgContent, data.ts, user);
          this._containsKau(msgContent);
      }
    }
  }

  _analyzeSentiment(msgContent, timestamp, user) {
    msgContent = msgContent.trim();
    var result = this.sentiment.analyze(msgContent);
    this._calculateBitterPoints(result.comparative, msgContent, timestamp, user.name,
                                this._negativeScore.bind(this),
                                this._positiveScore.bind(this));
  }

  _calculateBitterPoints(score, msg, timestamp, username, negCallback, posCallback) {
    var self = this;
    this.db.getBitterPointsForUser(username, function(currentBitterPoints) {
      if (currentBitterPoints === undefined) {
        currentBitterPoints = 0;
      }

      if (score < 0) {
        var addon = Math.abs((Math.round((score + 0.00001) * 100) / 100));

        // Zunkas_addon_score
        // if (username === self.zunkas) {
        //   console.log('ZUNKAS PRE. score: ' + addon);
        //   addon = (addon * self.zunkasAddon);
        //   console.log('ZUNKAS POST. score: ' + addon);
        // }

        negCallback(username, msg, timestamp, currentBitterPoints, addon);
      } else {
        // if (username === self.zunkas) {
        //   console.log('ZUNKAS pos, return');
        //   return;
        // }
        // console.log('[positive] user: ' +  username + ' msg: ' + msg + ' bp: ' + score);
        var newVal = currentBitterPoints - score;
        var bitterPoints = Math.round((newVal + 0.00001) * 100) / 100;
        posCallback(username, bitterPoints, msg);
      }
    });
  }

  _negativeScore(username, msg, timestamp, bp, addon) {
    var self = this;
    this._calculateWhineStreak(username, timestamp, function(streak) {
      var score = bp;
      if (streak >= 6) {
        score += (addon * (streak - 4));
      } else if (streak > 1) {
        score += (addon * parseFloat('1.' + streak));
      }  else {
        score += addon;
      }
      self.db.updateScoreboard(username, score);
    });

    this._calculateWhineScore(msg);
    this.db.saveLastWhineForUser(username, msg);
  }

  _positiveScore(username, bitterPoints, msg) {
    var isPositiveHack = this.tools.checkPositiveHack(username, msg);
    if (!isPositiveHack) {
      this.db.updateScoreboard(username, bitterPoints);
      this.db.clearWhineStreak(username);
    }
  }

  _calculateWhineScore(whine) {
    var self = this;
    var parsedWhine = whine.toLowerCase();
    this.db.getWhineScore(parsedWhine, function(score) {
      self.db.saveWhineScore(parsedWhine, score + 1);
    });
  }

  _calculateWhineStreak(username, timestamp, callback) {
    var self = this;
    this.db.getWhineStreak(username, function(streak) {
      var currentStreak = streak + 1;
      if (currentStreak > 1) {
        self._sendReaction(timestamp, currentStreak)

        self.messages.getStreak(currentStreak, username, function(msg) {
          self.sendMessage('@' + username + ' ' + msg);
        });
      }

      self.db.saveWhineStreak(username, currentStreak);
      callback(currentStreak);
    });
  }

  _isChatMessage(msg) {
    return msg.type === 'message' && (Boolean(msg.text) || (Boolean(msg.message) && Boolean(msg.message.text)));
  }

  _getMessageContent(msg) {
    console.log(msg);
    if (Boolean(msg.text)) {
      return msg.text;
    }
    // Removed Edit message hack
    // else if (Boolean(msg.message.text)) {
    //   return msg.message.text;
    // }
  }

  _getMessageUser(msg) {
    var userId;
    if (Boolean(msg.user)) {
      userId = msg.user;
    } else if (Boolean(msg.message.user)) {
      userId = msg.message.user;
    }

    return this.tools.findUserById(userId);
  }

  _isChannelConversation(msg) {
    return (typeof msg.channel === 'string' && (msg.channel[0] === 'C' || msg.channel[0] === 'G')) ;
  }

  _isMentioningKlagobert(msgContent) {
    return msgContent.toUpperCase().indexOf(this.user.id) > -1 || msgContent.toLowerCase().indexOf(this.user.name) > -1;
  }

  _isFromKlagobert(userId) {
    return userId === this.user.id;
  }

  _containsKau(msgContent) {
    var self = this;
    var m = msgContent.toLowerCase();
    if (m.indexOf('kau') > -1  || m.indexOf('mikael') > -1) {
      this.messages.kau(function(msg) {
        self.sendMessage(msg);
        // self.postCommandToChannel(self.currentChannel.id, msg, command, {
        //   token: 'xoxp-19975683649-19975217044-399272225155-4d190d54b3e6ff4b45b4bda99540ffc9',
        //   as_user: true
        // });
      });
    }
  }

  _sendReply(userId) {
    var user = this.tools.findUserById(userId);
    if (user !== null) {
      //TODO: send reply msg
    }
  }

  _getCurrentChannel() {
    var self = this;
    var channel = this.channels.filter(function (channel) {
        if (channel.name === self.channelName) {
          return channel;
        }
    })[0];

    return channel;
  }

  _sendReaction(timestamp, streak) {
    var self = this;
    this.messages.getReaction(streak, function(emoji) {
      self.postReactionToChannel(self.currentChannel.id, emoji, timestamp, {});
    });

  }

  _speakMessage(msg) {
    if(platform === 'win32') {
      winsay.speak("null", msg);
    } else if(platform === 'linux') {
      exec('espeak ' + msg);
    } else {
      exec('say ' + msg);
    }
  }

  _sendSms(msg) {
    var self = this;

    for (var i = 0; i < phoneNrs.length; i++) {
      var nr = phoneNrs[i];
      self.twilio.messages.create({
        to: nr,
        from: '+12564724958',
        body: msg,
     }, function (err, message) {
        // console.log(message.sid);
     });
    }
   
  }

  sendMessage(msg, data) {
    var attachments = [];

    if (data != null) {
      attachments.push({
          'color': '#'+Math.floor(Math.random()*16777215).toString(16),
          'title': data.title,
          'text': data.message
        });
    }

    this.postMessageToChannel(this.currentChannel.name, msg,
      {
        as_user: true,
        unfurl_media: true,
        attachments: attachments
      })
      .fail(function(data) {
        console.log(data);
      });
  }











  //TODO: Remove after these functions are merged to Slackbot npm


  /**
   * Posts a message to a channel by ID
   * @param {string} id - channel ID
   * @param {string} text
   * @param {object} params
   * @returns {vow.Promise}
   */
  postCommandToChannel(id, text, command, params) {
      params = extend({
          text: text,
          channel: id,
          command: command
      }, params || {});

      console.log('postCommandToChannel() ' + 'id: ' + id + ' command: ' + command + ' text: ' + text +  ' params: ' + JSON.stringify(params));
      return this._api('chat.command', params);
  }

    /**
  * Posts a reaction (emoji) to a message by timestamp
  * @param {string} id - channel ID
  * @param {string} emoji - emoji string (without the : symbols)
  * @param {string} ts - timestamp of the message you want to react to
  * @param {object} params
  * @returns {vow.Promise}
  */
  postReactionToChannel(id, emoji, ts, params) {
    params = extend({
        channel: id,
        name: emoji,
        timestamp: ts
    }, params || {});

    return this._api('reactions.add', params);
  }

  /**
  * Removes a reaction (emoji) by timestamp
  * @param {string} id - channel ID
  * @param {string} emoji - emoji string (without the : symbols)
  * @param {string} ts - timestamp of the message you want to react to
  * @param {object} params
  * @returns {vow.Promise}
  */
  removeReactionFromChannel(id, emoji, ts, params) {
    params = extend({
        channel: id,
        name: emoji,
        timestamp: ts
    }, params || {});

    return this._api('reactions.remove', params);
  }

  /**
  * Returns a list of all reactions for a message (specified by timestamp)
  * @param {string} id - channel ID
  * @param {string} ts - timestamp of the message
  * @param {object} params
  * @returns {vow.Promise}
  */
  getReactions(id, ts, params) {
    params = extend({
        channel: id,
        timestamp: ts
    }, params || {});

    return this._api('reactions.get', params);
  }

  /**
  * Returns a list of all items reacted to by a user
  * @param {string} id - user ID
  * @param {object} params
  * @returns {vow.Promise}
  */
  listReactions(id, ts, params) {
    params = extend({
        user: id
    }, params || {});

    return this._api('reactions.list', params);
  }
}

module.exports = Klagobert;