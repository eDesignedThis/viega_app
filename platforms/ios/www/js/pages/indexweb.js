
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
	  $(document).ready(this.onDocumentReady);
	  if ($.isReady) {
		app.onDocumentReady();
	  }
    },
	onDocumentReady: function() {
		psg.init();
		//for pages loaded in the future
		$(document).on('pagecreate', PageBeforeCreateManager);
		$(document).on('pagecontainerbeforetransition', PageBeforeTransitionManager);
		$(document).on('pagecontainerbeforeshow', PageContainerBeforeShowManager);
		$.mobile.pageContainer.pagecontainer('change', 'login.html');
	},
	isPhoneGap: false,
	offerMobileApp: false,
	appName: null,
	appCompany: null,
	isOnline: function () { return true; },
	//TODO: Change url to ".." before publishing
	getHost: function () { return ".."; },
	getBase: function () {
			var stop = window.location.pathname.indexOf("/m/") + 3;
			return window.location.pathname.substring(0, stop);
	},
	standardErrorHandler: function (xhr, status, settings) {
		if (status == 'timeout' || xhr.statusText == 'timeout') {
			alert("No Internet Connection?\nUnable to reach the server.  Please try again later");
			return;
		}
		if (xhr.status === 401 || xhr.status === 404) {
			 $.mobile.pageContainer.pagecontainer('change', 'timeout.html');
		} else {
			alert("Server Error\n" + xhr.statusText);
		}
	}
};
