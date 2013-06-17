social-aggregator
=================

This is a keyword-based aggregator app for specified topic. It aggregates information from Internet to social service. social-aggregator should run at least once a day. It filters information within one day and shares them to social network.

Currently, social-aggregator supports 4 data source and 1 social network:
Data source:
- Flickr
- YouTube
- Google News
- RSS Feed

Social Network:
- Facebook

##Install Required Modules##
Use npm to install all required modules:

	npm install


##Configuration##
Before using this app, you need to create a config.js file under Main/ directory, like:

	module.exports.Config = [
		{... fanpage setting }
	]

##Fan Page Setting##
A fan page setting is a setting object of Facebook Fan Page. Social-aggregator uses keyword to query information and share them to Facebook Fan Page. A fan page setting contains the following information:

	{
      "name" : "{name of this fan page}",
      "owner" : "{the account name}",
      "fanpageID" : "{the fan page id}",
      "appSecret" : "{app secret of your FB app}",
      "clientID" : "{app id of your FB app}",
      "clientSecret" : "{app secret of your FB app}",
      "redirectURI" : "{the redirect url of your FB app}", 
      "imageCache" : {create image cache or not},
      "providers" : [
          {... data source provider}]
    }

For each item:

- name: the name of this fan page. It is only used on console log.
- owner: the account name of this fan page. It is used for creation of account cache information. Please use A-Z, a-z, 0-9, -, _, and other acceptable characters by your hosted file system.
- fanpageID: the fan page id. This is the fan page id of your facebook Fan page. You can query it with Facebook Graph API explorer or the URL when you enter fan page through your personal page.
- appSecret: To use this app, you need to create a facebook app, https://developers.facebook.com/apps. Once created it, you can have the secret code of your app, including app id.
- clientID: Socal-aggregator may need to query the long live access token of your fan page. It may runs at the client mode of your app. So, this field and the following field, clientSecret, are appId and appSecret of your facebook app.
- clientSecret: equals to appSecret
- redirectURL: When creating facebook app, you need to set the url of facebook auth url which is also used by client mode.
- imageCache: If you had configured image cache tools, like: CutyCapt for linux or webkit2png for mac, you can set this variable to true to create image cache before share link to social service.
- providers: an array of information source.

##Data Source Provider##
A data source provider querys information from remote server and filters items within one day. The setting of a data source provider looks like:
Google News:

    {
      name : "{name of item}",
      type : "googlenews",
      baseUrl : "https://news.google.com/news/feeds?hl=zh-TW&gl=tw&um=1&ie=UTF-8&output=rss&scoring=n&",
      keyword : "AKB48",
      size : 10
    }

YouTube:

    {
      name : "{name of item}",
      type : "youtube",
      baseUrl : "https://gdata.youtube.com/feeds/base/videos/-/%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fcategories.cat%7DEntertainment/%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fkeywords.cat%7D",
      keyword : "AKB48",
      size : 5
    }

Flickr:

    {
      type : "flickr",
      keyword : "AKB48",
      key: "{api-key of flickr}",
      size : 5
    }

RSS:

    {
      name : "{name of item}",
      type : "rss",
      url : "http://url of rss feed",
      linkField : "link",
      timespan : 86400000,
      size : 10
    }

You can find the above example of 4 providers. Most of them share the same fields:

- name: the name of this provider which is only used on console log. 
- type: the type of data source, one of the following: googlenews, youtube, flickr, rss.
- url or baseUrl: the url or base url of this provier.
- keyword: the querying keyword for this provider, if you want to have multiple keyword, you can create multiple providers for each keyword. Note, if the name is baseUrl, you need to add & or ? at the end of url.
- size: the maximum processing item per query. Note, some of data source limit total querying items, like googlenews limits 20.

For flickr provider, you also have to create a flickr api key, see: http://www.flickr.com/services/api/misc.api_keys.html.

For rss provider, you need to specify the field of real url linking to the original post. Some sites may use different field name to supply url.

##License##
All programs and document of social-aggregator are licensed on GPLv3, http://www.gnu.org/licenses/gpl.html. If you have any questions, please email to rec@miidio.com.