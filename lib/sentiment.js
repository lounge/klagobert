'use strict'

var assign = require('lodash.assign');
var sentiment = require('sentiment-swedish');
var additions = require('../data/additions.json');
var afinn = require('../data/AFINN.json');

class Sentiment {

  constructor() {
    this.words = assign(afinn, additions);
    this.getNegativeWords();
  };

  analyze(msg) {
    var result = sentiment(msg, additions);
    return result;
  }

  getWords() {
    return this.words;
  }

  getNegativeWords() {
    var negWords = [];
    for (var key in this.words) {
      if (this.words.hasOwnProperty(key) && this.words[key] < 0) {
        negWords.push(key);
      }
    }
    return negWords;
  }

  getPositiveWords() {
    var posWords = [];
    for (var key in this.words) {
      if (this.words.hasOwnProperty(key) && this.words[key] > 0) {
        posWords.push(key);
      }
    }
    return posWords;
  }

  getRandomNegativeWord() {
    var negWords = this.getNegativeWords();
    var word = negWords[Math.floor(Math.random() * negWords.length)];
    return word;
  }
}

module.exports = Sentiment;
