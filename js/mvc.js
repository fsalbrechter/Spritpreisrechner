/**
 * MVC frame work
 * contains additional Helper modules that are used in framework
 */
var MVC = (function () { 
	var mvcObject = {
		Model: {},
		View: {},
		Controller: {},
		Helper: {}
	};
	
    return mvcObject; 
}());

/* Helper Modules */

/**
 * Helper module to process server requests, using jQuery interface
 * @param {Object} $
 */
MVC.Helper.ServerAPI = (function () { 
	var interFace = {
	
		/* public methods */
		
		getImage : function (callback, url) {
			debug("Helper.ServerAPI getBase64EncodedImage: send a xhr request to get a base 64 encoded image of the google map image");
			
			debug(escape(url));
			
			
			var param = {
					"purl" :url				
			};
			
			_getPRequest(param, callback);
		},
		
			
		getGasstationList : function (callback, 
									  showClosedGasstations, 
									  gasType, 									   
									  startLongitude,
									  startLatitude,									 
									  endLongitude,
									  endLatitude) {
			
			debug("Helper.ServerAPI getGasstationList: send a xhr request to fetch the list of gasstations from the proxy");
			
			var values =  
					[showClosedGasstations,
					gasType,
					startLongitude,
					startLatitude,
					endLongitude,
					endLatitude];
			
			
			var host = "http://spritpreisrechner.at/espritmap-app/GasStationServlet";
			
			var param = {
					"url" : (host + "?data=" + JSON.stringify(values))			
			};
			
			_getJSONRequest(param, callback);
		},
		
		getTranslations: function(lang, callback) {
			debug("Helper.ServerAPI getTranslations: send a xhr request to fetch the translated strings for "+lang);
			_getJSONRequest({}, callback, './locale/lang.'+lang);
		}		
		/* end of public methods */
	},
	
	
	
	
	/* private methods */
	
	_SERVICE_URL = './server/proxy.php', 

	_getJSONRequest = function(parameter, callback, url){
		if(typeof url == 'undefined')
			url = _SERVICE_URL;
		
		debug(parameter);
		
		widget.httpGetJSON(
			url, 
			parameter, 
			function(jsonData) {
				debug("Helper.ServerAPI _getJSONRequest: the response has just arrived!");
				debug(jsonData);
				
				if(typeof jsonData.error != 'undefined') {
					debug('Server reported the following error while processing the request: ' + jsonData.error);
					MVC.View.notify('An error occurred: '+jsonData.error+' <br />Please try again!');
					return;
				}
				callback(jsonData);
			},
			function(xhr, textStatus, e) {
				debug('Request failed: ' + e);
				MVC.View.notify('An unexpected error occurred: '+e);
			}
		);
	}; 
	
	_getRequest = function(parameter, callback, url){
		if(typeof url == 'undefined')
			url = _SERVICE_URL;
		
		widget.httpGet(
			url, 
			parameter, 
			function(data) {
				debug("Helper.ServerAPI _getRequest: the response has just arrived!");								
				callback(data);
			},
			function(xhr, textStatus, e) {
				debug('Request failed: ' + e);
				MVC.View.notify('An unexpected error occurred: '+e);
			}
		);
	};
	
	_getPRequest = function(parameter, callback, url){
		if(typeof url == 'undefined')
			url = _SERVICE_URL;
		
		widget.httpPost(
			url, 
			parameter, 
			function(data) {
				debug("Helper.ServerAPI _getRequest: the response has just arrived!");								
				callback(data);
			},
			function(xhr, textStatus, e) {
				debug('Request failed: ' + e);
				MVC.View.notify('An unexpected error occurred: '+e);
			}
		);
	};
	
	
	/* end of private methods */
	
	debug('MVC loaded');
	return interFace;
}());