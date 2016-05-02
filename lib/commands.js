var util = require('util');

var Commands = function Constructor(db, messages) {
  this.db = db;
  this.messages = messages;
  this.cmds = {
    help: {
      cmd: 'help',
      desc: 'Lists available commands.',
    },
    scoreboard: {
      cmd: 'scoreboard',
      desc: 'Shows the scoreboard over top whiners.',
    },
    resetBp: {
      cmd: 'reset-bp',
      desc: 'Resets bitter points on scoreboard.',
    },
    topWhines: {
      cmd: 'top-whines',
      desc: 'Lists the top 10 whines.',
    },
    lastWhine: {
      cmd: 'last-whine',
      desc: 'Show your last whine.',
    }
  }
};

Commands.prototype.selectCommand = function(msgContent, user, callback) {
  var self = this;
  var raw = msgContent.split('/')[1]
  if (raw === undefined) {
    this.messages.randomReply(user.name, callback);
  } else  {
    var cmd = raw.toLowerCase();
    if (cmd.match('(?:^|\s)(' + this.cmds.help.cmd + ')(?=\s|$)')) {
      this.messages.help(this.cmds, callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.scoreboard.cmd + ')(?=\s|$)')) {
      this.messages.scoreboard(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.resetBp.cmd + ')(?=\s|$)')) {
      this.db.clearScoreboard();
      this.messages.scoreboardCleard(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.topWhines.cmd + ')(?=\s|$)')) {
      this.messages.topWhines(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.lastWhine.cmd + ')(?=\s|$)')) {
      this.messages.lastWhineForUser(callback, user.name);
    } else if (cmd.match('(?:^|\s)(me)(?=\s|$)')) {
    } else {
      this.messages.randomReply(user.name, callback);
    }
  }


  // switch (true) {
  //   case /scoreboard/.test(cmd):
  //   console.log('match');
  //   break;
  // }
};

module.exports = Commands;
