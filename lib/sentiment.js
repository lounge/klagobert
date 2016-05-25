'use strict'

var assign = require('lodash.assign');
var sentiment = require('sentiment-swedish');
var additions = require('../data/additions.json');
var afinn = require('../data/AFINN.json');

var Sentiment = function Constructor() {
  this.words = assign(afinn, additions);
  this.getNegativeWords();
};

Sentiment.prototype.analyze = function(msg) {
  var result = sentiment(msg, additions);
  return result;
}

Sentiment.prototype.getWords = function() {
  return this.words;
}

Sentiment.prototype.getNegativeWords = function() {
  var negWords = [];
  for (var key in this.words) {
    if (this.words.hasOwnProperty(key) && this.words[key] < 0) {
      negWords.push(key);
    }
  }
  return negWords;
}

Sentiment.prototype.getPositiveWords = function() {
  var posWords = [];
  for (var key in this.words) {
    if (this.words.hasOwnProperty(key) && this.words[key] > 0) {
      posWords.push(key);
    }
  }
  return posWords;
}

Sentiment.prototype.getRandomNegativeWord = function() {
  var negWords = this.getNegativeWords();
  var word = negWords[Math.floor(Math.random() * negWords.length)];
  return word;
}



module.exports = Sentiment;
