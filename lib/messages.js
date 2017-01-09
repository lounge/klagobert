'use strict'

var Imgur = require('imgur-search');
var cleverbot = require('cleverbot.io');


var Messages = function Constructor(db, sentiment) {
  this.imgur = new Imgur('8b8df9084d07948');
  this.cleverbot = new cleverbot('ingn1xs08nnaAOgH', '2xpMFJK5XTtsyeMSrrTy4Sn0o0AlhFIa');
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
    'fem',
    'FUCK OFF! {0}',
    'Bajs är gott!',
    'Sluta gnälla! {0}',
    'Sluta klaga {0} ffs...',
    'Helvete!',
    'Släpp sargen {0}...',
    'Börja agera nu för fan! {0}',
    'FFS!',
    'WTF!',
    'Ägd {0}',
    'Fy fan {0}',
    'Malaka {0}',
    'Vart är alla kålares {0}?',
    'VEGAN POWER!',
    'Kött är mord',
    'Mord är mord',
    'HAHA! Kolla :papaswag: fy fan! {0}',
    'HAHA! Kolla :papavego: fy fan! {0}',
    'HAHA! Kolla :papasatan: fy fan! {0}',
    'HAHA! Kolla :papasmurf: fy fan! {0}',
    'HAHA! Kolla :papadesert: fy fan! {0}',
    'Fy fan vilken familj ! :papaswag::papadesert::papavego::papasmurf::papasatan: USCH!',
    ':dodge: much lol, very fy fan!',
    '{0} jag ska klippa din tung, klippa ören!',
    'Inte polisen ska ta dig, jag ska ta dig {0}! utten hovved, du vet.',
    'Jag ska ta hans namn, efternamn, VEH?! samma efternamn till {0} Alla på en gång, dom ska död.'
  ];
  this.haxxx = [
    'Sluta försöka haxxa dit as! {0}',
    'Fuck you {0}',
    'Fuck off {0}',
    'Sluuuuuuuta... {0}',
    'Lägg ner för fan! {0}'
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

  this.cleverbot.setNick('Klagobert');
  this.cleverbot.create(function (err, session) {
    console.log('created session ' + session);
  });
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
  var msg = this.replies[reply].format('@' + usr.name);
  callback(msg);
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
  var user = Math.floor(Math.random() * this.tools.users.length);
  var reply = Math.floor(Math.random() * this.haxxx.length);

  var usr = this.tools.users[user];
  var msg = this.haxxx[reply].format('@' + usr.name);
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

Messages.prototype.kek = function(user, callback) {
  var word = this.sentiment.getRandomNegativeWord();
  this.imgur.search(word).always(function(resp) {
    if (resp.length > 0) {
      callback(resp[0].link);
    } else {
      callback(word);
    }
  });
}

Messages.prototype.wrongCommand = function(user, callback) {
  var msg = ('hahah... nope. @' + user);
  callback(msg);
}

Messages.prototype.askCleverBot = function(callback, question) {
  this.cleverbot.ask(question, function (err, response) {
    callback(response);
  });
}

module.exports = Messages;
