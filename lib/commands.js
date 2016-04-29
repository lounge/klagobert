var util = require('util');

var Commands = function Constructor(db, messages) {
  this.db = db;
  this.messages = messages;
};

Commands.prototype.selectCommand = function(msgContent, callback) {
  var self = this;
  var raw = msgContent.split('/')[1]
  if (raw === null)
    return

  var cmd = raw.toLowerCase();
  if (cmd.match('(?:^|\s)(scoreboard)(?=\s|$)')) {
    self.messages.scoreboard(callback);
  } else if (cmd.match('(?:^|\s)(reset-bp)(?=\s|$)')) {
  } else if (cmd.match('(?:^|\s)(top-whine)(?=\s|$)')) {
  } else if (cmd.match('(?:^|\s)(last-whine)(?=\s|$)')) {
  } else if (cmd.match('(?:^|\s)(me)(?=\s|$)')) {
  }
  // switch (true) {
  //   case /scoreboard/.test(cmd):
  //   console.log('match');
  //   break;
  // }
};

module.exports = Commands;
