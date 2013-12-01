'use strict';

var logger = console;
var FeedParser = require('feedparser');
var request = require('request');

function GoogleNewsProvider() {

  function getSearchURL(keyword, size) {
    var strBase = mThis.options.baseUrl ? mThis.options.baseUrl
        : 'https://news.google.com/news/feeds?hl=zh-TW&gl=tw&um=1&ie=UTF-8&output=rss&scoring=n&';
    // use Taiwan version.
    return strBase + 'q=' + encodeURIComponent(keyword)
        + '&num=' + size;
  }

  function processArticle() {
    var stream = this;
    var article;

    while (article = stream.read()) {
      var nTime = (new Date()).getTime();
      var nArticleTime = article.pubdate.getTime();

      // we only use post within 1 day before.
      if (nTime > nArticleTime
          && (nTime - nArticleTime) < 24 * 60 * 60 * 1000) {

        var strURL = article.guid
            .substring(article.guid.indexOf('http://'));

        logger.log('info', 'check article: ' + article.title + ' @ '
            + article.pubdate);
        logger.log('info', 'url: ' + strURL);
        if (mThis.dataCallback) {
          mThis.dataCallback(strURL, false);
        }
      }
    }
    processEnd();
  }

  function processEnd() {
    if (mThis.dataCallback) {
      mThis.dataCallback(null, true);
    }
  }

  function load() {
    logger.log('info', 'start google news with keyword: ' + mThis.options.keyword);
    // use feedparser to load rss.
    var strURL = getSearchURL(mThis.options.keyword, mThis.options.size);
    logger.log('info', 'issue request to: ' + strURL);
    request(strURL).pipe(new FeedParser()).on('readable', processArticle).on('error', processEnd);
  }

  var mThis = this;

  this.load = load;
  this.dataCallback = null;
  this.options = null;
}

module.exports.Provider = GoogleNewsProvider;
