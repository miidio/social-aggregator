//

var dateFormat = require('dateformat');
//var logger = require('winston');
var logger = console;
var FeedParser = require('feedparser');
var request = require('request');

function YouTubeProvider() {

  function getSearchURL(keyword, size) {
    var strBase = mThis.options.baseUrl ? mThis.options.baseUrl
        : 'https://gdata.youtube.com/feeds/base/videos/-/%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fcategories.cat%7DEntertainment/%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fkeywords.cat%7D';
    return strBase + encodeURIComponent(keyword) + '?max-results=' + size
        + '&alt=rss&orderby=published';
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
        logger.log('info', 'check article: ' + article.title + ' @ '
            + article.pubdate);
        logger.log('info', 'url: ' + article.link);
        if (mThis.dataCallback) {
          mThis.dataCallback(article.link, false);
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
    // use feedparser to load rss.
    var strURL = getSearchURL(mThis.options.keyword, mThis.options.size);
    logger.log('info', 'load youtube from: ' + strURL);
    request(strURL)
            .pipe(new FeedParser())
            .on('readable', processArticle)
            .on('error', processEnd);
  }

  var mThis = this;

  this.load = load;
  this.dataCallback = null;
  this.options = null;
}

module.exports.Provider = YouTubeProvider;
