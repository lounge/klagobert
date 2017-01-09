'use strict'

class Tools {

  constructor(users) {
    this.users = users;
    this.msgCache = {};

    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
      };
    }
  }

  findUserByName(username) {
      var self = this;
      var user = this.users.filter(function (user) {
          if (user.name === username) {
            return user;
          }
      })[0];

      return user;
  }

  findUserById(userId) {
      userId = userId.replace('<', '').replace('>', '').replace('@', '');
      var user = this.users.filter(function (user) {
        if (user.id === userId) {
          return user;
        }
      })[0];

      return user;
  }

  checkPositiveHack(username, msg) {
    var positiveHack = false;
    var cacheCount = 0;
    var cache = this.msgCache[username];
    if (cache != null) {
      for (var i = 0; i < cache.length; i++) {
        if (cache[i] === msg) {
          positiveHack = true;
          break;
        }
      }
      cache.push(msg);
      if (cache.length > 2) {
        cache.pop();
      }
    } else {
      this.msgCache[username] = [];
      this.msgCache[username].push(msg);
    }

    return positiveHack;
  }
}

module.exports = Tools;
