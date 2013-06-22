'use strict';

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var FB = require('fb');
var fs = require('fs');
var logger = console;

function FacebookLink(options) {
  var TOKEN_FILE_NAME = null;// will be initialized by cache
  var SHORT_USER_AT_FILE = null;// will be initialized by cache
  var CACHE_PATH = 'fb-cache/';
  var OWNER_AT_FILE_NAME = null;

  var fbOptions = options;

  var fanspageID = null;//will be initialized by
  // cache
  var fanPageAccessToken = null;

  var userAccessToken = null;
  var longLiveAccessToken = null;
  var accessTokenExpiration = 0;
  var postingQueue = new Array();
  var queueRunning = false;

  var mThis = this;

  function initFacebook() {
    FB.options({
      'appSecret' : fbOptions.appSecret
    });
  }

  function initLongLivePageAccessToken() {
    // check cache
    if (fs.existsSync(CACHE_PATH + TOKEN_FILE_NAME)) {
      var data = JSON
          .parse(fs.readFileSync(CACHE_PATH + TOKEN_FILE_NAME));
      var nNow = (new Date()).getTime();
      if (nNow < data.end) {
        fanPageAccessToken = data.page_at;
        return true;
      }
    }
    fanPageAccessToken = null;
    return false;
  }

  function initLongLiveUserAccessToken() {
    // check cache
    if (fs.existsSync(CACHE_PATH + OWNER_AT_FILE_NAME)) {
      var data = JSON.parse(fs.readFileSync(CACHE_PATH
          + OWNER_AT_FILE_NAME));
      var nNow = (new Date()).getTime();
      if (nNow < data.end) {
        longLiveAccessToken = data.user_at;
        accessTokenExpiration = data.end;
        return true;
      }
    }
    longLiveAccessToken = null;
    return false;
  }

  function saveLongLiveAccessToken(data) {
    fs.writeFile(CACHE_PATH + TOKEN_FILE_NAME, JSON.stringify(data));
  }

  function saveOwnerLongAccessToken(data) {
    fs.writeFile(CACHE_PATH + OWNER_AT_FILE_NAME, JSON.stringify(data));
  }

  function loadShortUserAt() {
    if (fs.existsSync(CACHE_PATH + SHORT_USER_AT_FILE)) {
      var strAT = fs.readFileSync(CACHE_PATH
          + SHORT_USER_AT_FILE);
      console.log('debug', 'strAT: ' + strAT);
      var data = JSON.parse(strAT);
      userAccessToken = data.user_at;
      return true;
    } else {
      return false;
    }
  }

  function renewUserAccessToken() {
    function handleRenewed(res) {
      if (!res || res.error) {
        logger.log('error', !res ? 'error occurred' : res.error);
        return;
      }

      longLiveAccessToken = res.access_token;
      var nSpan = res.expires ? res.expires : 0;
      logger.log('info', 'long user at: ' + longLiveAccessToken);
      accessTokenExpiration = Number.MAX_VALUE;
      logger.log('info', 'expiration at: ' + accessTokenExpiration);

      saveOwnerLongAccessToken({
        user_at : longLiveAccessToken,
        end : accessTokenExpiration
      });
      queryFanPageToken();
    }

    logger.log('info', 'calling FB for renew user access token');
    FB.api('oauth/access_token', {
      'client_id' : fbOptions.clientID,
      'client_secret' : fbOptions.clientSecret,
      'redirect_uri' : fbOptions.redirectURI,
      'grant_type' : 'fb_exchange_token',
      'fb_exchange_token' : userAccessToken
    }, handleRenewed);
  }

  function queryFanPageToken() {
    if (!longLiveAccessToken) {
      logger.log('info', 'long live token doesn\'t exist.');
      renewUserAccessToken();
      return;
    }
    var at = longLiveAccessToken;
    // doc says I can use app access token to query page access token, but
    // it
    // doesn't work.
    var url = '/me/accounts?access_token=' + at;
    logger.log('info', 'start to query fan page');
    function responseHandler(response) {
      if (!response || response.error) {
        logger.log('error', 'Error occurred:' + response.error.message);
      } else {
        for ( var idx = 0; idx < response.data.length; idx++) {
          if (response.data[idx].id == fanspageID) {
            fanPageAccessToken = response.data[idx].access_token;
            break;
          }
        }
        if (fanPageAccessToken) {
          logger.log('info', 'fanPageAccessToken: '
              + fanPageAccessToken);

          saveLongLiveAccessToken({
            page_at : fanPageAccessToken,
            end : accessTokenExpiration
          });
          logger.log('info', 'access token ready, post to facebook');
          if (mThis.facebookReady) {
            mThis.facebookReady();
          }
        } else {
          logger.log('error', 'fanPageAccessToken not found.');
        }
      }
    }
    FB.api(url, responseHandler);
  }

  function doShareToFB() {
    if (0 == postingQueue.length) {
      queueRunning = false;
      return;
    }
    var url = postingQueue.shift();
    var data = {
      access_token : fanPageAccessToken,
      link : url
    };
    logger.log('info', 'FB API Post: ' + url);
    // do post must use page access token
    FB.api('/' + fanspageID + '/feed', 'post', data, function(response) {
      if (!response || response.error) {
        logger.error('Error occurred: ' + response.error.message);
        // fs.unlinkSync(TOKEN_FILE_NAME);
      } else {
        logger.log('info', 'Share link ' + url + ' success!');
      }
    });

    setTimeout(doShareToFB, 2000);
  }

  function doFBPost(url) {
    postingQueue.push(url);
    if (!queueRunning) {
      queueRunning = true;
      setTimeout(doShareToFB, 2000);
    }

  }

  function loadShortUserAtFromServer() {
    logger.log('info', 'read short access token from server');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (4 == this.readyState) {
        if (200 == this.status) {
          userAccessToken = this.responseText;
          logger
              .log('info', 'short access token: '
                  + userAccessToken);
          renewUserAccessToken();
        } else {
          logger.log('info',
              'server return error, wait for 10 mins: '
                  + this.status);
          setTimeout(loadShortUserAtFromServer, 10 * 60 * 1000);
        }
      }
    };
    // note: we currently assume all fanpages are held under the same
    // account.

    xhr.open('GET', mThis.options.ownerAt);
    xhr.send();
  }

  function clearServerToken() {
    logger.log('info', 'clear user token of server');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (4 == this.readyState) {
        if (200 == this.status) {
          logger.log('info',
              'user token clear ready, wait for 10 mins');
          // check after 10 mins.
          setTimeout(loadShortUserAtFromServer, 10 * 60 * 1000);
        } else {
          logger.log('error', 'xhr error: ' + this.status + ', '
              + this.responseText);
        }
      }
    };
    // note: we currently assume all fanpages are held under the same
    // account.
    xhr.open('GET', mThis.options.ownerClearAt);
    xhr.send();
  }

  initFacebook();

  this.facebookReady = function() {
  };

  this.prepare = function() {
    fanspageID = mThis.options.fanpageID;
    TOKEN_FILE_NAME = mThis.options.fanpageID + '_long_at.txt';
    SHORT_USER_AT_FILE = mThis.options.owner + '_short_at.txt';
    OWNER_AT_FILE_NAME = mThis.options.owner + '_long_at.txt';

    if (initLongLivePageAccessToken()) {
      logger.log('info', 'access token ready, start to go');
      if (this.facebookReady) {
        this.facebookReady();
      }
    } else if (initLongLiveUserAccessToken()) {
      queryFanPageToken();
    } else {
      var bUserAt = loadShortUserAt();
      if (!bUserAt) {
        //clearServerToken();
        logger.log('error', 'there is no short user access token exists!!');
      } else {
        renewUserAccessToken();
      }
    }
  };

  this.post = doFBPost;
  this.options = null;
}

module.exports.FacebookLink = FacebookLink;
