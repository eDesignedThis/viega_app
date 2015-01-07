function page_home_show(){
	if (!app.isPhoneGap){
		$('#home_settings').hide();
	}
	
	var menuString = getHomeMenu();
    var ul = $('#home_menu');
	ul.html(menuString);
	ul.listview('refresh');
	
	
	//removeMenuItem('#page_home','home.html');
//	setMenu('#page_home',
//		[{href:"config.html", text:"Options", dialog:true },
//			{href:"login.html",text:"Logout"} ] );

}

function getHomeMenu(){
	    if (psg.homeMenu != null){
			return psg.homeMenu;
		}
		
		var supportedSections = {"55":"pointshistory.html","57":"contact.html","89":"claimslanding.html",
					"68":"profile.html","71": "shoppingmain.html","84": "quickpoints.html"};
		var menuString = '<li><a href="whatsnew.html" data-transition="slide">' + psg.getMenuIcon("whats_new") + '&nbsp; What\'s New </a></li>';
		var xml = $(psg.configXml);
		var search = "MENU > SECTION";
		if (psg.participantTypeId != null && psg.participantTypeId != 0){
			search = 'MENU > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]';
		}
		
		var popmenuItems = [{ href: "home.html", text: "Home" }, { href: "whatsnew.html", text: "What's New" }];
		var hasClaimLanding = false;
		xml.find(search).each( function(){
			var item = $(this);
			var sectionType = item.attr("TYPE_ID");
			if (sectionType == 89) {
				hasClaimLanding = true;
			}
			if (sectionType in supportedSections ) {
				menuString += '<li><a href="' + supportedSections[sectionType] + '" data-transition="slide">' + psg.getMenuIcon(sectionType) + '&nbsp; ' + item.attr("NAME") +'</a></li>'
				popmenuItems[popmenuItems.length] = { href: supportedSections[sectionType], text: item.attr("NAME") };
			}
		});
		addStandardMenuItems( popmenuItems );
		psg.homeMenu = menuString;
		
		var historyMenu =  '<li><a href="pointsawarded.html" data-transition="slide"><i class="fa fa-trophy fa-lg fa-fw ui-menu-icon"></i>&nbsp; Awards and Adjustments </a></li> \
							<li><a href="orders.html" data-transition="slide"><i class="fa fa-truck fa-lg fa-fw ui-menu-icon"></i>&nbsp; Orders </a></li>';
		if (hasClaimLanding) {
			historyMenu += '<li><a href="claimhistory.html" data-transition="slide"><i class="fa fa-line-chart fa-lg fa-fw ui-menu-icon"></i>&nbsp; Performance Tracking</a></li>';
		}	
			psg.historyMenu = historyMenu
		
		return menuString;
	}
