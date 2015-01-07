/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.0.3-vsdoc.js"/>

function getBase() {
    return  app.getBase();
    //TODO: Remove calls to this function and replace with app.getBase() in pages
}

function UpdatePointAccount(pointAccount) {
	psg.setSessionItem('balance_number', pointAccount.Balance);
	psg.setSessionItem('balance',  addCommas(pointAccount.Balance));
	psg.setSessionItem('awarded',  addCommas(pointAccount.PointsAwarded));
	psg.setSessionItem('redeemed', addCommas(pointAccount.PointsRedeemed * -1));
	psg.balance = addCommas(pointAccount.Balance);
}

//TODO: Merge this function
function ShowAlert(message, title, functionName, buttons) {
	if (!app.isPhoneGap){
		alert(message);
	}else{
		if (functionName = null ||functionName ==''){
			functionName = function(){};
		}
		navigator.notification.alert(
		message,functionName,
		title,
		buttons);
	}
}

// insert commas into currency number
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function checkLen(thetext){
	var temp = thetext.value.length;
	if (temp > 4000)
	{
		showAlert('Textboxes are imited to 4000 characters','Too Many Characters');
		thetext.focus();
	}
}

function IsMinDate(date) {
    if (date == '0001-01-01 00:00:00')
        return true;
    else
        return false;
}

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html().replace(/"/g, "&quot;");
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function WriteError(error) {
//TODO: add an error dialog to all pages
   	var errorDiv = $(".error");
    errorDiv.html(error);
    errorDiv.show();
    errorDiv.focus();
}

// To prevent duplicate JSON calls, we will keep track of active calls.
var activeJsonCalls = [];

// asynchronous ajax request
// action is name of serivce request
// successCallback(jsonObject)
// data is optional, defaults to empty string, if not a string then convert to Object or array
// failCallback(xhr,status) optional, defaults to nothing, gets called before app.standardErrorHandler
// timeout is optional, defaults to 6 seconds.
// nospinner is options, defaults to false, true to suppress the loading spinner.
function getJson(action, successCallBack, data, failCallback, timeout, nospinner, showOfflineAlert ) {

    var baseUrl =  app.getHost() + "/json/";
    var requestType = "POST";
    if (action.indexOf("SHOPPING.") == 0) {
        baseUrl += "jsonCatalog.ashx?action=";
    } else if (action.indexOf("MOBILE.") == 0 || action.indexOf("REMOTE.") == 0) {
        baseUrl += "jsonMobile.ashx?action=";
    } else if (action.indexOf("CLAIM.") == 0) {
        baseUrl += "jsonClaim.ashx?action=";
    }
	else {
        switch (action) {
            case "LOGIN.PROGRAMINFO":
            case "POINTS.SUMMARY":
            case "PARTICIPANT.GETAWARDPOINTS":
			case "ORDER.ORDERS":
                baseUrl += "jsonService.ashx?action=";
                requestType = "GET";
                break;
            default:
                baseUrl += "jsonSecure.ashx?action=";
                break;
        }
    }

	// convert data as needed
    //hack: Ripple does not like blank data on POST.
	if ( requestType == 'POST') {
		if (psg.isNothing(data))
			data = { test: 1 };
		if (typeof data != 'string')
			data = JSON.stringify(data);
	}
	else if ( typeof data === 'undefined' )
		data = null;

	// default timeout
	if (psg.isNothing(timeout))
		timeout = 10000;

	// default fail callback
	if (psg.isNothing(failCallback))
		failCallback = function (xhr,status){  };

	if (psg.isNothing(showOfflineAlert))
	{
		showOfflineAlert = true;
	}
	
	var jsonUrl = baseUrl + action;

	// if we are not online then just fail right away
	if (app.isPhoneGap && !app.isOnline(showOfflineAlert)) {
		failCallback({status:400,statusText:'Not online'},'timeout');
		return;
	}

	// Check to see if call is already active.
	var key = action + (typeof data === 'string' ? data : JSON.stringify(data)) + $.mobile.activePage.attr('id');
	if (activeJsonCalls.indexOf(key) > -1) {
		return; // prevent duplicate call.
	}
	
	// Add call to active list.
	activeJsonCalls.push(key);
	
	// show a busy spinner unless the caller specifically says not to
	var spinner = typeof nospinner === 'undefined' || nospinner !== true;
	if ( spinner )
	{
		showSpinner();
	}

	settings = {
		url: jsonUrl,
		data: data,
		type: requestType,
		timeout: timeout,
		contentType: 'application/json; charset=utf-8',
		accept: 'application/json',
		dataType: 'json',
		success: function(data)
		{
			if ( spinner )
				hideSpinner();
			successCallBack(data);
		} 
	};
	
	var activeCall = (function() {
		var callKey = key;
		return {
			remove : function () {
				var index = activeJsonCalls.indexOf(callKey);
				if (index > -1) {
					// Remove from active calls.
					activeJsonCalls.splice(index, 1);
				}
			}
		};
	})();

	// async ajax request
	$.ajax(settings).fail( function(xhr,status){
		activeCall.remove();
		failCallback(xhr,status);
		settings.success = successCallBack;		// dont hide the spinner twice
		app.standardErrorHandler(xhr, status, settings);
		if ( spinner )
			hideSpinner();
	} ).done( function () {
		activeCall.remove();
	} );
}

// we can have multiple overlapping getJson calls (it is an asynchronous ajax call after all)
// so only show the spinner when the first one starts, and only close it when the last one is done.
var pendingSpinners = 0;
// we wait 1 second before starting the spinner and if we get a response in that time
// we wont show the spinner at all.
var spinnerTimeout = null;

// show the loading spinner
function showSpinner() {
	if ( pendingSpinners == 0 ) {
		if (spinnerTimeout != null)
			clearTimeout(spinnerTimeout);

		// must be done in the main event loop so wait 1 ms.
		// actually
		spinnerTimeout = window.setTimeout(function () {
			$.mobile.loading('show', {
				text: 'Loading...',
				textVisible: true
			});
			spinnerTimeout = null;
		}, 1000);
	}
	++pendingSpinners;
}

// hide the loading spinner
function hideSpinner()
{
	--pendingSpinners;
	if ( pendingSpinners == 0 ) {
		if (spinnerTimeout != null)
			clearTimeout(spinnerTimeout);

		spinnerTimeout = window.setTimeout(function () {
			$.mobile.loading('hide');
			spinnerTimeout = null;
		}, 1);
	}
}

function GetCatalogItemListItem(value,listString){
	listString += '<li data-icon="false" > \
		<a href="#" data-psg-item-key="' + htmlEncode(JSON.stringify(value.CatalogItemKey)) + '" data-transition="slide" class="link-detail"> \
			<table><tr><td style="vertical-align:top; width:80px;"><div class="psg-item-list-image-container"><img src="' + value.ItemSmallImageUrlFullyQualified + '" class="psg-item-list-image"></div></td> \
			<td style="vertical-align:top;"><p class="ui-no-ellipse"><strong>' + value.ItemName + '</strong></p> \
			<p class="ui-no-ellipse ui-paragraph-padding"><span class="shopPtsStyle">' + value.PointsPerUnitFormatted + '</span> points</p>';
	if (value.DeliveryOptions != null && value.DeliveryOptions.indexOf('InStorePickup') >= 0) {
		listString += '<br/><span class="ispu_available">In-Store Pickup Available</span>';
	}
	if (value.IsOnSale != null && value.IsOnSale == 1) {
		listString += '<br/><span class="is_on_sale">On-Sale Now!</span>';
	}
	listString += '</p></td></tr></table></a></li>';
	return listString;
}

var psg = {
	init: function(){
		// run this function with noSession option once per session / deviceready
		// will download any new configurations.
		psg.validateInit();
		// Initialize base popup menu.
		resetBaseMenu();
		resetStandardMenu();
		if (app.isPhoneGap){
			addBaseMenuItems( [{href:"settings.html", text:"Settings" }] );
		}
		// Get config, if available.
		var cache = psg.getCache('mobile_config',24);
		//always load the data from cache if available.
		//if not force synchronized get.
		var getAsync = true;
		if (app.isPhoneGap || cache.data != null) {  
			psg.mobileConfigLoad(cache.data,false);
		} else {
			getAsync = false;
		}
		if (!cache.expired) {
			return;
		}
		var version = localStorage.getItem(app.getBase() + 'config_version');
		if (version == null) {
			version = 0;
		}
		$.ajax({
			url: app.getHost() + '/json/jsonMobile.ashx?action=MOBILE.CONFIG',
			type: "POST",
			data: JSON.stringify({client_version: version}),
			contentType: "application/json; charset=utf-8",
			beforeSend: function () { $.mobile.loading('show') },
			complete: function () { $.mobile.loading('hide') },
			dataType: "json",
			success: function (data) {
				psg.mobileConfigLoad(data,true);
			},
			timeout:8000,
			async: getAsync,
			error: function (xhr, ajaxOptions, thrownError) {
			   if (!app.isPhoneGap){
					alert('Error loading config');
			   }
			}
		});
	},
    mobileConfigLoad: function(data,updateCache){
		if (updateCache){
			if (data.Xml == null) {
				localStorage.setItem(app.getBase() + 'cache_mobile_config_last',Date.now());
				return;
			}
			localStorage.setItem(app.getBase() + 'config_version', data.Version);
			psg.setCache('mobile_config', data);
		}
		psg.configXml = $.parseXML(data.Xml);
		psg.programName = data.ProgramName;
		psg.programGuid = data.Guid;
		psg.baseUrl = data.BaseUrl;
		psg.requiresEnrollmentConfirmation = false;
		var $xml = $(psg.configXml);
		var modules = $xml.find('PROGRAM > MODULES');
		psg.isOpenEnrollment = (modules.attr('OPEN_ENROLLMENT') == "1");
		if (psg.isOpenEnrollment) {
			var enrollmentNode = $xml.find('ENROLLMENT');
			var defaultStatus = enrollmentNode.attr('DEFAULT_STATUS');
			var loginBehavior = enrollmentNode.attr('LOGIN_BEHAVIOR');
			psg.requiresEnrollmentConfirmation = (defaultStatus != 0 && defaultStatus != 1) || (defaultStatus == 0 && loginBehavior == 0);
		}
		
		var hasMobile = modules.attr('MOBILE_APP');
		if (hasMobile == '1') {
			var mobileNode = $xml.find('PROGRAM > MOBILE');
			psg.programName = mobileNode.attr('APPLICATION_NAME');
		}
		if (!app.isPhoneGap) {
			app.offerMobileApp = (hasMobile == '1') ? true: false;
			if (app.offerMobileApp){
				app.appName = mobileNode.attr('APPLICATION_NAME');
				app.appCompany = mobileNode.attr('COMPANY_NAME');
				app.appUrlGoogle = mobileNode.find('ANDROID').text();
				app.appUrlApple = mobileNode.find('IOS').text();
				app.appUrlMicrosoft = mobileNode.find('WP').text();
			}
		} else {
			var partTypeCache = psg.getCache('participant_type_id',48);
			if (partTypeCache.cache != null) {
				psg.participantTypeId = partTypeCache.cache.ParticipnatTypeId;
			}
		}
	},
	participantTypeId: null,
	programName: null,
	programGuid: null,
	isOpenEnrollment: false,
	requiresEnrollmentConfirmation: false,
	balance: null,
    homeMenu: null,
	historyMenu: null,
	configXml: null,
	login: function ( username, password, callback ) {
		var data;
		var guid = psg.programGuid;
		if (app.isPhoneGap){
			var token = localStorage.getItem(app.getBase() + 'deviceToken');
			data = JSON.stringify({ program_guid: guid, email: username, password: password,
									uuid: device.uuid, os: device.platform, deviceToken: token});
		}else{
			data = JSON.stringify({ program_guid: guid, email: username, password: password });
		}
		getJson("LOGIN", internalLoginCallback, data);
		function internalLoginCallback(data) {
			var base = app.getBase();
			if (data.Result == "success") {
				if (typeof data.PointAccount !== null) {
					UpdatePointAccount(data.PointAccount);
				}
				
				if (app.isPhoneGap){
					localStorage.setItem(base + 'authToken', data.Token);
					psg.setCache('participant_type_id', {"ParticipantTypeId": data.ParticipantTypeId});
					sessionStorage.removeItem(base + 'authFail');
				}
				psg.participantTypeId = data.ParticipantTypeId;
				localStorage.setItem(base + 'last_email', $('#login_email').val());
				// For MOS, include logout option in popup menu.
				if (!app.isPhoneGap) {
					addBaseMenuItems( [{ href: "logout.html", text: "Logout" }] );
				}
				// Reset standard popup menu, so home can add pax-type-specific options.
				resetStandardMenu(); // standard = base options + home options.
				psg.homeMenu = null; // need to reset home menu, too.
			}
			callback(data);
		}
	},
	validateInit: function () {
		$.validator.setDefaults({
		    ignore: ".jqx-combobox-input",
	//	    ignore: [],
	//	    debug: true,
			errorClass: "validate-error",
			errorPlacement: function(error, element) {
					element.parent().after(error);
				}
		});
		$.validator.addMethod(
			"regex",
			function(value, element) {
			    var regexp = $(element).attr('data-psg-validation');
				var re = new RegExp(regexp);
				return this.optional(element) || re.test(value);
			},
			"Please check your input."
		);
	},
	pageInit: function() {
	    
		//var programImageHeader = "<img src='./img/ISI_Group_Logo_NoTM.svg' alt='ISI Group' style='height: 25px;'>";
		var programName = psg.programName;
		var balance = psg.balance;
		if (balance == null){
			balance = "Unknown";
		}
		$('.psg-class-program-name').text(programName);
		//$("div[data-role='header'] .psg-class-program-name").html(programImageHeader);
		$('.psg_point_balance').text(balance + " Points");
	},
	getCache: function(key,hours){
		var cache = { expired: true,
					  data: null
					};
					
		var last = localStorage.getItem(app.getBase() + 'cache_' + key + '_last');
		if (last == null){
			return cache;
		}
		var data = localStorage.getItem(app.getBase() + 'cache_' + key + '_cache');
		if (data == null){
			return cache;
		}
		cache.data = JSON.parse(data);
		var expiration = hours * 3600000;	
		var now = Date.now();
		if (last != null && now-last < expiration){
			cache.expired = false;
		}
		return cache;
	},
	setCache: function(key,data) {
		var json = JSON.stringify(data);
		localStorage.setItem(app.getBase() + 'cache_' + key + '_last',Date.now());
		localStorage.setItem(app.getBase() + 'cache_' + key + '_cache',json);
	},
	removeCache: function(key) {
		localStorage.removeItem(app.getBase() + 'cache_' + key + '_cache');
		localStorage.removeItem(app.getBase() + 'cache_' + key + '_last');
	},
    StringUtil: {
        Concatenate: function (delimiter, value1, value2) {
            if (arguments.length < 2) {
                return '';
            }
            if (!delimiter) {
                delimiter = '';
            }

            var output = '';
            var value;
            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i]) {
                    continue;
                }
                if (arguments[i] === 'null') {
                    continue;
                }
                if (output.length > 0) {
                    output += delimiter;
                }
                output += arguments[i];
            }

            return output;
        },
		Repeat: function (pattern, count) {
			if (count < 1) return '';
			var result = '';
			while (count > 1) {
				if (count & 1) result += pattern;
				count >>= 1, pattern += pattern;
			}
			return result + pattern;
		}
    },
	setSessionItem: function(name,value) {
		sessionStorage.setItem(app.getBase() + name, value);
	},
	getSessionItem: function(name) {
		return sessionStorage.getItem(app.getBase() + name);
	},
	removeSessionItem: function(name) {
		sessionStorage.removeItem(app.getBase() + name);
	},
	isNothing: function ( obj ) {
		return (typeof obj === "undefined" || obj == null || (typeof obj.length != undefined && obj.length === 0));
	},
	isUndefined: function ( obj ) {
		return (typeof obj === "undefined");
	},
	DateUtil: {
		toShortDate: function ( date ) {
			if (psg.isNothing(date)) {
				return '';
			}
			var temp;
			if (typeof date === 'string') {
				temp = new Date(date);
			}
			else {
				temp = date;
			}
			var output = temp.toLocaleString();
			return output.slice(0, output.indexOf(' '));
		},
		isMinDate: function ( date ) {
			if (date == '0001-01-01 00:00:00')
				return true;
			else
				return false;
		}
	},
	NumberUtil: {
		toCurrency: function ( amount ) {
			if (psg.isNothing(amount)) {
				return '';
			}
			return "$" + amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
		},
		toPoints: function ( amount ) {
			if (psg.isNothing(amount)) {
				return '';
			}
			return amount.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") + ' points';
		},
		toNumber: function ( amount, decimals ) {
			if (psg.isNothing(amount)) {
				return '';
			}
			return amount.toFixed(decimals).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
		}
    },
	getMenuIcon: function ( menuName ) {
		switch (menuName) {
			case "whats_new": 
				return '<i class="fa fa-newspaper-o fa-lg fa-fw ui-menu-icon"></i>';
			case "55": // history
				return '<i class="fa fa-history fa-lg fa-fw ui-menu-icon"></i>';
			case "57": // contact
				return '<i class="fa fa-envelope-o fa-lg fa-fw ui-menu-icon"></i>';
			case "89": // claims landing
				return '<i class="fa fa-clipboard fa-lg fa-fw ui-menu-icon"></i>';
			case "68": // profile
				return '<i class="fa fa-user fa-lg fa-fw ui-menu-icon"></i>';
			case "71": // shopping
				return '<i class="fa fa-gift fa-lg fa-fw ui-menu-icon"></i>';
			case "84": // quick points
				return '<i class="fa fa-certificate fa-lg fa-fw ui-menu-icon"></i>';
			case "57":
				return '<i class="fa fa-history fa-lg fa-fw ui-menu-icon"></i>';
			case "points_awarded":
				return '<i class="fa fa-trophy fa-lg fa-fw ui-menu-icon"></i>';
			case "orders":
				return '<i class="fa fa-truck fa-lg fa-fw ui-menu-icon"></i>';
			case "claim_history":
				return '<i class="fa fa-line-chart fa-lg fa-fw ui-menu-icon"></i>';
			case "wish_list":
				return '<i class="fa fa-star-o fa-lg fa-fw ui-menu-icon"></i>';
			case "shopping_browse":
				return '<i class="fa fa-th fa-lg fa-fw ui-menu-icon"></i>';
			case "shopping_cart":
				return '<i class="fa fa-shopping-cart fa-lg fa-fw ui-menu-icon"></i>';
			case "shopping_search_filter":
				return '<i class="fa fa-search-minus fa-lg fa-fw ui-menu-icon"></i>';
			case "rec_items":
				return '<i class="fa fa-smile-o fa-lg fa-fw ui-menu-icon"></i>';
		}
	},
	getMenuName: function ( sectionTypeId ) {
		switch (sectionTypeId) {
			case "claim_history":
				return "Performance Tracking";
			case "orders":
				return "Orders";
			case "points_awarded":
				return "Awards and Adjustments";
			case "rec_items":
				return "Reward Yourself!";
			case "shopping_browse":
				return "Browse Departments";
			case "shopping_cart":
				return "Shopping Cart";
			case "shopping_search_filter":
				return "Filter &amp; Sort";
			case "whats_new":
				return "What's New";
			case "wish_list":
				return "Wish List";
		}
		
		var search = "MENU";
		if (psg.participantTypeId != null && psg.participantTypeId != 0){
			search = 'MENU > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]';
		}
		search += ' > SECTION[TYPE_ID="' + sectionTypeId + '"]';
		
		var matching = $(psg.configXml).find(search);
		return matching.length > 0 ? matching.attr("NAME") : "";
	},
	goDesktopSite: function ( isPublic ) {
		psg.setSessionItem("user-wants-desktop", true);
		var url = app.isPhoneGap ? app.getHost() + "/home.aspx" : "../home.aspx";
		if ( isPublic ) {
			url = app.isPhoneGap ? app.getHost() + "/" : "../login.aspx";
		}
		window.location = url;
	}
}

function PageBeforeCreateManager(e) {
	var page = $(e.target);
	
	// set standard footer on all pages
	var footer = page.find("div[data-role='footer']");
	if ( !footer.hasClass("footer_fixed") ) {
		var footerText = '<div class="psg_point_balance ui-center"></div>';
		if (!app.isPhoneGap) {
			footerText = '<div class="ui-grid-a"><div class="ui-block-a"><div class="ui-center"><a data-ajax="false" onclick="psg.goDesktopSite();" class="ui-btn ui-btn-b ui-corner-all ui-mini psg-desktop-link"><i class="fa fa-desktop fa-lg"></i>&nbsp; Desktop Site </a></div></div><div class="ui-block-b">' + footerText;
			footerText += '</div></div>';
		}
		footer.html(footerText);
	}
	
	// Page name and icon
	page.find(".psg-section-name").each(function ( index ) {
		var section = $(this);
		var id = section.attr("psg-section-type-id");
		section.html(psg.getMenuIcon(id) + '&nbsp; ' + psg.getMenuName(id));
	});

	// set handler for remote content pages
	page.find('.remote-content').click(function(event) {
		var sectionName = page.attr("remote-content-topic");		// Terms or Privacy
		//if (id == "terms"){
		//	sectionName = "Terms";
		//}else if (id == "start_privacy"){
		//	sectionName = "Privacy";
		//}
		psg.setSessionItem('remote_section_name', sectionName);
		$.mobile.changePage('remotecontent.html');
	});
	
	// Setup online/offline indicator.
	if (app.isPhoneGap) {
		var header = page.find('div[data-role="header"]');
		if (!psg.isNothing(header)) {
			var offlineClass = app.isOnline(false) ? 'app-online' : 'app-offline';
			header.append(' \
				<a id="app_offline_link" href="#app_offline_message" data-rel="popup" data-transition="pop" \
				title="Offline" data-theme="b" class="app-connection ' + offlineClass + '">\
				<i class="fa fa-unlink"></i></a> \
			');
			//$(e.target).find('#app_offline_link').button();
			page.append(' \
				<div data-role="popup" id="app_offline_message" class="ui-content" data-theme="a" style="max-width:350px;"> \
					<p>You are currently <strong>offline</strong>.  Information may be out-of-date.</p> \
				</div>');
			page.find('#app_offline_message').popup();
		}
	}

	psg.pageInit();

	// standard menu for every page.  Each page can override the menu
	// in its _show() function.
	var contentType = page.attr('psg-popmenu-content-type');
	if (psg.isNothing(contentType) || contentType == "standard") {
		setMenu(e.target, getStandardMenu());
	}
	else {
		setMenu(e.target, getBaseMenu());
	}
}

// Sets the items that are always available in the popup menu.
// "items" is an array of { href:"page", text:"Prompt", options:'', dialog:true }.
function addBaseMenuItems( items ) {
	if (psg.isNothing(items)) { return; }
	
	var current = JSON.parse(psg.getSessionItem('popupmenu.base.items'));
	current = concatMenuItems(current, items);
	psg.setSessionItem('popupmenu.base.items', JSON.stringify(current));
	
	generateBaseMenu();
	generateStandardMenu();
}

function addStandardMenuItems( items ) {
	if (psg.isNothing(items)) { return; }
	
	var current = JSON.parse(psg.getSessionItem('popupmenu.standard.items'));
	current = concatMenuItems(current, items);
	psg.setSessionItem('popupmenu.standard.items', JSON.stringify(current));
	
	generateStandardMenu();
}

function concatMenuItems( existing, newones ) {
	var merged = []
	if (!psg.isNothing(existing)) {
		merged = existing.concat();
	}
	if (psg.isNothing(newones)) {
		return merged;
	}
	$.each(newones, function ( index, item ) {
		var count = merged.length;
		var href = item.href;
		for (var i = 0; i < count; i++) {
			if (merged[i].href == href) {
				merged[i] = item; // replace existing item
				return;
			}
		}
		merged.push(item);
	});
	return merged;
}

function generateBaseMenu() {
	var current = JSON.parse(psg.getSessionItem('popupmenu.base.items'));
	var menu = generateMenu(current);
	psg.setSessionItem('popupmenu.base.menu', menu);
}

function generateStandardMenu() {
	var root = JSON.parse(psg.getSessionItem('popupmenu.base.items'));
	if (psg.isNothing(root)) {
		root = [];
	}
	var standard = JSON.parse(psg.getSessionItem('popupmenu.standard.items'));
	if (psg.isNothing(standard)) {
		standard = [];
	}
	var items = concatMenuItems(root, standard);
	var menu = generateMenu(items);
	psg.setSessionItem('popupmenu.standard.menu', menu);
}

function generateMenu( items ) {
	if (psg.isNothing(items)) {
		return '';
	}
	var menu = '<li data-role="list-divider">Menu</li>';
	if ( typeof items == 'string' )
		menu += items;
	else {
		$.each(items, function (index, item) {
			menu += "<li><a href='" + item.href + "' " +
				('options' in item ? item.options : '') +
				('dialog' in item ? "data-transition='slide' data-rel='dialog'" : '') +
				">" + item.text + "</a></li>";
		});
	}
	return menu;
}

function getBaseMenu() {
	var menu = psg.getSessionItem('popupmenu.base.menu');
	if (psg.isNothing(menu)) {
		return '';
	}
	return menu;
}

function getStandardMenu() {
	var menu = psg.getSessionItem('popupmenu.standard.menu');
	if (psg.isNothing(menu)) {
		return '';
	}
	return menu;
}

function resetBaseMenu() {
	psg.removeSessionItem('popupmenu.base.items');
	psg.removeSessionItem('popupmenu.base.menu');
}

function resetStandardMenu() {
	psg.removeSessionItem('popupmenu.standard.items');
	psg.removeSessionItem('popupmenu.standard.menu');
}

// set the menu on a page (ul with class='popup_menu')
// with either a string that has the list as html in the form
// (<li><a href="options.html">Options</a></li>)
// or an array of objects with { href:"page", text:"Prompt", options:'', dialog:true }
// the page reference can either be the page element or the selector of the page element.
function setMenu(page, items) {
	if (psg.isNothing(items)) {
		// Hide the menu button.
		$(page).find('div[data-role="header"]').find('a[data-rel="panel"]').hide();
		return;
	}
	var li = '<li data-role="list-divider">Menu</li>';
	if ( typeof items == 'string' )
		li = items;
	else {
		$.each(items, function (index, item) {
			li += "<li><a href='" + item.href + "' " +
				('options' in item ? item.options : '') +
				('dialog' in item ? "data-transition='slide' data-rel='dialog'" : '') +
				">" + item.text + "</a></li>";
		});
	}
	var popup = $(page).find('.popup_menu');
	popup.html( li );
	popup.listview('refresh');
}

// remove a menu item from the page (either object or selector)
// matches the href string:
// removeMenuItem('#page_home','home.html')
function removeMenuItem(page, href) {
	$(page).find(".popup_menu a[href='" + href + "']").parent('li').remove();
}

function PageBeforeTransitionManager( event, ui ) {
	var history = ui.toPage.attr('psg-no-history');
	//ui.options.changeHash = !(!psg.isNothing(history) && history == "true");
}

function PageContainerBeforeShowManager(e,ui) {
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
	var activePageId = activePage[0].id;
    var previousId = null;
    
	switch (activePageId) {
		case 'page_index':
			if (app.deviceReadyFired){
				history.forward();
			}
			break;
		case 'page_config':
			page_config_show();
			break;
		case 'page_claim':
			page_claim_show();
			break;
		case 'page_claim_detail':
			page_claim_detail_show();
			break;
		case 'page_claim_history':
			page_claim_history_show();
			break;
		case 'page_claims_confirmation':
			page_claims_confirmation_show();
			break;
		case 'page_claims_landing':
			page_claims_landing_show();
			break;
		case 'page_contact':
		    page_contact_show();
			break;
		case 'page_enrollment':
			page_enrollment_show();
			break;
		case 'page_enrollment_confirmation':
			page_enrollment_confirmation_show();
			break;
		case 'page_home':
			page_home_show();
			break;
		case 'page_ispu_select':
			page_ispu_select_show();
			break;
		case 'page_invitation':
			page_invitation_show();
			break;
		case 'page_item_options':
			page_item_options_show();
			break;
		case 'page_login':
			page_login_show();
			break;
		case 'page_logout':
			page_logout_show();
			break;
		case 'page_orders':
		    page_orders_show();
			break;
		case 'page_order_detail':
		    page_order_detail_show();
			break;
		case 'page_password_reset':
			page_password_reset_show();
			break;
		case 'page_points_awarded':
		    page_points_awarded_show();
			break;
		case 'page_points_history':
		    page_points_history_show();
			break;
		case 'page_promotion_detail':
			page_promotion_detail_show();
			break;
		case 'page_promotion_history':
			page_promotion_history_show();
			break;
		case 'page_promotion_info':
			page_promotion_info_show();
			break;
		case 'page_profile':
			page_profile_show();
			break;
		case 'page_quick_points':
			page_quick_points_show();
			break;
        case 'page_receipt':
		    page_receipt_show();
			break;
		case 'page_remote_content':
			page_remote_content_show();
			break;
		case 'page_shopping_browse':
			page_shopping_browse_show();
			break;
        case 'page_shopping_cart':
            if (ui.prevPage !== undefined) {
                previousId = ui.prevPage[0].id;
            }
		    page_shopping_cart_show(previousId);
			break;
        case 'page_shopping_item_detail':
		    page_shopping_item_detail_show();
			break;
		case 'page_shopping_main':
			page_shopping_main_show();
			break;
        case 'page_shopping_onsale':
		    page_shopping_onsale_show();
			break;
		case 'page_shopping_recomended':
			page_shopping_recomended_show();
			break;	
		case 'page_shopping_search':
			page_shopping_search_show();
			break;
		case 'page_shopping_search_filter':
			page_shopping_search_filter_show();
			break;
        case 'page_wish_list':
            if (ui.prevPage !== undefined) {
                previousId = ui.prevPage[0].id;
            }
		    page_wish_list_show(previousId);
			break;
		case 'page_checkout_address':
			page_checkout_address_show();
			break;
		// Should this be renamed to page_checkout_address_edit?
		case 'page_edit_checkout_address':
			page_edit_checkout_address_show();
			break;
        case 'page_checkout_confirm':
		    page_checkout_confirm_show();
			break;
		case 'page_start':
			page_start_show();
			break;
		case 'page_whatsnew':
			page_whatsnew_show();
			break;
            
		default:
	}
}
