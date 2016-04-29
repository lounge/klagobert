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
    // self.db.collection('scoreboard').drop();
    self.getScoreboard(function(scoreboard) {
      for (var i = 0; i < scoreboard.length; i++) {
        var row = scoreboard[i];
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
  this.db.collection('scoreboard')
    .findOne({ 'user': user })
    .then(function(user) {
      if (user !== null) {
        callback(user.points);
      } else {
        callback(0);
      }
  });
}

Db.prototype.updateScoreboard = function(user, bp) {
  var self = this;
  this.db.collection('scoreboard').updateOne(
    { 'user': user },
    { $set: { 'points': bp } },
    { upsert: true },
    function(err, results) {
      if (err)
        throw err;
    });
}

Db.prototype.getScoreboard = function(callback) {
  this.db.collection('scoreboard')
    .find()
    .sort({ 'points': 1 })
    .toArray(function(err, scoreboard) {
      callback(scoreboard);
    });
}

Db.prototype.clearScoreboard = function() {
  this.db.collection('scoreboard').drop();
}

module.exports = Db;
