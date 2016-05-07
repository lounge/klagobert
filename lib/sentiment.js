'use strict'

var sentiment = require('sentiment-swedish');
var additions = require('../data/additions.json');

var Sentiment = function Constructor() {};

Sentiment.prototype.analyze = function(msg) {
  var result = sentiment(msg, additions);
  return result;
}

module.exports = Sentiment;
