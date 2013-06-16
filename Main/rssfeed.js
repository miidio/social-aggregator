var dateFormat = require('dateformat');
var logger = console;
var FeedParser = require('feedparser');
var request = require('request');

function RSSFeed() {

  var nProcessed = 0;
  
  function processArticle() {

    var stream = this;
    var article;

    while (article = stream.read()) {
      var nTime = (new Date()).getTime();
      var nArticleTime = article.pubdate.getTime();
      // we only use post within 1 day before.
      if (nTime > nArticleTime
          && (nTime - nArticleTime) < mThis.options.timespan) {
        
        var strUrl = article[mThis.options.linkField];
        logger.log('info', mThis.options.name + ', check article: ' + article.title + ' @ '
            + article.pubdate);
        logger.log('info', mThis.options.name + ', url: ' + strUrl);
        if (mThis.dataCallback && nProcessed < mThis.options.size) {
          mThis.dataCallback(strUrl, false);
          nProcessed++;
        } else {
          logger.log('debug', '#' + nProcessed + ' has callback? '
            + (mThis.dataCallback ? 'true' : 'false'));
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
    request(mThis.options.url)
            .pipe(new FeedParser())
            .on('readable', processArticle)
            .on('error', processEnd);
  }

  var mThis = this;

  this.load = load;
  this.dataCallback = null;
  this.options = null;
}

module.exports.Provider = RSSFeed;
