function registerPushwooshIOS(appId, appName){
				console.log("initNotifications");
				var pushNotification = window.plugins.pushNotification;
				console.log(pushNotification);
	
				console.log("add event listener");
				//set push notification callback before we initialize the plugin
				document.addEventListener('push-notification', function (event) {
					//get the notification payload
					var notification = event.notification;
	
					//display alert to the user for example
					navigator.notification.alert(
						notification.aps.alert,function(){
                                                    
                                                    //Send tracking data to Google
                                                    ga('send','event','User Opened Push Notification iOS','Open');
                                                    
                                                    },
						appName);
	
					//clear the app badge
					pushNotification.setApplicationIconBadgeNumber(0);
				});
	
				console.log("ini the plugin");
				pushNotification.onDeviceReady({pw_appid: appId});
	
				console.log("register device");
				//register for pushes
				pushNotification.registerDevice(
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
				pushNotification.setApplicationIconBadgeNumber(0);
}