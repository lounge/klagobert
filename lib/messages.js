var util = require('util');

var Messages = function Constructor(db) {
  this.db = db;
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

Messages.prototype.scoreboardCleard = function(callback) {
  var msg = '<- Bitter Points Cleared ->';
  callback(msg);
};

Messages.prototype.lastWhineForUser = function(callback, user) {
  var self = this;
  var msg = 'The last whine for @' + user + ' was ';
  this.db.getLastWhineForUser(user, function(whine) {
    callback(msg + '"' + whine + '"');
  });
};

Messages.prototype.randomReply = function(msgUser, callback) {
  var reply = Math.floor(Math.random() * this.replies.length);
  var msg = this.replies[reply] + ' @' + msgUser;
  callback(msg);
}

module.exports = Messages;
