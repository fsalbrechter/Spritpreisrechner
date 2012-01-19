/**
 * View Module
 * @param {Object} interFace
 * @param {Object} Controller
 * @param {Object} $
 */



MVC.View = (function (interFace, Controller, $) {

	/* public methods */

    interFace.notify = function(message) {
		debug("View notify(): writing notification message for the user: "+message);
		$("div#notification").html(message).slideDown(500, function() {
			var $self = $(this);
			setTimeout(function(){$self.slideUp(500)}, 2000);
		});
		
		_translateExistingStringsInDOM(_lang_data);
	};
	
    interFace.init = function(languageData) {
		
		// to be sure the document in DOM s really loaded completely
		$(document).ready(function() {
			
			if(languageData) {
				debug('View init(): set the language data');
				_lang_data = languageData;
				_translateExistingStringsInDOM(languageData.id);
			}

			debug('View init(): set the click events');
			_setClickEvents();
			
			if (!localStorage)
			{
				$("div#offline_area").html('<h3><span lang="en">localStorage is supported by this browser.</span></h3>');
				
				$("#offline_mode_button").hide();
			}
			
			$("div#input_area" ).tabs();
			$("div#output_area" ).tabs();
			$("button#button_back" ).button({ icons: {primary:'ui-icon-circle-triangle-w'} });
			
			$("div#location_dialog").dialog({ autoOpen: false, modal: true, title: __('Locating.. ') });
			$("div#data_load_dialog").dialog({ autoOpen: false, modal: true, title: __('Loading.. ') });
			$("button" ).button();
			
			
			
		});	
	};
    
    interFace.showLocationDialog = function()
    {
    	$("div#location_dialog").dialog('open');
    };
    
    interFace.closeLocationDialog = function()
    {
    	$("div#location_dialog").dialog('close');
    };
    
    interFace.showLoadDialog = function()
    {
    	$("div#data_load_dialog").dialog('open');
    };
    
    interFace.closeLoadDialog = function()
    {
    	$("div#data_load_dialog").dialog('close');
    };
    

	interFace.updateCurrentAddress = function(address)
	{
		debug('View updateCurrentAddress(): updates the current address with the geolocated one: ' + address);
		$("input#address").val(address);
	};
	
	interFace.getCurrentAddress = function()
	{
		debug('View getCurrentAddress(): reads the current address');
		return $("input#address").val();
	};
	
	interFace.updateGasstationList = function(gasstationListJson)
	{
		debug('View updateGasstationList(): updating list of gas stations');
		
		var html_code = '<tr><th>' + __("Gasstation") + '</th>' +
				            '<th>' + __("Distance") + '</th>' +
				            '<th>' + __("Price") + '</th></tr>' ;
		
		for(var i = 0; i < gasstationListJson.length; i++) {
			
			var amount = "";
			
			if (gasstationListJson[i].spritPrice != null && gasstationListJson[i].spritPrice[0] != null) {
				amount = gasstationListJson[i].spritPrice[0].amount;
			}
			
			html_code += '<tr class="ui-widget-content">'
						   + '<td> ' + gasstationListJson[i].address + '</td>' 
						   + '<td>' + gasstationListJson[i].distance + ' [km] </td>'
						   + '<td>' + __(amount == "" ? "not unter the 5 cheapest" : amount + ' [&euro;]') + '</td>'
					   + '</tr>';
					
		}
		
		$("#gasstation_list").html(html_code);
	
	};
	
	interFace.getShowOnlyOpenGasstations = function()
	{
		debug('View getShowOnlyOpenGasstations(): ' + $("#show_closed").is(':checked'));
		return $("#show_closed").is(':checked');
	};
	
	interFace.showOfflineMap = function(base64_data)
	{
		debug('View showOfflineMap(): writing base64 encoded image to tag' );
		
		$("#offline_image").html("<img src='data:image/png;base64," + base64_data + "'/>");
		$("#offline_image").show();
		$("#map_canvas").hide();
	};
	
	interFace.getMapCanvas = function()
	{
		debug('View showOfflineMap(): ' + $("#map_canvas")[0]);
		
		return $("#map_canvas")[0];
	};
	
	interFace.showOnlineMap = function()
	{
		debug('View showOfflineMap(): ');
		
		$("#map_canvas").width(350);
		$("#map_canvas").height(240);
		$("#offline_image").hide();
		$("#map_canvas").show();		
	};
	
	interFace.isCacheRequest = function()
	{
		debug('View isCacheRequest(): ' + $("#cache_request").is(':checked'));
		return $("#cache_request").is(':checked');
	};
	
	interFace.toogleOnlineMode = function()
	{
		debug('View toogleOnlineMode(): ');
		return $("div#online_area").toggle(100);
	};
	
	interFace.toogleOfflineMode = function()
	{
		debug('View toogleOfflineMode(): ');
		$("div#offline_area").toggle(100);
	};
	
	interFace.getGasType = function()
	{
		debug('View getGasType(): ' + $("#gas_type")[0].value);
		return $("#gas_type")[0].value;
	};
	
	interFace.toggleAreas = function()
	{
		debug('View toggleOutputArea(): ');
		$("div#output_area").toggle(100);
		$("div#input_area").toggle(100);
	};
	
	interFace.getSelectedAddress = function()
	{
		debug('View getSelectedAddress(): ' + $("#offline_addresses")[0].value);
		return $("#offline_addresses")[0].value;
	};
	
	interFace.populateOfflineAddresses = function(addresses)
	{
		debug('View populateOfflineAddresses(): fro addresses' + addresses);
		
		var html_code = '<option value="-1">-----------------------------</option>';
		for(var i = 0; i < addresses.length; i++) {
			/* call __() function to append the translated strings to DOM */
		
			html_code += '<option value="' + i +  '"> '+__(addresses[i]) + '</option>';						
		}		
		
		$("select#offline_addresses").html(html_code);
	};
	
	interFace.getAutoCompleteElement = function()
	{
		return $("input#address")[0];
	};
		
	
	/* end of public methods */
	
	
	/* private methods */
	
	/* variable to cache translation data */
    var _lang_data = null,
	
	/* the function that translates the existing strings in DOM, if the translation for a string does not exist, the string is returned */
	_translateExistingStringsInDOM = function(lang) {
		debug("View _translateExistingStringsInDOM(): substituting the strings in DOM with the translated ones");
		$("* [lang='en']").each(function() {
			$(this).html(__($(this).html())).attr('lang', lang)
		});
	},
	
	/* function that should be called any time a string is appended into DOM to append the translated string */
	__ =  function(str) {
		return (_lang_data != null && typeof _lang_data[str] != 'undefined') ? _lang_data[str] : str;
	},
	
	_setClickEvents = function() {
		
		debug('View _setClickEvents(): set click event for button#button_locate_user');
        $("button#button_locate_user").click(function() {
			debug('View Click Event triggered: notice the Controller that the user wants to locate himself');
            Controller.updatePositionGeolocation();
		});
        
        debug('View _setClickEvents(): set click event for button#button_find_gasstations');
        $("button#button_find_gasstations").click(function() {
			debug('View Click Event triggered: notice the Controller the gasstation list is requested');
            Controller.gasstationListAsked();
		});
        
        debug('View _setClickEvents(): set click event for button#online_mode');
        $("button#online_mode").click(function() {
			debug('View Click Event triggered: notice the Controller the input area has to toggle');
            Controller.toogleOnlineMode();
		});
        
        debug('View _setClickEvents(): set change event for tab when clicked on offline mode');
		$("div#input_area").bind('tabsselect', function(event, ui) {			
			if (ui.index == 1)		
			{
				debug('View Click Event triggered: notice the Controller the tab status is changed to offline mode');
				
				if (!localStorage)
					Controller.informNoLocalStorage();
				else
					Controller.fillAddressesFromCache();
			}	
		});
        
        debug('View _setClickEvents(): set click event for select#offline_addresses');
        $("select#offline_addresses").change(function() {
			debug('View Click Event triggered: notice the Controller the offline_addresses is changed');
			Controller.updateGasstationOffline();
		});		
        
        debug('View _setClickEvents(): set click event for button#button_back');
        $("button#button_back").click(function() {
			debug('View Click Event triggered: notice the Controller the button_back is clicked');
			Controller.showInputArea();
		});	
        
        
    };
	
	/* end of private methods */

	debug('View loaded');
    return interFace;
}(MVC.View || {}, MVC.Controller, jQuery));