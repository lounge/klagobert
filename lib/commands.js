'use strict'

var util = require('util');

var Commands = function Constructor(db, messages) {
  this.db = db;
  this.messages = messages;
  this.tools = null;
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
    dropUser: {
      cmd: 'drop-user',
      desc: '(/drop-user username) Drops the specified user from scoreboard.',
    },
    giveBp: {
      cmd: 'give-bp',
      desc: '(/give-bp username points) Give bitterpoints to specified user.',
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
  var command = raw.split(' ')[0];
  var param1 = raw.split(' ')[1];
  var param2 = raw.split(' ')[2];
  if (command !== undefined) {
    var cmd = command.toLowerCase().trim();
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
    } else if (cmd.match('(?:^|\s)(' + this.cmds.dropUser.cmd + ')(?=\s|$)')) {
      this.dropUser(param1, callback);
    } else if (cmd.match('(?:^|\s)(' + this.cmds.giveBp.cmd + ')(?=\s|$)')) {
      this.giveBp(user.name, param1, param2, callback);
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

Commands.prototype.dropUser = function(username, callback) {
  this.db.dropUser(username);
  this.messages.userDropped(username, callback);
}

Commands.prototype.giveBp = function(username, receiver, points, callback) {
  var self = this;
  if (isNaN(points) || Number(points) < 0 || username === receiver) {
    self.messages.stopHaxxing(username, callback);
  } else {
    if (receiver.indexOf('<') === 0) {
      receiver = self.tools.findUserById(receiver);
      if (receiver == null || receiver == undefined) {
        self.messages.userDoesNotExist(receiver, callback);
        return;
      }
      receiver = receiver.name;
    }
    self.db.getBitterPointsForUser(receiver, function(currentBitterPoints) {
      if (currentBitterPoints === undefined) {
        self.messages.userDoesNotExist(receiver, callback);
      } else {
        var addon = Number(currentBitterPoints) + Number(points);
        self.db.updateScoreboard(receiver, addon);
        self.messages.giveBp(username, receiver, points, callback);
      }
    });
  }
}

Commands.prototype.imFeelingBitter = function(username, callback) {
  this.messages.imFeelingBitter(username, callback);
}

Commands.prototype.randomReply = function(username, callback) {
  this.messages.randomReply(username, callback);
}

module.exports = Commands;
