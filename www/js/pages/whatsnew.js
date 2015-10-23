function page_whatsnew_show (){
//TODO: Cache these. Load from cache when offline
		getJson("MOBILE.ANNOUNCEMENTS",
				function (data) {
					var setString = '';
					$.each(data, function (index, value) {
						setString += ' <div data-role="collapsible"> \
					<h3>' + value.AlternateTitle + '</h3>' + value.Details + '</div>';
					});

					if (setString == '') {
						setString = '<p>No current announcements.</p>';
					}

					var div = $('#psg_collapsible_set_whats_new');
					div.html(setString);
					$('#psg_collapsible_set_whats_new').collapsibleset('refresh');
					// /// Find External Links and prepare them to be opened in native browser
     				// 	var exLinks = $("#page_whatsnew").find('a[href^="http:"], a[href^="https:"]');
     				// 	exLinks.addClass("MobileHelper").attr("rel", "external");				
				});
		
		
		
		
		
		//// Find the MobileHelper link class and open links in native browser
		// if (app.isPhoneGap) {
		// 
		// 	$(".colspLrg").delegate('.MobileHelper', 'click', function(e) {
		// 		
		// 		e.preventDefault();
		// 		
		// 		var outGoingLink = $(this).attr('href');
		// 		
		// 		console.log(outGoingLink);
		// 		
		// 		navigator.notification.confirm('Would you like to switch to your native browser to view this link?', goToBrowser, psg.programName, ['Yes','No']);
		// 		
		// 		function goToBrowser(buttonIndex){
		// 		
		// 			if (buttonIndex == 1) {
		// 				
		// 				
		// 				if (device.platform.toUpperCase() === 'ANDROID') {
		// 					
		// 					navigator.app.loadUrl(outGoingLink, { openExternal: true });
		// 					
		// 				} else{
		// 					
		// 					window.open(''+outGoingLink+'', '_system', 'location=yes');
		// 					
		// 				}
		// 				
		// 				
		// 				
		// 			};
		// 		
		// 		
		// 		}
		// 		
		// 		
		// 	});
		// 
		// }
		
		
		
		
		
		
		
}
