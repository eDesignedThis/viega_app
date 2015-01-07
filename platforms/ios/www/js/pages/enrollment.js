function page_enrollment_show(){
	var searchTerm = 'ENROLLMENT > FIELD';
	if (psg.participantTypeId != "0" && !psg.isOpenEnrollment){
		searchTerm = 'ENROLLMENT > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"] > FIELD';
	}

	var fields = ParseFields('enrollment',searchTerm);
	var formDiv = $('#enrollment_form_div');
	formDiv.html(fields.html);
	formDiv.append(fields.script); 
	$('#page_enrollment_content').trigger('create');

	if (!psg.isOpenEnrollment) {
		var participantDataRow = JSON.parse(sessionStorage.getItem(app.getBase() + 'enrollPrefill'));
		PreFillForm(participantDataRow[0],'enrollment');
	}

	$('#frmEnrollment').validate({ submitHandler: submitEnrollmentForm });
	function submitEnrollmentForm() {
		var password = $('#password').val();
		var password_confirm = $('#password_confirm').val();
		if (password != password_confirm){
			ShowAlert("Passwords do not match.", "Error");
			return false;
		}
		var formContent = $('#frmEnrollment').serialize();
		var participantKey = psg.getSessionItem('participantKey');
		var data = null;
		if (participantKey == null){
			data = JSON.stringify({ form_contents: formContent, guid: psg.programGuid });
		}else{
			data = JSON.stringify({ form_contents: formContent, guid: psg.programGuid, participant_key: participantKey });
		}
		getJson("MOBILE.ENROLLMENT.SAVE",submitEnrollmentResults,data);
	}
	
	function submitEnrollmentResults( data ) {
		if (data.Result == null || data.Result == "success") {
			psg.removeSessionItem('participantKey');
			if (!app.isPhoneGap || psg.requiresEnrollmentConfirmation) {
				$.mobile.changePage('enrollmentconfirmation.html');
			}
			else {
				psg.login($('#enrollment_email').val(), $('#password').val(), loginCallback);
			}
		}
		else {
			WriteError(data.Result);
		}
	}
	
	function loginCallback ( data ) {
		if (data.Result == null || data.Result == "success") {
			$.mobile.changePage('home.html');
		}
		else {
			// Login is better for handling errors.
			$.mobile.changePage('login.html');
		}
	}
}

function ExpandAddressBlock(page){
	var formString='';
	formString +='<label for="line_one">Address</label><input name="line_one" id="' + page + '_line_one" type="text" data-rule-required="true" data-msg-required="Address is required." > \
          <label for="line_one">Address 2</label><input name="line_two" id="' + page + '_line_two" type="text"  > \
          <label for="line_one">City</label><input name="city" id="' + page + '_city" type="text" data-rule-required="true" data-msg-required="City is required." > \
          <label for="line_one">State Code</label><input name="state" id="' + page + '_state" type="text" data-rule-required="true" data-msg-required="State Code is required." > \
          <label for="line_one">Zip Code</label><input name="zip" id="' + page + '_zip" type="text" data-rule-required="true" data-msg-required="Zip Code is required.">';		  
    return formString;
}
