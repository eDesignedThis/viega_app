function page_start_show(){
	if (psg.isOpenEnrollment) {
		$('#start_enroll').attr('href', 'enrollment.html');
	}
	
	/// Check if the user has a authToken, if so add a back button to the start page
	var base = app.getBase();
	var token = base + 'authToken';
	
	if (localStorage.getItem(token)) {
		
		var backButton = '<a data-rel="back" data-role="button" data-direction="reverse" data-transition="slide" data-icon="carat-l" data-iconpos="notext" class="ui-btn-left ui-link ui-btn ui-icon-carat-l ui-btn-icon-notext ui-shadow ui-corner-all" role="button">Back</a>';
		
		$('div[data-role="header"] .psg-class-program-name').before(backButton);
	}
	
	
}