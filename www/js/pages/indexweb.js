
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
		if (sessionStorage.getItem('startPage') != null){
			var startPage = sessionStorage.getItem('startPage');
			sessionStorage.removeItem('startPage');
			$.mobile.pageContainer.pagecontainer('change', startPage);
		} else {
			$.mobile.pageContainer.pagecontainer('change', 'login.html');
		}
		
		/// Google Universal tracking code for mobile app
		
		var universalCode = '';
		if (universalCode !=='') {
		    
		    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		    })(window,document,'script','js/googleAnalytics.js','ga');
		    
		   
		    var ua = universalCode;
		    
			ga('create', ua, 'auto');  
			ga('set','checkProtocolTask',null);
			ga('set','checkStorageTask',null);
		    
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
		
		
		
	},
	isPhoneGap: false,
	offerMobileApp: false,
	appName: null,
	appCompany: null,
	isOnline: function () { return true; },
	//TODO: Change url to ".." before publishing
	getHost: function () { return ".."; }, //https://kheldalpha.rwdshq.com/532  https://kheldalpha.rwdshq.com/140
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
