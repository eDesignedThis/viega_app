function page_profile_show()
{
	var searchTerm = 'ENROLLMENT > FIELD';
	if (psg.participantTypeId != "0"){
		searchTerm = 'ENROLLMENT > PARTICIPANT_TYPES[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"] > FIELD';
	}

	var fields = ParseFields('profile',searchTerm,true);
	var formDiv = $('#profile_form_div');
	formDiv.html(fields.html);
	formDiv.append(fields.script);
	//$('#page_profile_content').trigger('create');
	formDiv.trigger('create');
	
	getJson('PROFILE.GET',HandleProfileGet,null,
		function(xhr,status)
		{
			history.back();
			return;
		});
}

function HandleProfileGet(data)
{
	if ( data.Result != 'success')
	{
		ShowAlert("Unable to load profile","Server Error");
		history.back();
		return;
	}

	var dataRow = data.ParticipantDataTable[0];
	PreFillForm(dataRow,'profile');
	$('#frmProfile').validate({ submitHandler: submitProfileForm });

}


function submitProfileForm() {
	var password = $('#profile_password').val();
	var oldPassword = $("#profile_oldpassword").val();

	if ( password != '' )
	{
		var password_confirm = $('#profile_password_confirm').val();
		if (password != password_confirm) {
			ShowAlert("Passwords Do Not Match", "Error");
			return false;
		}
		if ( oldPassword == '' )
		{
			ShowAlert("You must provide your current password to change to a new one", "Error");
			return false;
		}
	}

	var formContent = $('#frmProfile').serialize();
	var data = JSON.stringify({ form_contents: formContent });
	getJson("MOBILE.PROFILE.SAVE", function(data){
			if ( data.Result == 'success')
			{
				ShowAlert("Profile Saved", "Success");
				$.mobile.pageContainer.pagecontainer('change', 'home.html');
			}else{
				WriteError(data.Result);
			}			
	},data);
    
    //Send tracking data to Google
    ga('send','event','User Updated Profile','Submit');
}
