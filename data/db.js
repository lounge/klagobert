'use strict'

var mongo = require('mongodb');

var Db = function Constructor(dbPath) {
  this.dbPath = dbPath;
  this.db = null;

  this._connect();
};

Db.prototype._connect = function() {
  var self = this;
  mongo.MongoClient.connect(this.dbPath, function(err, db) {
    self.db = db;
    self.db.collection('scoreboard').drop();
    self.db.collection('top_whines').drop();
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
    .sort({ 'points': -1 })
    .toArray(function(err, scoreboard) {
      callback(scoreboard);
    });
}

Db.prototype.clearScoreboard = function() {
  this.db.collection('scoreboard').drop();
}

Db.prototype.saveLastWhineForUser = function(user, whine) {
  var self = this;
  this.db.collection('last_whine').updateOne(
    { 'user': user },
    { $set: { 'whine': whine } },
    { upsert: true },
    function(err, results) {
      if (err)
        throw err;
    });
}

Db.prototype.getLastWhineForUser = function(user, callback) {
  this.db.collection('last_whine')
    .findOne({ 'user': user })
    .then(function(data) {
      if (user !== null) {
        callback(data.whine);
      } else {
        callback('No whine is saved for this user.');
      }
  });
}

Db.prototype.saveWhineScore = function(whine, score) {
  var self = this;
  this.db.collection('top_whines').updateOne(
    { 'whine': whine },
    { $set: { 'score': score } },
    { upsert: true },
    function(err, results) {
      if (err) {
        throw err;
      }
    });
}

Db.prototype.getWhineScore = function(whine, callback) {
  this.db.collection('top_whines')
    .findOne({ 'whine': whine })
    .then(function(whine) {
      if (whine !== null) {
        callback(whine.score);
      } else {
        callback(0);
      }
  });
}

Db.prototype.getTopWhines = function(callback) {
  this.db.collection('top_whines')
    .find()
    .sort({ 'score': -1 })
    .limit(10)
    .toArray(function(err, topWhines) {
      callback(topWhines);
    });
}

Db.prototype.saveWhineStreak = function(user, streak, score) {
  var self = this;
  this.db.collection('whine_streak').updateOne(
    { 'user': user },
    { $set: { 'streak': streak } },
    { upsert: true },
    function(err, results) {
      if (err) {
        throw err;
      }
    });
}

Db.prototype.getWhineStreak = function(user, callback) {
  this.db.collection('whine_streak')
    .findOne({ 'user': user })
    .then(function(user) {
      if (user !== null) {
        callback(user.streak);
      } else {
        callback(0);
      }
  });
}

Db.prototype.clearWhineStreak = function(user, callback) {
  var self = this;
  this.db.collection('whine_streak').updateOne(
    { 'user': user },
    { $set: { 'streak': 0 } },
    { upsert: true },
    function(err, results) {
      if (err) {
        throw err;
      }
    });
}

module.exports = Db;
