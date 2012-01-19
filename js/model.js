/**
 * Model Module
 * @param {Object} interFace
 */
MVC.Model = (function (interFace) {

	/* public methods */
	
    interFace.setCurrentLongitude = function(longitude) {
		debug('Model setCurrentLongitude: set the current longitude');
		debug(longitude);
		current_longitude = longitude;
	};
	
	interFace.setCurrentLatitude = function(latitude) {
		debug('Model setCurrentLatitude: set the current latitude');
		debug(latitude);
		current_latitude = latitude;
	};
    
    interFace.getCurrentLongitude = function() {
		debug('Model getCurrentLongitude: return the current longitude');
		return current_longitude;
	};
	
	interFace.getCurrentLatitude = function() {
		debug('Model getCurrentLongitude: return the current latitude');
		return current_latitude;
	};
	
	
	interFace.getStoredAddresses = function ()
	{
		
		debug('Model getStoredAddresses: getting offline stored addresses');
		
		if (!localStorage)
		{
			debug('Model getStoredAddresses: localStorage not supported');
			return null;
		}
		
		
		var array = new Array();
		var i = 0; 
		for (i = 0; i < localStorage.length; i++)
		{
			var key = localStorage.key(i);
			
			if ( key.indexOf("image") == -1)
				array.push(key);
		}
		
		return array;
	};
	
	interFace.getGasstationListOffline = function(address)
	{
		debug('Model getGasstationListOffline: getting offline information for address' + address);
		
		if (!localStorage)
		{
			debug('Model getGasstationListOffline: localStorage not supported');
			return null;
		}
		
		if (address != null)
			return localStorage.getItem(address);
	};
	
	
	interFace.cacheRequest = function(key, jsonRequest)	{
		
		debug('Model cacheRequest: caching current request key:' + key);
		
		if (localStorage)
		{
			localStorage.removeItem(key, jsonRequest);
			localStorage.setItem(key, jsonRequest);
			return true;
		}
		else
		{
			debug('Model getStoredAddresses: localStorage not supported');
			return false;
		}	
	};
	
	
	/* private methods */
    
	var current_longitude = null;
	var current_latitude = null;
	
	debug('Model loaded');
    return interFace;
}(MVC.Model || {}));