var util = require('util');

var Commands = function Constructor(db, messages) {
  this.db = db;
  this.messages = messages;
};

Commands.prototype.selectCommand = function(msg, callback) {
  var self = this;
  var cmd = msg.text.toLowerCase();
  console.log(msg);
  if (cmd.indexOf('/score-board') > -1) {
    self.messages.scoreBoard(callback);
  } else if (cmd.indexOf('/me') > -1) {
  }
};

module.exports = Commands;
