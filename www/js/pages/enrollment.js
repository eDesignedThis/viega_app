function page_enrollment_show(){
	var searchTerm = 'ENROLLMENT > FIELD';
	if (psg.participantTypeId != null && psg.participantTypeId != "0") {
		searchTerm = 'ENROLLMENT > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"] > FIELD';
	}
	if (!psg.isOpenEnrollment) {
		
		var participantKey = psg.getSessionItem('participantKey');
		if(psg.isNothing(participantKey)){
			$.mobile.pageContainer.pagecontainer('change', 'invitation.html');
			return;
		}
	}	
	var $xml = $(psg.configXml);
	var w9search = searchTerm + '[TYPE="w9"]';	
	if ($xml.find(w9search).length != 0){
		var message = "You cannot complete the enrollment on your mobile device. Please use a tablet or desktop";
		var formDiv = $('#enrollment_form_div');
		$('.ui-margin-top-1x').hide();
		$(':button').hide();
		formDiv.html(message);
		$('#page_enrollment_content').trigger('create');
		return false;
	}
	
	var fields = ParseFields('enrollment',searchTerm);
	var formDiv = $('#enrollment_form_div');
	formDiv.html(fields.html);
	formDiv.append(fields.script); 
	$('#page_enrollment_content').trigger('create');

	if (!psg.isOpenEnrollment) {
		var participantDataRow = JSON.parse(sessionStorage.getItem(app.getBase() + 'enrollPrefill'));
		if (participantDataRow != null) {
			PreFillForm(participantDataRow[0],'enrollment');
		}
	} else {
		if (psg.participantTypeId != null && psg.participantTypeId != "0") {
			formDiv.append('<input type="hidden" name="participant_type_id" value="' + psg.participantTypeId + '">');
		}
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
		if (data == null){return false;}
		if (data.Result == "success") {
			//Send tracking data to Google
			ga('send','event','Enrollment Success','Submit');
			psg.removeSessionItem('participantKey');
			if ((!app.isPhoneGap && app.offerMobileApp) || psg.requiresEnrollmentConfirmation) {
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

function ExpandAddressBlock(page,optionString){
	var formString='';
	formString +='<label for="' + page + '_line_one">Address</label><input name="line_one" id="' + page + '_line_one" type="text" data-rule-required="true" data-msg-required="Address is required." > \
          <label for="' + page + '_line_two">Address 2</label><input name="line_two" id="' + page + '_line_two" type="text"  > \
          <label for="' + page + '_city">City</label><input name="city" id="' + page + '_city" type="text" data-rule-required="true" data-msg-required="City is required." > \
          <label for="' + page + '_state">State Code</label><input name="state" id="' + page + '_state" type="text" data-rule-required="true" data-msg-required="State Code is required." style="width: 3em;"  \
		   data-rule-regex="true" data-psg-validation="^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$" data-msg-regex="Invalid State Code" > \
          <label for="' + page + '_zip">Zip Code</label><input name="zip" id="' + page + '_zip" type="text" data-rule-required="true" data-msg-required="Zip Code is required." style="width: 6em;" \
		   data-rule-regex="true" data-psg-validation="^((\\d{5})|([AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]\\d[A-Za-z]\\d[A-Za-z]\\d))$" data-msg-regex="Invalid Zip Code" >';
	formString += '<label for="' + page + '_country">Country</label><select id="' + page + '_country" name="' + page + '_country"  ';
	formString += ' data-rule-required="true" data-msg-required="Country is required." style="width: 3em;" >';
				var options = optionString.split('||');
				$.each(options, function(index, value) {
						if (value.indexOf('|') > 0) {
							var pairs = value.split('|');
							formString += '<option value="' + pairs[0] + '">' + pairs[1] + '</option>';
						}			
				});		
	formString += '</select>';
    return formString;
}
