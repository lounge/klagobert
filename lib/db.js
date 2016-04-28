var mongo = require('mongodb');
// var assert = require('assert');

var Db = function Constructor(dbPath) {
  this.dbPath = dbPath;
  this.db = null;

  this._connect();
};

Db.prototype._connect = function() {
  var self = this;
  mongo.MongoClient.connect(this.dbPath, function(err, db) {
    self.db = db;
    // self.db.collection('score_board').drop();
    self.getScoreBoard(function(scoreBoard) {
      for (var i = 0; i < scoreBoard.length; i++) {
        var row = scoreBoard[i];
        console.log((i+1) + '. ' + row.user + ' | BP: ' + row.points);
      }
    });
  });
}

Db.prototype.close = function() {
  var self = this;
  this.db.close(function(err) {
    if (err)
      throw err;
  });
}

Db.prototype.getBitterPointsForUser = function(user, callback) {
  this.db.collection('score_board')
    .findOne({ 'user': user })
    .then(function(user) {
      if (user !== null) {
        callback(user.points);
      } else {
        callback(0);
      }
  });
}

Db.prototype.updateScoreBoard = function(user, bp) {
  var self = this;
  console.log('username? ' + user);
  this.db.collection('score_board').updateOne(
    { 'user': user },
    { $set: { 'points': bp } },
    { upsert: true },
    function(err, results) {
      if (err)
        throw err;
    });
}

Db.prototype.getScoreBoard = function(callback) {
  this.db.collection('score_board')
    .find()
    .toArray(function(err, scoreBoard) {
      callback(scoreBoard);
    });
}

module.exports = Db;
