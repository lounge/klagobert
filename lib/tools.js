'use strict'

var Tools = function Constructor(users) {
  this.users = users;
  this.msgCache = {};
}

Tools.prototype.findUserByName = function(username) {
    var self = this;
    var user = this.users.filter(function (user) {
        if (user.name === username) {
          return user;
        }
    })[0];

    return user;
};

Tools.prototype.findUserById = function(userId) {
    userId = userId.replace('<', '').replace('>', '').replace('@', '');
    var user = this.users.filter(function (user) {
      if (user.id === userId) {
        return user;
      }
    })[0];

    return user;
};

Tools.prototype.checkPositiveHack = function(username, msg) {
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


module.exports = Tools;
