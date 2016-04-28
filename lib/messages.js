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

 // util.inherits(Messages, Klagobert);
// Messages.prototype.init = function() {
//   util.inherits(Messages, this.bot);
//   //
//   for (var param in this.bot) {
//     console.log(param);
//   }
//   //
//   Messages.super_.call(this, this.settings);
// };
//

Messages.prototype.scoreBoard = function(callback) {
  var self = this;
  var msg = '';
  this.db.getScoreBoard(function(scoreBoard) {
    for (var i = 0; i < scoreBoard.length; i++) {
      var row = scoreBoard[i];
      // var user = self._findUserById(row.userId);
      msg += (i+1) + '. ' + row.user + ' | BP: ' + row.points + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.welcome = function(callback) {
  var reply = Math.floor(Math.random() * 6) + 1;
  // var members = this.channels[this.channel].members;
  // var userId = members[Math.floor(Math.random() * members.length - 1) + 1];
  // var user = this._findUserById(userId);
  var msg = this.replies[reply];

  callback(msg);
};




module.exports = Messages;
