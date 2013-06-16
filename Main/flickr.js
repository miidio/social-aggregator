var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var dateFormat = require('dateformat');
var logger = console;

function FlickrImageProvider() {

  var REQUEST_TYPE_LIST = 0;
  var REQUEST_TYPE_GETSIZE = 2;

  var FLICKR_ORDER_RELEVANCE = 'relevance';
  var FLICKR_ORDER_DATE_POST = 'date-posted-desc';
  var FLICKR_ORDER_INTERESTING = 'interestingness-desc';

  var eRequestType;
  var mThis = this;
  var aList = null;
  var nProcessIndex = 0;
  var nProcessedCount = 0;
  var nMaxSize = 0;
  var oCurrentPhoto = null;

  function jsonFlickrApi(rsp) {
    if ('ok' != rsp.stat) {
      logger.log('error', 'flickr error: ' + rsp.stat + ', ' + rsp.err
          + ', ' + rsp.err);
      mThis.dataCallback(null, true);
      return;
    }

    switch (eRequestType) {
    case REQUEST_TYPE_LIST:
      handleFlickrSearch(rsp);
      break;
    case REQUEST_TYPE_GETSIZE:
      handleGetSize(rsp);
      break;
    }
  }

  function handleGetSize(rsp) {
    if (0 == rsp.sizes.length) {
      logger.log('error', 'photo doesn\'t have any size?? skip one');
      setTimeout(handleImageItem, mThis.slowInterval);
      return;
    }

    var szLargest = null;

    for ( var i = rsp.sizes.size.length - 1; i > -1; i--) {
      szLargest = rsp.sizes.size[i];
      if (szLargest.width > 400 && szLargest.height > 400
          && szLargest.width < 1500 && szLargest.height < 1500) {
        break;
      }
    }

    if (!szLargest) {
      logger.log('error', 'photo doesn\'t have allowable size?? skip one');
    } else {

      if (mThis.dataCallback) {
        nProcessedCount += 1;
        mThis.dataCallback({
          'source' : szLargest.source,
          photo : oCurrentPhoto
        });
      }
    }
    setTimeout(handleImageItem, mThis.slowInterval);
  }

  function handleImageItem() {
    if (nProcessIndex < aList.length && nProcessedCount < nMaxSize) {
      var oPhoto = aList[nProcessIndex++];
      oCurrentPhoto = oPhoto;
      getPhotoSize(oPhoto.id);
    } else {
      mThis.dataCallback(null, true);
    }
  }

  function handleFlickrSearch(rsp) {
    var nRandom = Math.floor(Math.random() * (new Date()).getTime());
    var aPhotos = rsp.photos.photo;
    logger.log('query result: ' + rsp.photos.total);
    aList = aPhotos;
    handleImageItem();
  }

  function handleSuccess(o) {
    var strData = o.responseText;
    strData = strData
        .substring('jsonFlickrApi('.length, strData.length - 1);
    jsonFlickrApi(JSON.parse(strData));

  }

  function getPhotoSize(photoId) {
    var strURL = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key='
        + mThis.options.key +'&photo_id='
        + photoId + '&format=json';

    eRequestType = REQUEST_TYPE_GETSIZE;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (4 == this.readyState) {
        if (200 == this.status) {
          handleSuccess(this);
        } else {
          console.log('xhr error: ' + this.status + ', '
              + this.responseText);
          handleImageItem();
        }
      }
    };
    xhr.open('GET', strURL);
    xhr.send();
  }

  function getSearchURL(keyword, size) {

    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDate = dateFormat(date, 'yyyy-mm-dd');

    var strOrder = FLICKR_ORDER_RELEVANCE;
    var strBase = mThis.options.baseUrl ? mThis.options.baseUrl
        : 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' 
          + mThis.options.key + '&format=json&content_type=1&';

    return strBase + 'text=' + encodeURIComponent(keyword) + '&sort='
        + strOrder + '&per_page=' + size + '&min_upload_date='
        + strDate;
  }

  function load() {

    var strURL = getSearchURL(mThis.options.keyword,
        mThis.options.size < 200 ? 200 : mThis.options.size);

    aList = null;
    nProcessIndex = 0;
    nMaxSize = mThis.options.size;

    eRequestType = REQUEST_TYPE_LIST;
    console.log('Send ' + strURL);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (4 == this.readyState) {
        if (200 == this.status) {
          handleSuccess(this);
        } else {
          mThis.dataCallback(null, true, this.status);
        }
      }
    };
    xhr.open('GET', strURL);
    xhr.send();
  }

  this.slowInterval = 2000;
  this.load = load;
  this.dataCallback = null;
  this.options = null;
}

module.exports.Provider = FlickrImageProvider;
