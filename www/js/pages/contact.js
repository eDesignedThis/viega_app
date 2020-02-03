function page_contact_show(){
        $('#contact_subject_container').show();
        $('#contact_question_container').show();
        $('#contact_submit').show();
        $('#contact_result').text('');
		
		var useDefaults = '0';
		var $xml = $(psg.configXml);

		if ($xml.find('CONTACTS[USE_DEFAULTS="1"]').length == 1){
			useDefaults = '1';
		}	
		
		var options = '';
		if(useDefaults == '1'){
			if (psg.payoutType != '1') {
				options = '<option value="Catalog Question">Catalog Question</option> \
						<option value="My Shopping Order">My Shopping Order</option> \
						<option value="Track an Order">Track an Order</option> \
						<option value="Return an Item">Return an Item</option>';
				} else {
					options = '<option value="My Prepaid Debit Card">My Prepaid Debit Card</option>';
				}
				options +=	'<option value="An Award Correction">An Award Correction</option> \
							<option value="Program Question">Program Question</option>';
			
			}

		//debugger;
		var useConfiguredOptions = '0';
		$xml.find('CONTACTS > CONTACT').each(function(index){
			useConfiguredOptions = '1';
           var id = $(this)[0].attributes.CONTACT_SUBJECT_ID;
		   var textValue = $(this)[0].attributes.CONTACT_SUBJECT_NAME;
			options +=	'<option value="' + id.value + '">' + textValue.value + '</option>';
        });
	
		options +=	'<option value="Other">Other</option>';
		$('#use-configuration-options').val(useConfiguredOptions); // hidden field 
		
		$('#contact_subject').html(options);				
        $('#contact_subject').change( function () {
            var other_subject_container = $('#contact_other_subject_container');
			var other_subject = $('#contact_other_subject');
            if ($(this).find(":selected").val() == "Other") {
                other_subject_container.show();
                other_subject.addClass('required');
            } else {
                other_subject_container.hide();
                other_subject.removeClass('required');
            }
        });

    $('#form_contact').validate({ submitHandler: submitContactForm}); 
}

 function submitContactForm() {
      var data = JSON.stringify({ subject: $('#contact_subject').val(), other: $('#contact_other_subject').val(), question: $('#contact_question').val(), use_config: $('#use-configuration-options').val() });
      getJson("CONTACT.CONTACTUSPOST", HandleContactSubmit, data);
      
        //Send tracking data to Google
        ga('send','event','User Submitted Contact Form','Submit');
      
    }

    function HandleContactSubmit(data) {
        if (data.Result == "success") {
            var result = $('#contact_result');
            result.show();
            $('#contact_subject_container').hide();
            $('#contact_other_subject_container').hide();
            $('#contact_other_subject_container').val('');
            $('#contact_question_container').hide();
            $('#contact_question_container').val('');
            $('#contact_submit').hide();
            result.text("Email Sucessfully Sent");
        } else {
            WriteError(data.Result);
        }
    }