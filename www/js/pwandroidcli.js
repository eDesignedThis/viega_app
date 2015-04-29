function registerPushwooshAndroid(appId, googleProjectId, appName){
	// https://www.pushwoosh.com/programming-push-notification/android/android-additional-platforms/phonegapcordova-sdk-integration/
	var pushNotification = window.plugins.pushNotification;
	
	//set push notifications handler
	document.addEventListener('push-notification', function(event) {
		var message = event.notification.title;
		var userData = event.notification.userdata;
								 
		if(typeof(userData) != "undefined") {
			console.warn('user data: ' + JSON.stringify(userData));
		}
									 
		//and show alert
		navigator.notification.alert(
			message,function(){
				
			    //Send tracking data to Google
                            ga('send','event','User Opened Push Notification Android','Open');
				
				},
			appName);
	});
 
	//initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
	// https://code.google.com/apis/console/b/0/?noredirect&pli=1#project:485124473257:overview
	pushNotification.onDeviceReady({ projectid: googleProjectId, appid : appId });
 
	//register for pushes
	pushNotification.registerDevice(
		function(status) {
			var pushToken = status;
			localStorage.setItem(app.getBase() + "deviceToken", pushToken);
			console.warn('push token: ' + pushToken);
		},
		function(status) {
			console.warn(JSON.stringify(['failed to register ', status]));
		}
	);
}