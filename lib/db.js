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
    // self.getScoreBoard();
  });
}

Db.prototype.close = function() {
  var self = this;
  this.db.close(function(err) {
    if (err)
      throw err;
  });
}

Db.prototype.getBitterPointsForUser = function(userId, callback) {
  this.db.collection('score_board')
    .findOne({ 'userId': userId })
    .then(function(user) {
      if (user !== null) {
        callback(user.points);
      } else {
        callback(0);
      }
  });
}

Db.prototype.updateScoreBoard = function(userId, bp) {
  var self = this;
  this.db.collection('score_board').updateOne(
    { 'userId': userId },
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
