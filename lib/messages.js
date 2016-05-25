'use strict'

var util = require('util');

var Messages = function Constructor(db, sentiment) {
  this.db = db;
  this.sentiment = sentiment;
  this.replies = [
    'FUCK OFF!',
    'bajs är gott!',
    'sluta gnälla!',
    'sluta klaga ffs...',
    'helvete!',
    'släpp sargen...',
    'börja agera nu för fan!',
    'FFS!',
    'WTF!',
    'ägd',
    'fy fan'
  ];
  this.goodbyes = [
    'Nä nu blev jag jag lack, jag bangar den här skiten...',
    'Ses sen era as!',
    'See you later mother fuckers!'
  ];
  this.streaks = [
    'Double whine!',
    'Multi whine!',
    'Mega whine!',
    'Ultra whine!',
    'Monster whine!',
    'Ludicrous whine!',
    'HOLY S**T'
  ]
};

Messages.prototype.help = function(cmds, callback) {
  var msg = '';
  for (var cmd in cmds) {
      if (!cmds.hasOwnProperty(cmd)) continue;
      var obj = cmds[cmd];
      msg += '/' + obj.cmd + ' | ' +  obj.desc + '\n';
  }
  callback(msg);
};

Messages.prototype.welcome = function(callback) {
  var reply = Math.floor(Math.random() * this.replies.length);
  var msg = this.replies[reply];
  callback(msg);
};

Messages.prototype.goodbye = function(callback) {
  var reply = Math.floor(Math.random() * this.goodbyes.length);
  var msg = this.goodbyes[reply];
  callback(msg);
};

Messages.prototype.topWhines = function(callback) {
  var self = this;
  var msg = '';
  this.db.getTopWhines(function(topWhines) {
    for (var i = 0; i < topWhines.length; i++) {
      var row = topWhines[i];
      msg += (i+1) + '. ' + row.whine + ' | score: ' + row.score + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.scoreboard = function(callback) {
  var self = this;
  var msg = '';
  this.db.getScoreboard(function(scoreboard) {
    for (var i = 0; i < scoreboard.length; i++) {
      var row = scoreboard[i];
      msg += (i+1) + '. ' + row.user + ' | BP: ' + row.points + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.scoreboardCleard = function(user, callback) {
  var msg = '<- @' + user + ' Cleared the Bitter Points ->';
  callback(msg);
};

Messages.prototype.lastWhineForUser = function(user, callback) {
  var self = this;
  var msg = 'The last whine for @' + user + ' was ';
  this.db.getLastWhineForUser(user, function(whine) {
    callback(msg + '"' + whine + '"');
  });
};

Messages.prototype.getStreak = function(streak, user, callback) {
  var msg = '';
  if (streak >= this.streaks.length - 1) {
    msg = '@' + user + ' ' + this.streaks[this.streaks.length - 1];
  } else {
    msg = '@' + user + ' ' + this.streaks[streak - 2];
  }
  callback(msg);
};

Messages.prototype.imFeelingBitter = function(user, callback) {
  var word = this.sentiment.getRandomNegativeWord();
  var msg = '@' + user + ' här får du lite att läsa din bittra jävel. ' + 'https://www.google.com/search?q=' + word;
  callback(msg);
}

Messages.prototype.randomReply = function(user, callback) {
  var reply = Math.floor(Math.random() * this.replies.length);
  var msg = this.replies[reply] + ' @' + user;
  callback(msg);
}



module.exports = Messages;
