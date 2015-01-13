function page_login_show() {
    var base = app.getBase();
	if (app.isPhoneGap) {
		var authFail = sessionStorage.getItem(base + 'authFail');
		if (authFail != null) {
			WriteError(authFail);
		}
	}
	if (app.isPhoneGap) {
		$("#psg-login-desktop-link").hide();
	}
    if (!app.offerMobileApp) {
        $("#download_app_offer").hide();
    } else {
	    $('login_app_logo').attr('src','img/logo.png');
	    $('#login_app_name').text(app.appName);
		$('#login_app_company').text(app.appCompany);
		var storeName = "";
		// determine device type (without phone gap)
		var ua = navigator.userAgent.toLowerCase();
		var isIOS = /(ipad|iphone|ipod)/g.test(ua);
		var isAndroid = /android/g.test(ua);
		var isWP = /(iemobile|lumia)/g.test(ua);
		var link = "";
		if (isIOS || isAndroid || isWP) {
			//alert(ua+"\n\nisIOS "+isIOS+" isAndroid "+isAndroid + " isChrome "+isChrome);
			if (isIOS)
			{
				var isChrome = ua.indexOf("crios") > 0;
				
				/* http://stackoverflow.com/questions/226986/how-can-i-launch-the-appstore-app-directly-from-my-application
				 From iTunes, drag the icon of your app to the desktop, this will give you a link you can use directly
				 (for example, http://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=284036524&mt=8 launches
				 the AppStore to Crosswords, both on a desktop and an iPhone).
				 Paste everything after the // into the link below

				 BC: I have confirmed that in safari and chrome on ios-6 and ios7 this does launch the app store app.
				 I can not confirm browsing to the correct app.
				 */
				//link = "itms-apps://";
				link = app.appUrlApple;
				storeName = 'FREE - On the App Store';

			}
			else if (isAndroid) {
				/* For android:market://details?id=<package_name>*/
				//link = "market://details?id=<package_name>";
				link = app.appUrlGoogle;
				storeName = 'FREE - On Google Play';
			}
			else if (isWP) {
			
				link = app.appUrlMicrosoft;
				storeName = 'FREE - On Windows Store';
			}
			$("#launch_app_store_link").attr("href", link);
		}
		if (link === "") {
		  $("#download_app_offer").hide();
		}
		$('#login_app_store').html(storeName);
	}
	
	if (psg.isOpenEnrollment === true) {
		$('#login_enrollment_link').attr("href", "enrollment.html");
	}
	
	var lastEmail = localStorage.getItem(base + 'last_email');
	if (lastEmail != 'undefined' && lastEmail != null && lastEmail != ''){
		$('#login_email').val(lastEmail);
	}

    $('#frmLogin').validate({ submitHandler: submitLoginForm });
	function submitLoginForm() {
        //TODO: move back here.  
		psg.login($('#login_email').val(), $('#login_password').val(), loginCallback);
	}
	function loginCallback(data) {
		if (data.Result != "success") {
			var error = $('#login_error');
			if (data.Result == null) {
				WriteError('General Error');
			} else {
				WriteError(data.Result);
			}
		} else {
			$.mobile.pageContainer.pagecontainer('change', 'home.html');
		}
	}
}

	
