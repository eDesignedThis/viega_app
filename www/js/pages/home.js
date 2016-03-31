function page_home_show(){
	if (!app.isPhoneGap){
		$('#home_settings').hide();
	}

	var menuString = getHomeMenu();
    var ul = $('#home_menu');
	ul.html(menuString);
	ul.listview('refresh');

}

function getHomeMenu(){
	    if (psg.homeMenu != null){
			return psg.homeMenu;
		}
		
		var supportedSections = {"55":"pointshistory.html","57":"contact.html","58":"learnearnmain.html","89":"claimslanding.html",
					"68":"profile.html","71": "shoppingmain.html","84": "quickpoints.html"};
		var xml = $(psg.configXml);
		var search = "MENU > SECTION";
		if (psg.participantTypeId != null && psg.participantTypeId != 0){
			search = 'MENU > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]  > SECTION';
		}
		
		var menuIcons={  
			 "whats_new" : '<i class="fa fa-newspaper-o fa-lg fa-fw ui-menu-icon"></i>',
			  "55" : '<i class="fa fa-history fa-lg fa-fw ui-menu-icon"></i>',
			  "57" : '<i class="fa fa-envelope-o fa-lg fa-fw ui-menu-icon"></i>',
			  "58" : '<i class="fa fa-book fa-lg fa-fw ui-menu-icon"></i>',
			  "89" : '<i class="fa fa-clipboard fa-lg fa-fw ui-menu-icon"></i>',
			  "68" : '<i class="fa fa-user fa-lg fa-fw ui-menu-icon"></i>',
			  "71" : '<i class="fa fa-gift fa-lg fa-fw ui-menu-icon"></i>',
			  "84" : '<i class="fa fa-certificate fa-lg fa-fw ui-menu-icon"></i>',
			  "points_awarded" : '<i class="fa fa-trophy fa-lg fa-fw ui-menu-icon"></i>',
			  "orders" : '<i class="fa fa-truck fa-lg fa-fw ui-menu-icon"></i>',
			  "claim_history" : '<i class="fa fa-line-chart fa-lg fa-fw ui-menu-icon"></i>',
			  "wish_list" : '<i class="fa fa-star-o fa-lg fa-fw ui-menu-icon"></i>',
			  "shopping_browse" : '<i class="fa fa-th fa-lg fa-fw ui-menu-icon"></i>',
			  "shopping_cart" : '<i class="fa fa-shopping-cart fa-lg fa-fw ui-menu-icon"></i>',
			  "shopping_search_filter" : '<i class="fa fa-search-minus fa-lg fa-fw ui-menu-icon"></i>',
			  "rec_items" : '<i class="fa fa-smile-o fa-lg fa-fw ui-menu-icon"></i>',
			  "card_awards" : '<i class="fa fa-trophy fa-lg fa-fw ui-menu-icon"></i>',
			  "card_fundings" : '<i class="fa fa-money fa-lg fa-fw ui-menu-icon"></i>',
			  };
		var menuNames ={
			"claim_history":"Performance Tracking",
			"orders":"Orders",
			"points_awarded":"Awards and Adjustments",
			"rec_items":"Reward Yourself!",
			"shopping_browse":"Browse Departments",
			"shopping_cart":"Shopping Cart",
			"shopping_search_filter":"Filter &amp; Sort",
			"whats_new":"What's New",
			"wish_list":"Wish List",
			"card_fundings":"Funding Info",
			"card_awards":"Awards and Adjustments"};
		setHomeIcons(menuIcons);
		
		var menuString = '<li><a href="whatsnew.html" data-transition="slide">' + psg.getMenuIcon("whats_new") + '&nbsp; What\'s New </a></li>';
		var popmenuItems = [{ href: "home.html", text: "Home" }, { href: "whatsnew.html", text: "What's New" }];
		var hasClaimLanding = false;
		xml.find(search).each( function(){
			var item = $(this);
			var sectionType = item.attr("TYPE_ID");
			if (sectionType == 89) {
				hasClaimLanding = true;
			}
			if (sectionType == 71 && item.attr("LOCATION") == -2 ) {
				return true;
			}
			if (sectionType in supportedSections ) {
				menuString += '<li><a href="' + supportedSections[sectionType] + '" data-transition="slide">' + psg.getMenuIcon(sectionType) + '&nbsp; ' + item.attr("NAME") +'</a></li>'
				popmenuItems[popmenuItems.length] = { href: supportedSections[sectionType], text: item.attr("NAME") };
				
				var searchMenu = "MENU";
				if (psg.participantTypeId != null && psg.participantTypeId != 0){
					searchMenu = 'MENU > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]';
				}
				searchMenu += ' > SECTION[TYPE_ID="' + sectionType + '"]';
				
				var matching = $(psg.configXml).find(searchMenu);
				menuNames[sectionType] = matching.length > 0 ? matching.attr("NAME") : "";
			}
		});
		
		var historyMenu = ''; 
		if (psg.payoutType != '1') {
			historyMenu =  '<li><a href="pointsawarded.html" data-transition="slide">' + psg.getMenuIcon("points_awarded") + '&nbsp; Awards and Adjustments </a></li> \
							<li><a href="orders.html" data-transition="slide">' + psg.getMenuIcon("orders") + '&nbsp; Orders </a></li>';
		} else {
			historyMenu = '<li><a href="cardawards.html" data-transition="slide">' + psg.getMenuIcon("card_awards") + '&nbsp; Awards and Adjustments </a></li> \
						    <li><a href="cardfundings.html" data-transition="slide">' + psg.getMenuIcon("card_fundings") + '&nbsp; Funding </a></li>';
		}
		if (hasClaimLanding) {
			historyMenu += '<li><a href="claimhistory.html" data-transition="slide">' + psg.getMenuIcon("claim_history") + '&nbsp; Performance Tracking</a></li>';
		}	
		
		setHomePopupMenu(popmenuItems);
		setHomeMenuString(menuString);
		setHomeHistoryMenu(historyMenu);
		setHomeMenuNames(menuNames);	
		return psg.homeMenu;
	}
	//Easy to override
	function setHomeIcons(menuIcons){
		psg.menuIcons = menuIcons;
	}
	function setHomeMenuString(menuString){
		psg.homeMenu = menuString;
	}
	function setHomeMenuNames(menuNames){
		psg.menuNames = menuNames;
	}
	function setHomeHistoryMenu(historyMenu){
		psg.historyMenu = historyMenu;
	}
	function setHomePopupMenu(popmenuItems){
		addStandardMenuItems( popmenuItems );
	}
