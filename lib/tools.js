'use strict'

var Tools = function Constructor(users) {
  this.users = users;
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


module.exports = Tools;
