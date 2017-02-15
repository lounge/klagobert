'use strict'

class Commands {

  constructor(db, messages) {
    this.db = db;
    this.messages = messages;
    this.tools = null;
    this.cmds = {
      help: {
        cmd: 'help',
        desc: 'Lists available commands.',
      },
      ping: {
        cmd: 'ping',
        desc: 'Pong?',
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
        desc: '(/drop-user username) Drops the specified user from scoreboard. (Temporarily down)',
      },
      giveBp: {
        cmd: 'give-bp',
        desc: '(/give-bp username points) Give bitterpoints to specified user. (Max 5bp)',
      },
      imFeelingBitter: {
        cmd: 'im-feeling-bitter',
        desc: 'Random search on bitternes.',
      },
      kek: {
        cmd: 'kek',
        desc: 'kek?',
      },
    }
  }

  selectCommand(msgContent, user, callback) {
    var self = this;

    var msg = msgContent.split('>')[1];
    msg = msg.trim();

    console.log(msg);
    console.log(msg.indexOf('/'));

    if (msg.indexOf('/') === 0) {
      var raw = msg.split('/')[1]
      var command = raw.split(' ')[0];
      var param1 = raw.split(' ')[1];
      var param2 = raw.split(' ')[2];
      if (command !== undefined) {
        var cmd = command.toLowerCase().trim();
        if (cmd.match('(?:^|\s)(' + this.cmds.help.cmd + ')(?=\s|$)')) {
          this.help(callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.ping.cmd + ')(?=\s|$)')) {
          this.ping(callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.scoreboard.cmd + ')(?=\s|$)')) {
          this.scoreboard(callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.resetBp.cmd + ')(?=\s|$)')) {
          this.clearScoreboard(user.name, callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.topWhines.cmd + ')(?=\s|$)')) {
          this.topWhines(callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.lastWhine.cmd + ')(?=\s|$)')) {
          this.lastWhine(user.name, callback);
        }
        else if (cmd.match('(?:^|\s)(' + this.cmds.dropUser.cmd + ')(?=\s|$)')) {
          this.dropUser(param1, callback);
        }
        else if (cmd.match('(?:^|\s)(' + this.cmds.imFeelingBitter.cmd + ')(?=\s|$)')) {
          this.imFeelingBitter(user.name, callback);
        }  else if (cmd.match('(?:^|\s)(' + this.cmds.kek.cmd + ')(?=\s|$)')) {
          this.kek(user.name, callback);
        } else if (cmd.match('(?:^|\s)(' + this.cmds.giveBp.cmd + ')(?=\s|$)')) {
          this.giveBp(user.name, param1, param2, callback);
        } else if (cmd.match('(?:^|\s)(me)(?=\s|$)')) {
          //TODO: /me
        } else {
          this.stopHaxxing(user.name, callback);
        }
      }
    } else {
      this.askCleverBot(callback, msgContent);
    }
  }

  help(callback) {
    this.messages.help(this.cmds, callback);
  }

  ping(callback) {
    this.messages.ping(callback);
  }

  scoreboard(callback) {
    this.messages.scoreboard(callback);
  }

  clearScoreboard(username, callback) {
    // this.db.clearScoreboard();
    this.messages.scoreboardCleard(username, callback);
  }

  topWhines(callback) {
    this.messages.topWhines(callback);
  }

  lastWhine(username, callback) {
    this.messages.lastWhineForUser(username, callback);
  }

  dropUser(username, callback) {
    // this.db.dropUser(username);
    this.messages.userDropped(username, callback);
  }

  imFeelingBitter(username, callback) {
    this.messages.imFeelingBitter(username, callback);
  }

  kek(username, callback) {
    this.messages.kek(username, callback);
  }

  wrongCommand(username, callback) {
    this.messages.wrongCommand(username, callback);
  }

  stopHaxxing(username, callback) {
    this.messages.stopHaxxing(username, callback);
  }

  askCleverBot(callback, question) {
    console.log('COMMANDS: question to cleverbot: ' + question);
    this.messages.askCleverBot(callback, question);
  }

  giveBp(username, receiver, points, callback) {
    var self = this;
    if (isNaN(points) || Number(points) < 0 || username === receiver) {
      self.messages.stopHaxxing(username, callback);
    }
    // Only allow 5 bp
    else if(points <= 5) {
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
}

module.exports = Commands;
