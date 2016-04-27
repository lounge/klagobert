var sentiment = require('sentiment-swedish');

var Sentiment = function Constructor() {};

Sentiment.prototype.analyze = function(msg) {
  var result = sentiment(msg);
  return result;
}

module.exports = Sentiment;
