/**
 * Controller Module
 * 
 * @param {Object}
 *            interFace
 * @param {Object}
 *            Model
 * @param {Object}
 *            View
 * @param {Object}
 *            Request
 */
MVC.Controller = (function(interFace, Model, View, Request) {

	/* public methods */

	interFace.init = function(lang) {
		debug('Controller init: initialize whole the system where some preprocessing is needed. In this example command View to intialize itself and get the translation string from server if needed!');
		
		// bias google maps to austria
		var defaultBounds = new google.maps.LatLngBounds(
		  new google.maps.LatLng(50, 17),
		  new google.maps.LatLng(46, 9));

		// show addresses first (instead of businesses)
		var options = {
		  bounds: defaultBounds,
		  types: ['geocode']
		};

		var autocomplete = new google.maps.places.Autocomplete(View.getAutoCompleteElement(), options);
		
		_init(lang);

		language = lang;
		
		debug("Controller init(): setup address autocomplete functionality");
		

		google.maps.event
				.addListener(
						autocomplete,
						'place_changed',
						function() {
							_updateLongitude(autocomplete.getPlace().geometry.location.Qa);
							_updateLatitude(autocomplete.getPlace().geometry.location.Pa);
						});

	};

	interFace.updatePositionGeolocation = function() {
		
		debug("Controller updatePositionGeolocation(): update position using html5 geolocation api");
		
		if (navigator.geolocation) {
			
			View.showLocationDialog();
			
			navigator.geolocation.getCurrentPosition(function(position) {
				_updatePosition(position);
				
				View.closeLocationDialog();
			},
					function(message) {
						debug("Controller updatePositionGeolocation: ERROR "
								+ message);
						View.notify("navigator.geolocation " + message);
					});
		} else {
			debug("Controller updatePositionGeolocation: ERROR navigator.geolocation not supported");
			View.notify("navigator.geolocation not supported by your browser.");
		}
	};

	interFace.updateLongitude = function(longitude) {
		debug('Controller updateLongitude: updates the longitude on location request');
		_updateLongitude(longitude);
	};

	interFace.updateLatitude = function(latitude) {
		debug('Controller updateLatitude: updates the latitude on location request');
		_updateLatitude(latitude);
	};
	
	interFace.updateGasstationOffline = function () {
		
		debug("Controller updateGasstationOffline(): reading cached data from localStorage");
		
		var address_array = Model.getStoredAddresses();
		
		if (address_array != null)
		{
			var index = View.getSelectedAddress();
			
			var jsonList = Model.getGasstationListOffline(address_array[index]);
			var image    = Model.getGasstationListOffline(address_array[index] + "_image");
			
			if (jsonList != null && image != null){
				
				View.showOfflineMap(image);
				View.updateGasstationList(JSON.parse(jsonList));
				
				View.toggleAreas();
			}
		}
	};
	
	interFace.informNoLocalStorage = function () {
		debug("Controller informNoLocalStorage: ERROR localStorage not supported");
		View.notify("<span lang='en'>localStorage is not supported by this browser.</span>");
		
	};
	

	interFace.gasstationListAsked = function() {

		debug('Controller gasstationListAsked: get gasstation list from Request, store'  
				+ 'it in the Model and let View append it to the DOM');

		View.showLoadDialog();
		
		if (Model.getCurrentLongitude == null ||  Model.getCurrentLatitude() == null)
		{
			View.notify("<span lang='en'>Type in an address, or located yoursef first!</span>");
			View.closeLoadDialog();
			return;
		}
		
		Request.getGasstationList(function(gasstationListJson) {
			
			View.updateGasstationList(gasstationListJson);
			debug("Controller gasstationListAsked: cache enabled: " + View.isCacheRequest());
			if (View.isCacheRequest())
			{
				if (Model.cacheRequest(View.getCurrentAddress(), JSON.stringify(gasstationListJson)))
				{
					var image_url = _createOfflineMapUrl(gasstationListJson);
				
					Request.getImage(function(decodedImage)
					{
						if (!Model.cacheRequest(View.getCurrentAddress() + "_image", decodedImage))
							View.notify("Your browser does not support webstorage");
					}, image_url);
				}
			}
			
			_setupOnlineMap(gasstationListJson);
			
			View.toggleAreas();
			View.closeLoadDialog();

			}, 	View.getShowOnlyOpenGasstations() ? "checked" : "", View
				.getGasType(), 
				Model.getCurrentLongitude()  - 0.1,
				Model.getCurrentLatitude() - 0.1,
				Model.getCurrentLongitude()  + 0.1,
				Model.getCurrentLatitude() + 0.1);
	}
	
	
	interFace.fillAddressesFromCache = function()
	{
		
		debug("Controller fillAddressesFromCache(): populating stored addresses");
		
		var array = Model.getStoredAddresses();
		
		if (array != null)
			View.populateOfflineAddresses(array);
		
	};
	
	interFace.showInputArea = function()
	{
		
		debug("Controller showInputArea():");	
		
		View.toggleAreas();
		
	};


	/* end of public methods */

	/* private methods */

	var _init = function(lang) {
		if (lang != 'en') {
			debug("Controller _init(): get the translation data from language file");
			Request.getTranslations(lang, function(translations) {
				View.init(translations);
			});
		} else {
			View.init(null);
		}
	};

	var _updatePosition = function(position) {
		debug("Controller _updatePosition(): updates the geolocated position");
		
		debug(position);

		
		Model.setCurrentLatitude(position.coords.latitude);
		Model.setCurrentLongitude(position.coords.longitude);
		
		var geocoder = new google.maps.Geocoder();

		var currentPosition = new google.maps.LatLng(position.coords.latitude,
				position.coords.longitude);

		if (geocoder) {
			geocoder.geocode({
				'latLng' : currentPosition
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					View.updateCurrentAddress(results[0].formatted_address);
				} else {
					View.notify("Geocoding failed: " + status);
				}
			});
		} else {
			View.notify("Your browser does not support geocoder");
		}
	};

	var _updateLongitude = function(longitude) {

		debug("Controller _updateLongitude(): updates the current longitude");
		Model.setCurrentLongitude(longitude);

	};

	var _updateLatitude = function(latitude) {

		debug("Controller _updateLatitude(): updates the current latitude");
		Model.setCurrentLatitude(latitude);

	};
	
	var _createOfflineMapUrl = function(gasstationListJson) {
		
		debug("Controller _createOfflineMapUrl(): create google static url from gasstation list");
		
		var url = "http://maps.google.com/maps/api/staticmap?";
		var center_position = "center=" + Model.getCurrentLatitude() + "," + Model.getCurrentLongitude();
		var string = "&zoom=12&size=400x250&maptype=roadmap&sensor=false";
		
		var markers = "";
		
		var base_url = "http://www.caffeinated.at/MMIS/fillingstation_"
		
		var markers_icon = {
				0 : base_url + "green.png", 
				1 : base_url + "light_green.png",
				2 : base_url + "yellow.png",
				3 : base_url + "orange.png",
				4 : base_url + "red.png",
		}
		
		
		for (i = 0; i < gasstationListJson.length; i++) {
			markers = markers + "&markers=icon:"+ (i > 4 ? markers_icon[4] : markers_icon[i]) + "|" + gasstationListJson[i].latitude + "," +
					gasstationListJson[i].longitude;	
		}
		
		var image_url = url + center_position + markers + string;
		
		
		return image_url;
	};
	
	var _encodeBase64 = function(str) {

		var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var base64DecodeChars = new Array(
		    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
		    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
		    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
		    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

		
	    var out, i, len;
	    var c1, c2, c3;

	    len = str.length;
	    i = 0;
	    out = "";
	    while(i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if(i == len)
		{
		    out += base64EncodeChars.charAt(c1 >> 2);
		    out += base64EncodeChars.charAt((c1 & 0x3) << 4);
		    out += "==";
		    break;
		}
		c2 = str.charCodeAt(i++);
		if(i == len)
		{
		    out += base64EncodeChars.charAt(c1 >> 2);
		    out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
		    out += base64EncodeChars.charAt((c2 & 0xF) << 2);
		    out += "=";
		    break;
		}
		
		c3 = str.charCodeAt(i++);
		out += base64EncodeChars.charAt(c1 >> 2);
		out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
		out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
		out += base64EncodeChars.charAt(c3 & 0x3F);
	    }
	    return out;
	};

	var _setupOnlineMap = function(gasstationListJson) {
		
		debug("Controller _createOfflineMapUrl(): create google map url from gasstation list");
		
		// icons used from 
		// http://mapicons.nicolasmollet.com/markers/transportation/road-transportation/filling-station/
		
		var center_position = new google.maps.LatLng(
				Model.getCurrentLatitude(), Model.getCurrentLongitude());

		var options = {
			zoom : 14,
			center : center_position,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}

		var map = new google.maps.Map(View.getMapCanvas(), options);

		var boundaries = new google.maps.LatLngBounds();
		
		var markers = {
				0 : "./images/fillingstation_green.png", 
				1 : "./images/fillingstation_light_green.png",
				2 : "./images/fillingstation_yellow.png",
				3 : "./images/fillingstation_orange.png",
				4 : "./images/fillingstation_dark_orange.png",
				5 : "./images/fillingstation_red.png"
		}

		for (i = 0; i < gasstationListJson.length; i++) {
			var gasstation_position = new google.maps.LatLng(
					gasstationListJson[i].latitude,
					gasstationListJson[i].longitude);
			
			
			
			boundaries.extend(gasstation_position);
			var marker = new google.maps.Marker({
				position : gasstation_position,
				map : map,
				title : gasstationListJson[i].gasStationName,
				icon  : i > 5 ? markers[5] : markers[i]
			});

		}
		
		View.showOnlineMap();
		map.fitBounds(boundaries);
		
		
	};
	
	var language = null;

	/* end of private methods */

	debug('Controller loaded');
	return interFace;
}(MVC.Controller || {}, MVC.Model, MVC.View, MVC.Helper.ServerAPI));