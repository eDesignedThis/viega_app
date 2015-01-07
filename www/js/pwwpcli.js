function registerPushwooshWP(appId, appName, serviceName) {
    var pushNotification = window.plugins.pushNotification;
 
    //set push notifications handler
    document.addEventListener('push-notification', function(event) {
                //get the notification payload
                var message = event.notification.content;
                message = message.replace(/\+/g," ");
                //display alert to the user for example
				navigator.notification.alert(
					message,function(){},
					appName);
                
    });
 
    //initialize the plugin
    pushNotification.onDeviceReady({ appid: appId, serviceName: serviceName });
 
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