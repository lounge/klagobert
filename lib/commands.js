'use strict'

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
    },
    imFeelingBitter: {
      cmd: 'im-feeling-bitter',
      desc: 'Random search on bitternes.',
    },
  }
};

Commands.prototype.selectCommand = function(msgContent, user, callback) {
  var self = this;
  var raw = msgContent.split('/')[1]
  if (raw !== undefined) {
    var cmd = raw.toLowerCase().trim();
    if (cmd.match('(?:^|\s)(' + this.cmds.help.cmd + ')(?=\s|$)')) {
      this.help(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.scoreboard.cmd + ')(?=\s|$)')) {
      this.scoreboard(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.resetBp.cmd + ')(?=\s|$)')) {
      this.clearScoreboard(user.name, callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.topWhines.cmd + ')(?=\s|$)')) {
      this.topWhines(callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.lastWhine.cmd + ')(?=\s|$)')) {
      this.lastWhine(user.name, callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.imFeelingBitter.cmd + ')(?=\s|$)')) {
      this.imFeelingBitter(user.name, callback);
    } else if (cmd.match('(?:^|\s)(me)(?=\s|$)')) {
    } else {
      this.randomReply(user.name, callback);
    }
  }
};

Commands.prototype.help = function(callback) {
  this.messages.help(this.cmds, callback);
}

Commands.prototype.scoreboard = function(callback) {
  this.messages.scoreboard(callback);
}

Commands.prototype.clearScoreboard = function(username, callback) {
  this.db.clearScoreboard();
  this.messages.scoreboardCleard(username, callback);
}

Commands.prototype.topWhines = function(callback) {
  this.messages.topWhines(callback);
}

Commands.prototype.lastWhine = function(username, callback) {
  this.messages.lastWhineForUser(username, callback);
}

Commands.prototype.imFeelingBitter = function(username, callback) {
  this.messages.imFeelingBitter(username, callback);
}

Commands.prototype.randomReply = function(username, callback) {
  this.messages.randomReply(username, callback);
}

module.exports = Commands;
