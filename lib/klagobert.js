'use strict'

var Bot = require('slackbots');
var util = require('util');
var fs = require('fs');

var Klagobert = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'klagobert';
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
};

util.inherits(Klagobert, Bot);


Klagobert.prototype.run = function() {
  Klagobert.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

Klagobert.prototype._onStart = function() {
  this._loadBotUser();
  this._welcomeMessage();
};

Klagobert.prototype._onMessage = function(msg) {
  if (this._analyzeMessage(msg)) {
    this._sendReply(msg.user);
  }
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
  if (
      this._isChatMessage(msg) &&
      this._isChannelConversation(msg) &&
      this._isMentioningKlagobert(msg) &&
      !this._isFromKlagobert(msg)
    ) {
        return true;
      }

      return false;
};

Klagobert.prototype._isChatMessage = function(msg) {
    return msg.type === 'message' && Boolean(msg.text);
};

Klagobert.prototype._isChannelConversation = function(msg) {
    return typeof msg.channel === 'string' && msg.channel[0] === 'C';
};

Klagobert.prototype._isMentioningKlagobert = function(msg) {
  // console.log('_isMentioningKlagobert: ' + msg.text);
    return msg.text.toUpperCase().indexOf(this.user.id) > -1 || msg.text.toLowerCase().indexOf(this.user.name) > -1;
};

Klagobert.prototype._isFromKlagobert = function (msg) {
    return msg.user === this.user.id;
};



Klagobert.prototype._welcomeMessage = function() {
  this.postMessageToChannel(this.channels[this.channel].name, 'Klagobert är här! Börja inte gråta nu...', { as_user: true });
};

Klagobert.prototype._sendReply = function(userId) {
    // this.getUser(userId)
    // .then(function(data) {
    //   this.postMessageToChannel(this.channels[this.channel].name, '@' + data.name + ' FUCK OFF!', { as_user: true });
    // })
    // .fail(function(data) {
    //   console.log('error msg: ' + JSON.stringify(data));
    // })
    // .always(function(data) {
    //   console.log('always');
    // });
    var user = this._findUserById(userId);
    if (user !== null) {
      var reply = Math.floor(Math.random() * 6) + 1;
      console.log(reply);
      this.postMessageToChannel(this.channels[this.channel].name, this.replies[reply] + ' @' + user.name , { as_user: true });
    }
};




module.exports = Klagobert;
