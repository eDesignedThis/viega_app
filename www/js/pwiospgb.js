function registerPushwooshIOS(appId, appName){
	console.log("initNotifications");
	var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
	
	console.log("add event listener");
	//set push notification callback before we initialize the plugin
	document.addEventListener('push-notification', function (event) {
		//get the notification payload
		var notification = event.notification;
		//display alert to the user for example
		navigator.notification.alert(
			notification.aps.alert,function(){},
			appName);
		//clear the app badge
		pushNotification.setApplicationIconBadgeNumber(0);
	});
	
	pushNotification.onDeviceReady();
	
	console.log("register device");
	//register for pushes
	pushNotification.registerDevice({alert:true, badge:true, sound:true, pw_appid: appId, appname: appName},
		function (status) {
			var deviceToken = status['deviceToken'];
			localStorage.setItem(app.getBase() + "deviceToken", deviceToken);
			console.warn('registerDevice: ' + deviceToken);
		},
		function (status) {
			console.warn('failed to register : ' + JSON.stringify(status));
			//alert(JSON.stringify(['failed to register ', status]));
		}
	);

	//reset badges on app start
	console.log("set badge number");
	//pushNotification.setApplicationIconBadgeNumber(0);
}