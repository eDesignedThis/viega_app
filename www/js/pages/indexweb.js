
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
		var hasQS = location.search != null && location.search != '';
		if (hasQS) {
			var host = getQSParameterByName('host');
			if (host != null) {
				app.getHost = (function () {
					return function () {
						return host;
					}
				})();
			}
		}
		psg.init();
		//for pages loaded in the future
		$(document).on('pagecreate', PageBeforeCreateManager);
		$(document).on('pagecontainerbeforetransition', PageBeforeTransitionManager);
		$(document).on('pagecontainerbeforeshow', PageContainerBeforeShowManager);
		if (hasQS) {
		    var sso = getQSParameterByName('sso');
			if (sso != null){
				var participantTypeId = getQSParameterByName('pid');
				var startPage = getQSParameterByName('startPage');
				if (startPage == null)
					startPage = 'home.html';
				if (participantTypeId != null) {
					psg.participantTypeId = participantTypeId;
					sessionStorage.clear();
					psg.homeMenu = null; // need to reset home menu, too.
					getHomeMenu();
					getJson("POINTS.SUMMARY",function (data) { 
								if (typeof data !== null) {
									UpdatePointAccount(data);
								}
								
								$.mobile.pageContainer.pagecontainer('change', startPage);
							}
					);
					return
				}
			} else {
				var page = getQSParameterByName('page');
				if (page != null) {
					var redirectPage = '';
					var redirectParameters = '';
					if (page.toLowerCase().startsWith('catalog.aspx')) {
						redirectPage = 'shoppingbrowse.html';
						redirectParameters = page.toLowerCase().replace('catalog.aspx?department=','');
					}
					if (page.toLowerCase().startsWith('history.aspx')) {
						redirectPage = 'pointshistory.html';
					}
					if (page.toLowerCase().startsWith('profile.aspx')) {
						redirectPage = 'profile.html';
					}
					localStorage.setItem('redirectPage', redirectPage);
					localStorage.setItem('shopping.departments', redirectParameters);
				}
			
			}
			
		}
		if (sessionStorage.getItem('startPage') != null){
			var startPage = sessionStorage.getItem('startPage');
			sessionStorage.removeItem('startPage');
			$.mobile.pageContainer.pagecontainer('change', startPage);
		} else {
			$.mobile.pageContainer.pagecontainer('change', 'login.html');
		}
		
		 /// Google Universal tracking code for mobile app
        
        
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
			ga('create', ua, 'auto');  
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
		
		
		
	},
	isPhoneGap: false,
	offerMobileApp: false,
	appName: null,
	appCompany: null,
	isOnline: function () { return true; },
	//DO NOT CHANGE. Use ?host=xxx to change getHost;
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
