function registerPushwooshAndroid(appId, googleProjectId, appName){
	var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

	//set push notifications handler
	document.addEventListener('push-notification',
		function(event)
		{
            var message = event.notification.title;
            var userData = event.notification.userdata;

            //dump custom data to the console if it exists
            if(typeof(userData) != "undefined") {
				console.warn('user data: ' + JSON.stringify(userData));
			}

			//and show alert
			navigator.notification.alert(
				message,function(){},
				appName);
			
			//stopping geopushes
			pushNotification.stopGeoPushes();
		}
	);

	//trigger pending push notifications
	pushNotification.onDeviceReady();

	//register for pushes.
	// !!! Please note this is an API for PGB plugin. This code is different in CLI plugin!!!
	//At the moment I cannot update the plugin to the latest version. TY PGB Team!
	//see http://community.phonegap.com/nitobi/topics/malformed_xml_in_plugin_xml_file?utm_source=notification&utm_medium=email&utm_campaign=new_reply&utm_content=reply_button&reply%5Bid%5D=14224918#reply_14224918
	pushNotification.registerDevice({ projectid: googleProjectId, appid : appId },
		function(token)
		{
			localStorage.setItem(app.getBase() + "deviceToken", token);
			//callback when pushwoosh is ready
			onPushwooshAndroidInitialized(token);
		},
		function(status)
		{
			//alert("failed to register: " +  status);
		    console.warn(JSON.stringify(['failed to register ', status]));
		}
	);
}

function onPushwooshAndroidInitialized(pushToken)
{
	//output the token to the console
	console.warn('push token: ' + pushToken);

	var pushNotification = window.plugins.pushNotification;
	
	/* pushNotification.getTags(
		function(tags)
		{
			console.warn('tags for the device: ' + JSON.stringify(tags));
		},
		function(error)
		{
			console.warn('get tags error: ' + JSON.stringify(error));
		}
	) */;
	 

	//set multi notificaiton mode
	//pushNotification.setMultiNotificationMode();
	//pushNotification.setEnableLED(true);
	
	//set single notification mode
	//pushNotification.setSingleNotificationMode();
	
	//disable sound and vibration
	//pushNotification.setSoundType(1);
	//pushNotification.setVibrateType(1);
	
	pushNotification.setLightScreenOnNotification(true);
	
	//goal with count
	//pushNotification.sendGoalAchieved({goal:'purchase', count:3});
	
	//goal with no count
	//pushNotification.sendGoalAchieved({goal:'registration'});

	//setting list tags
	//pushNotification.setTags({"MyTag":["hello", "world"]});
	
	//settings tags
	/* pushNotification.setTags({deviceName:"hello", deviceId:10},
		function(status) {
			console.warn('setTags success');
		},
		function(status) {
			console.warn('setTags failed');
		}
	); */

	//Pushwoosh Android specific method that cares for the battery
	pushNotification.startGeoPushes();
}