'use strict'

var mongo = require('mongodb');

var Db = function Constructor(dbPath) {
  console.log(dbPath);
  this.dbPath = dbPath;
  this.db = null;

  this._connect();
};

Db.prototype._connect = function() {
  var self = this;

  mongo.MongoClient.connect(this.dbPath, function(err, db) {
    self.db = db;
    // self.db.collection('scoreboard').drop();
    // self.db.collection('top_whines').drop();

    self.getScoreboard(function(scoreboard) {
      for (var i = 0; i < scoreboard.length; i++) {
        var row = scoreboard[i];
        console.log((i+1) + '. ' + row.user + ' | BP: ' + row.points);
      }
    });



// self.updateScoreboard(':papasatan:', 666);
//
//     self.updateScoreboard(':perfectsmile2:', 10000000000000000);
    // self.updateScoreboard('zunkas', 400);
//     self.updateScoreboard('silisav', 525.08);
//     self.updateScoreboard('slackbot', 0.2);
//     self.updateScoreboard('dimmanramone', -6);
//     self.updateScoreboard('toojla', -11.19);
//     self.updateScoreboard('irineos', -25.1);
    // self.dropUser('lounge');
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
    .find({ 'user': user })
    .limit(1)
    .next(function(err, dock) {
      if (dock !== null) {
        callback(dock.points);
      } else {
        callback(null);
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
      if (err) {
        throw err;
      }

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
    .find({ 'user': user })
    .limit(1)
    .next(function(err, dock) {
      if (dock !== null) {
        callback(dock.whine);
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
    .find({ 'whine': whine })
    .limit(1)
    .next(function(err, dock) {
      if (dock !== null) {
        callback(dock.score);
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
    .find({ 'user': user })
    .limit(1)
    .next(function(err, dock) {
      if (dock !== null) {
        callback(dock.streak);
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
      // console.log(results);
      if (err) {
        throw err;
      }
    });
}

Db.prototype.dropUser = function(user, callback) {
  var self = this;
  // console.log('db ' + user);
  this.db.collection('scoreboard').remove(
    { 'user': user },
    function(err, results) {
      if (err) {
        throw err;
      }
    });
}

module.exports = Db;
