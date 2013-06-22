'use strict';

var dateFormat = require('dateformat');
var logger = console;
var execSync = require('execSync');
var crypto = require('crypto');
var fs = require('fs');

var unprocessed = new Array();
var shasum = crypto.createHash('sha1');
var bHasMore = false;

function callCreate(item, path) {
  try {
    logger.log('info', 'start to sync cache: ' + item.url);
    /**
     * we assume this app is running at root folder of git-aggregator.
     */
    var out = execSync.stdout('./image-cache/create.sh \'' 
        + item.url + '\' '
        + item.type + ' \''
        + item.host + '\' \'' 
        + path + '\'');
    logger.log('info', 'output of image cache: ' + out);
  } catch (ex) {
    logger.log('debug', 'error on image-cache: ' + ex);
  }
}

/**
 * a util function to mkdir -p.
 */
function createFolders(dirs) {
  var current = '';
  for (var i = 0; i < dirs.length; i++) {
    if (!dirs[i]) {
      continue;
    }
    current += dirs[i] + '/';
    if (!fs.existsSync(current)) {
      fs.mkdir(current);
    }
  }
}

function process() {
  var runOk = false;
  for ( var i in unprocessed) {
    var item = unprocessed[i];
    var strHash = crypto.createHash('md5').update(item.url).digest('hex');
    var strFolder = 'image/' + 
                     item.type + '/' + 
                     item.host + '/';
    var strPath = strFolder + 
                  strHash + '.png';
    if (!fs.existsSync(strPath)) {
      createFolders(strFolder.split('/'));
      callCreate(unprocessed[i], strPath);
    } else {
      logger.log('info', 'url [' + item.url + '] already be cached.');
    }
    delete unprocessed[i];
    runOk = true;
    break;
  }

  if (runOk) {
    setTimeout(process, 5000);
  }
}

module.exports.cacheUrl = function(url, type, host) {
  logger.log('put ' + url + ', ' + type + ', ' + host + ' to queue.');

  unprocessed[unprocessed.length] = {
    url : url,
    type : type,
    host : host
  };
  setTimeout(process, 5000);
};
