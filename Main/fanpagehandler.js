var flickr = require('./flickr.js');
var googlenews = require('./googlenews.js');
var youtube = require('./youtube.js');
var fb = require('./fblink.js');
var cfg = require('./config.js');
var imageCache = require('./image-cache.js');
var rss = require('./rssfeed.js');
var logger = console;

function FanPageHandler(options) {
  var mThis = this;
  var providers = new Array();
  var fblink = new fb.FacebookLink(options);
  var fanpageID = options.fanpageID;
  var handlerOptions = options;

  function initProviders() {

    for ( var i = 0; i < options.providers.length; i++) {
      var oProCfg = options.providers[i];
      if ('googlenews' == oProCfg.type) {
        logger.log('debug', 'initialize google news ' + options.name);
        providers[providers.length] = initGoogleNews(oProCfg);
      } else if ('flickr' == oProCfg.type) {
        logger.log('debug', 'initialize flickr for ' + options.name);
        providers[providers.length] = initFlickrProvider(oProCfg);
      } else if ('youtube' == oProCfg.type) {
        logger.log('debug', 'initialize youtube for ' + options.name);
        providers[providers.length] = initYouTube(oProCfg);
      } else if ('rss' == oProCfg.type) {
        logger.log('debug', 'initialize rss for ' + options.name);
        providers[providers.length] = initRSS(oProCfg);
      }
    }
  }

  function initRSS(options) {
    var r = new rss.Provider();
    r.options = options;
    r.dataCallback = function(data, finished) {
      if (finished) {
        logger.log('info', 'end of rss');
        return;
      } else {
        logger.log('info', 'post rss to fb');
        try {
          if (options.imageCache || handlerOptions.imageCache) {
            imageCache.cacheUrl(data, 'news', fanpageID);
          }
          if (!mThis._debug) {
            fblink.post(data);
          }
        } catch (ex) {
          logger.log('error', 'post rss to fb error: ' + ex.message);
        }
      }
    };
    return r;
  }
  
  function initYouTube(options) {
    var yt = new youtube.Provider();
    yt.options = options;
    yt.dataCallback = function(data, finished) {
      if (finished) {
        logger.log('info', 'end of youtube');
        return;
      } else {
        logger.log('info', 'post youtube to fb');
        try {
          if (options.imageCache || handlerOptions.imageCache) {
            imageCache.cacheUrl(data, 'video', fanpageID);
          }
          if (!mThis._debug) {
            fblink.post(data);
          }
        } catch (ex) {
          logger.log('error', 'post youtube to fb error: ' + ex.message);
        }
      }
    };
    return yt;
  }

  function initGoogleNews(options) {
    var gNews = new googlenews.Provider();
    gNews.options = options;
    gNews.dataCallback = function(data, finished) {
      if (finished) {
        logger.log('info', 'end of google news');
        return;
      } else {
        try {
          if (options.imageCache || handlerOptions.imageCache) {
            imageCache.cacheUrl(data, 'news', fanpageID);
          }
          logger.log('info', 'post news to fb');
          if (!mThis._debug) {
            fblink.post(data);
          }
        } catch (ex) {
          logger.log('error', 'post news to fb error: ' + ex.message);
        }
      }
    };
    return gNews;
  }

  function initFlickrProvider(options) {
    var flickrProvider = new flickr.Provider();
    flickrProvider.options = options;
    flickrProvider.dataCallback = function(data, finished) {
      if (finished) {
        logger.log('info', 'end of flickr');
        return;
      } else {
        var strURL = 'http://www.flickr.com/photos/' + data.photo.owner
            + '/' + data.photo.id;
        logger.log('info', 'source: ' + data.source);
        logger.log('info', 'url: ' + strURL);
        try {
          if (options.imageCache || handlerOptions.imageCache) {
            imageCache.cacheUrl(strURL, 'photo', fanpageID);
          }
          if (!mThis._debug) {
            fblink.post(strURL);
          }
        } catch (ex) {
          logger.log('error', 'post flickr to fb error: ' + ex.message);
        }
      }
    };
    return flickrProvider;
  }

  function initFacebook() {
    fblink.facebookReady = function() {
      logger.log('debug', 'facebook ready to go for: ' + options.name);
      startProviders();
    };
    fblink.options = options;
    fblink.prepare();
  }

  function startProviders() {
    // load provider async.
    // the load method should be run in async mode.
    for ( var i = 0; i < providers.length; i++) {
      logger.log('debug', 'load provider #' + i + ' for ' + options.name);
      providers[i].load();
    }
  }

  this.start = function() {
    logger.log('debug', 'start page with: ' + this._debug);
    initProviders();
    // we will start provider while facebook ready.
    initFacebook();
  };

  this._debug = false;
}

module.exports.FanPageHandler = FanPageHandler;
