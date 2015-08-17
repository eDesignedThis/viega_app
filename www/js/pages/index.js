//called once only after first install
//Per program customization goes here. 

var app = {
    // Application Constructor
    
	initialize: function() {
	    $('#index_header').text(config.appName);
        this.bindEvents();
    },
	deviceReadyFired: false,
     // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
	    //phonegap only
		document.addEventListener("menubutton", function(){
													if (!app.deviceReadyFired){
														return;
													}
													$.mobile.pageContainer.pagecontainer('change', 'settings.html');
												}, false);
        document.addEventListener('deviceready', this.onDeviceReady, false);
		$(document).on('pagecreate',PageBeforeCreateManager);
		$(document).on('pagecontainerbeforetransition', PageBeforeTransitionManager);
		$(document).on('pagecontainerbeforeshow',PageContainerBeforeShowManager);

    },
    // deviceready Event Handler
    //
    onDeviceReady: function() {
        app.deviceReadyFired = true;
	    app.receivedEvent('deviceready');
	    
	    /// Google Universal tracking code for mobile app
        
        var userDeviceId = device.uuid;
        var uaConfigNum = config.googleUA;
        var mockUaCode = 'UA-00000000-1';
        
        if ( uaConfigNum !=='') {
            var universalCode = uaConfigNum;
			console.log("GA Code is Set");
        } else {
             var universalCode = mockUaCode;
			 console.log("Using Mock Code");
        }
		
		
        
		
		if (universalCode !=='') {
            
            //  Set the campaign source for proper view reporting
            if (!app.isPhoneGap) {
                
                var campaignSoure = 'Mobile Opt';
                console.log("Tracking Mobile Opt Site");
                
            } else if (app.isPhoneGap) {
                
                var campaignSoure = 'Mobile App';
                console.log("Tracking Mobile App");
            }
           
		    
		    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		    })(window,document,'script','js/googleAnalytics.js','ga');
		    
		    // The UA number changes per app
		    
		    var ua = universalCode;
		    var uuid = userDeviceId; //device.uuid;
			ga('create', ua, {'storage': 'none','clientId': uuid });  
			ga('set','checkProtocolTask',null);
			ga('set','checkStorageTask',null);
            ga('set', 'campaignSource', campaignSoure);
		    
			ga('send', 'pageview'); 
			
		    $(document).on('pageshow', '[data-role=page], [data-role=dialog]', function (event, ui) {
					    try {
						if ($.mobile.activePage.attr("data-url")) {
						    ga('send', 'pageview', $.mobile.activePage.attr("id")); 
						} else {
						    ga('send', 'pageview');
						}
					    } catch (err) {}
			});
                    
                    
        }   else {
            
                if (!('ga' in window)){
                    window.ga = function(){
                        window.ga.q.push(arguments);
                        };
                    window.ga.q = [];
                }        
                    
             
            }
		
		
		//Send tracking data to Google
		ga('send','event','User Launched App','Open');
		
		
		app.phoneGapInit();
		
        if ($.isReady){
			app.onDocumentReady();
		}else{
			$(document).ready(this.onDocumentReady);
		}

		document.addEventListener("offline", app.onOffline, false); // must be on or after Device Ready
		document.addEventListener("online", app.onOnline, false);
		app.initNotifications();
		
		/// Change the color of the status bar to match the header color
		
		StatusBar.backgroundColorByHexString('#000');
		
		
		
    },
	onDocumentReady: function() {

		psg.init();
		if(localStorage.getItem(app.getBase() + 'authToken')){
			app.authenticate(function() {
				if (app.authSuccess){
					$.mobile.pageContainer.pagecontainer('change', 'home.html');
				}
			});
		}else
		{
		  $.mobile.pageContainer.pagecontainer('change', 'start.html');
		}
	},
	onOffline: function () {
		$('app-connection').removeClass('app-online').addClass('app-offline');
	},
	onOnline: function () {
		$('app-connection').removeClass('app-offline').addClass('app-online');
	},
	isPhoneGap: true,
	offerMobileApp: false,
	isOnline: function(showAlert){
	    if (psg.isNothing(showAlert)){
			showAlert = true;
		}
		var online = true;
		if (navigator == 'undefined'){
			return true;
		}
		var state = navigator.network.connection.type;
		if (state == Connection.NONE){
			online =  false;
		}		
		if (!online && showAlert){
			ShowAlert("This feature requires Internet connectivity  Please try again when you are connected to the Internet.", "Not Connected");
		}
		return online;
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	authenticate: function (callback){
	   app.authSuccess = false;

		var base = app.getBase();
		var token = localStorage.getItem(base + 'deviceToken');
	    var authToken = localStorage.getItem(base + 'authToken');
	    var tokenData = JSON.stringify({ token: authToken, uuid: device.uuid, os: device.platform
										, deviceToken : token});
		if (!app.isOnline(false))
		{
		  ShowAlert("Most features are not available when offline.  Please connect to the Internet", "Offline");
		  $.mobile.loading( 'hide');
		  $.mobile.pageContainer.pagecontainer('change', 'home.html');
		  app.authSuccess = false;
		  return;
		}

		showSpinner();
		$.ajax({
			url: app.getHost() + '/json/jsonSecure.ashx?action=AUTHENICATE',
			type: "POST",
			data: tokenData,
			contentType: "application/json; charset=utf-8",
			accept: 'application/json',
			dataType: "json",
			timeout: 6000,
			success: function(data){
				hideSpinner();
				if (data.Result != "success") {
					//TODO: what happens when it fails
					sessionStorage.setItem(app.getBase() + 'authFail',
						'Your authentication token is invalid.  Please log on again');
					 $.mobile.pageContainer.pagecontainer('change', 'login.html');
				} else {
					if (typeof data.PointAccount !== null) {
						UpdatePointAccount(data.PointAccount);
						psg.participantTypeId = data.ParticipantTypeId;
						psg.setCache('participant_type_id', {"ParticipantTypeId": data.ParticipantTypeId});
					}
					app.authSuccess = true;
					callback();
				}
			},
			error: function(xhr,status){
			   hideSpinner();
			   app.authSuccess = false;
			   if (status == 'timeout' || xhr.statusText == 'timeout' ){
					ShowAlert("Unable to reach the server.  Please try again later", "No Internet Connection?");
				} else {
					ShowAlert(xhr.statusText,"Server Error");
				}
				$.mobile.pageContainer.pagecontainer('change', 'home.html');
			},
			async: false
		});
	},
	phoneGapInit: function (){
	    //Configuration to make sure things work the first launch even if offline
		var initialLoad = (localStorage.getItem(app.getBase() + 'ProgramInitComplete')  == null) ? true : false;
		
		if (initialLoad) {
			$.ajax({
					async: false,
					url: "js/phonegapinit.js",
					dataType: "script"
			}).fail(function( jqxhr, settings, exception ) {
						alert( "Unable to load Config." );
			}).success(function(){
				//alert("done");
				localStorage.setItem(app.getBase() + 'ProgramInitComplete','true');
                
                //Send tracking data to Google
				ga('send','event','User Installed App','Install');
			});
		}
	},
	getHost: function() { return config.host;},
	getBase: function() { return config.base;},
	initScanField: function (fieldName){	
		$('#scan_' + fieldName).on('click', function (e){
		    e.preventDefault();
			cordova.plugins.barcodeScanner.scan(
				function (result) {
					$('#' + fieldName).val(result.text);
				},
				function (error) {
					navigator.notification.alert('Unable to scan code', function(){}, 'Scan Failed', 'OK');
				}
			);
		});
	},
	initPictureField: function (fieldName){	
		$('#picture_' + fieldName).on('click', function (e){
			e.preventDefault();
			navigator.camera.getPicture(
				function (imageData) {
					$('#' + fieldName).val(imageData);
					$('#img_' + fieldName).show();
					$('#img_' + fieldName).attr("src",imageData); // "data:image/jpeg;base64," + imageData;
					
				},
				function (error) {
					navigator.notification.alert('Unable to get picture', function(){}, 'Capture Failed', 'OK');
				},
				{ 	quality: 75,
					destinationType: Camera.DestinationType.FILE_URI
				}
			);
		});
	},
	authSuccess: false,
	standardErrorHandler: function (xhr, status, settings) {
		if (status == 'timeout' || xhr.statusText == 'timeout' ){
			ShowAlert("Unable to reach the server.  Please try again later", "No Internet Connection?");
			return;
		}
		if (xhr.status === 401 || xhr.status === 404) {
			app.authenticate(function() {
				if (app.authSuccess) {
					$.ajax(settings)
						.fail(function () {
							ShowAlert("Unable to authenticate with the server.  Please try again later", "No Internet Connection?");
						});
				}
			});
		} else {
			ShowAlert(xhr.statusText,"Server Error");
		}
	},
	// initialize the app for in app notifications
	initNotifications: function()
	{
		//there are two types of plug-ins for Pushwoosh.  The CLI is different than PGBuild.
		//change js files to get the right ones.  Assume build for now.
		var pushNotification = window.plugins.pushNotification;
		var appId = config.appPushId;
		var appName = config.appName;
		var googleProjectNumber = config.googleProjectNumber;
		var serviceName = config.msServiceName;
		
		if(device.platform == "Android")
		{
			registerPushwooshAndroid(appId, googleProjectNumber, appName);
		}
		if(device.platform == "iPhone" || device.platform == "iOS")
		{
			registerPushwooshIOS(appId, appName);
		}
		if(device.platform == "Win32NT")
		{
			registerPushwooshWP(appId, appName, serviceName);
		}
	}	
};
