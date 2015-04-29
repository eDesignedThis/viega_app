function page_enrollment_confirmation_show(){
	if (app.isPhoneGap) {
		$('#psg-enrollment-confirmation-app-offer').hide();
	}
	
	$('#psg-enrollment-confirmation-continue-button').off('click', handleContinue).on('click', handleContinue);

	$('#psg-enrollment-confirmation-message').hide();
	var sectionName = 'Enrollment Confirmation';
	if (psg.requiresEnrollmentConfirmation) {
		var cache = psg.getCache(sectionName, 24);
		if (!cache.expired){
			loadRemoteContent(cache.data);
		}
		else {
			var canFail = false;
			if (cache.data != null){
				canFail=true;
			}
			getJson('REMOTE.ENROLLMENT.CONFIRMATION.CONTENT', handleContentCallback);	
		}
	}

	function loadRemoteContent ( data ) {
		if (psg.isNothing(data) || psg.isNothing(data.Content)) {
			$('#psg-enrollment-confirmation-message').hide();
		}
		else {
			$('#psg-enrollment-confirmation-message-title').html(data.Title);
			$('#psg-enrollment-confirmation-message-content').html(data.Content);
			$('#psg-enrollment-confirmation-message').show().collapsible('refresh');
		}
	}

	function handleContentCallback ( data ) {
		if (data.Result == null || data.Result == "success") {
			loadRemoteContent(data);
			psg.setCache(sectionName, data);
		}
		else {
			WriteError(data.Result);
		}
	}
	
	function handleContinue () {
		psg.login($('#enrollment_email').val(), $('#password').val(), loginCallback);
	}
	
	function loginCallback ( data ) {
		if (data.Result == null || data.Result == "success") {
			$.mobile.changePage('home.html');
			
			//Send tracking data to Google
			ga('send','event','Enrollment Confirmation','Submit');
		}
		else {
			// Login is better for handling errors.
			$.mobile.changePage('login.html');
		}
	}
}
