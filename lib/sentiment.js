var sentiment = require('sentiment-swedish');
var additions = require('../data/additions.json');

var Sentiment = function Constructor() {};

Sentiment.prototype.analyze = function(msg) {
  console.log(additions);
  var result = sentiment(msg, additions);
  console.log(result);
  return result;
}

module.exports = Sentiment;
