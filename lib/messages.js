var util = require('util');

var Messages = function Constructor(db) {
  this.db = db;
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

Messages.prototype.scoreboard = function(callback) {
  var self = this;
  var msg = '';
  this.db.getScoreboard(function(scoreboard) {
    var sorted = scoreboard.reverse();
    for (var i = 0; i < sorted.length; i++) {
      var row = scoreboard[i];
      msg += (i+1) + '. ' + row.user + ' | BP: ' + row.points + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.scoreboardCleard = function(callback) {
  var msg = 'Bitter Points reset';
  callback(msg);
};



Messages.prototype.welcome = function(callback) {
  var reply = Math.floor(Math.random() * 6) + 1;
  var msg = this.replies[reply];
  callback(msg);
};

module.exports = Messages;
