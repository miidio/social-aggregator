social-aggregator
=================

This is a keyword-based aggregator app for specified topic. It aggregates information from Internet to social service.

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

##License##
All programs and document of social-aggregator are licensed on GPLv3, http://www.gnu.org/licenses/gpl.html. If you have any questions, please email to rec@miidio.com.