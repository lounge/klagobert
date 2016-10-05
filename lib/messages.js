'use strict'

var util = require('util');

var Messages = function Constructor(db, sentiment) {
  this.db = db;
  this.sentiment = sentiment;
  this.tools = null;
  this.searchEngines = [
    'https://www.google.com/search?q=',
    'https://www.google.com/search?tbm=isch&q=',
    'https://www.google.com/search?tbm=nws&q=',
    'https://www.youtube.com/results?search_query=',
    'https://www.facebook.com/search/top/?q=',
    'https://twitter.com/search?q=',
    'https://www.instagram.com/explore/tags/'
  ]
  this.replies = [
    'FUCK OFF!',
    'Bajs är gott!',
    'Sluta gnälla!',
    'Sluta klaga ffs...',
    'Helvete!',
    'Släpp sargen...',
    'Börja agera nu för fan!',
    'FFS!',
    'WTF!',
    'Ägd',
    'Fy fan',
    'Malaka',
    'Vart är alla kålares?',
    'VEGAN POWER!',
    'Kött är mord',
    'Mord är mord',
    'HAHA! Kolla :papaswag: fy fan!',
    'HAHA! Kolla :papavego: fy fan!',
    'HAHA! Kolla :papasatan: fy fan!',
    'HAHA! Kolla :papasmurf: fy fan!',
    'HAHA! Kolla :papadesert: fy fan!',
    'Fy fan vilken familj ! :papaswag::papasatan::papavego::papasmurf::papadesert: USCH!',
    ':dodge: much lol, very fy fan!'
  ];
  this.goodbyes = [
    'Nä nu blev jag jag lack, jag bangar den här skiten...',
    'Ses sen era as!',
    'See you later mother fuckers!'
  ];
  this.streaks = [
    'Double whine!',
    'Multi whine!',
    'Mega whine!',
    'Ultra whine!',
    'Monster whine!',
    'Ludicrous whine!',
    'HOLY S**T'
  ]
};

Messages.prototype.help = function(cmds, callback) {
  var msg = '';
  for (var cmd in cmds) {
      if (!cmds.hasOwnProperty(cmd)) continue;
      var obj = cmds[cmd];
      msg += '/' + obj.cmd + ' | ' +  obj.desc + '\n';
  }
  callback(msg);
};

Messages.prototype.welcome = function(callback) {
  var user = Math.floor(Math.random() * this.tools.users.length);
  var reply = Math.floor(Math.random() * this.replies.length);
  var usr = this.tools.users[user];
  var msg = this.replies[reply];
  callback(msg + ' @' + usr.name);
};

Messages.prototype.goodbye = function(callback) {
  var reply = Math.floor(Math.random() * this.goodbyes.length);
  var msg = this.goodbyes[reply];
  callback(msg);
};

Messages.prototype.topWhines = function(callback) {
  var self = this;
  var msg = '';
  this.db.getTopWhines(function(topWhines) {
    for (var i = 0; i < topWhines.length; i++) {
      var row = topWhines[i];
      msg += (i+1) + '. ' + row.whine + ' | score: ' + row.score + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.scoreboard = function(callback) {
  var self = this;
  var msg = '';
  this.db.getScoreboard(function(scoreboard) {
    for (var i = 0; i < scoreboard.length; i++) {
      var row = scoreboard[i];
      msg += (i+1) + '. ' + row.user + ' | BP: ' + row.points + '\n';
    }
    callback(msg);
  });
};

Messages.prototype.scoreboardCleard = function(user, callback) {
  var msg = '<- @' + user + ' Cleared the Bitter Points ->';
  callback(msg);
};

Messages.prototype.lastWhineForUser = function(user, callback) {
  var self = this;
  var msg = 'The last whine for @' + user + ' was ';
  this.db.getLastWhineForUser(user, function(whine) {
    callback(msg + '"' + whine + '"');
  });
};

Messages.prototype.userDropped = function(user, callback) {
  var msg = '<- @' + user + ' dropped from scoreboad ->';
  callback(msg);
};

Messages.prototype.giveBp = function(user, receiver, points, callback) {
  var msg = '<- @' + user + ' gave ' + points + ' bp\'s to @' + receiver + ' ->';
  callback(msg);
};

Messages.prototype.stopHaxxing = function(user, callback) {
  var msg = 'Sluta försöka haxxa dit as! @' + user;
  callback(msg);
};

Messages.prototype.userDoesNotExist = function(user, callback) {
  console.log('msg');
  var msg = '@' + user + ' Does not exist';
  callback(msg);
};


Messages.prototype.getStreak = function(streak, user, callback) {
  var msg = '';
  if (streak === this.streaks.length - 1) {
    msg = '@' + user + ' ' + this.streaks[this.streaks.length - 1];
  } else if (streak > this.streaks.length - 1) {
    msg = '@' + user + ' ' + this.streaks[this.streaks.length - 1] + ' ' + (streak - (this.streaks.length - 1));
  } else {
    msg = '@' + user + ' ' + this.streaks[streak - 2];
  }
  callback(msg);
};

Messages.prototype.imFeelingBitter = function(user, callback) {
  var word = this.sentiment.getRandomNegativeWord();
  var searchEngine = this.searchEngines[Math.floor(Math.random() * this.searchEngines.length)];

  var encodedWord;
  if (searchEngine.indexOf('instagram') > 0) {
    encodedWord = (word).replace(' ', '');
  } else {
    encodedWord = (word).replace(' ', '%20');
  }

  var msg = '@' + user + ' här får du lite att glo på din bittra jävel. ' + searchEngine + encodedWord;
  callback(msg);
}

Messages.prototype.randomReply = function(user, callback) {
  var reply = Math.floor(Math.random() * this.replies.length);
  var msg = this.replies[reply] + ' @' + user;
  callback(msg);
}



module.exports = Messages;
