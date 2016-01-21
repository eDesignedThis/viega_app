function page_invitation_show(){
    //TODO: write correct label to div invitation_label
	var invitationLabel = 'Invitation ID';
	var configLabel = $(psg.configXml).find('ENROLLMENT').attr('INVITATION_LABEL');
	if (configLabel) {
		invitationLabel = configLabel;
	}
	$('#invitation_label').text(invitationLabel);
	
	var enableScan = ($(psg.configXml).find('ENROLLMENT[ENABLE_INVITATION_SCAN="1"]').length > 0);
	if ( enableScan && app.isPhoneGap ) {
	    $('#invitation_scan_inscrutions').show();
		var scanIcon = $("#icon_invitation_scan");
		scanIcon.show();
		scanIcon.off('click',invitationScan).on('click',invitationScan);
		
		$('#icon_invitation_scan2').off('click',invitationScan).on('click',invitationScan);
		
		$("#invitation_id").focus(function() {
				
			$("#qpointsContainer .panelRight").hide();
			$(".focusScan").show();
					
		});
		
		
		$("#invitation_id").blur(function() {
			
		$("#qpointsContainer .panelRight").show();
		
			
		});
		      
		$("#invitation_id").keyup(function(){
			
			if ($(this).val().length > 0) {
					      
			$(".focusScan").hide();
				
			} else {
				
				$(".focusScan").show();
			}
		
		});
		
	}
	
	
	if  (!app.isPhoneGap) {
		var id = null;
		if (sessionStorage.getItem('startPageQS') != null) {
			id = getQSParameterByName('invitation_id', sessionStorage.getItem('startPageQS'));
		}
        else if (location.search != null && location.search != '') {
			id = getQSParameterByName('invitation_id');
		}
		if (id != null) {
			$('#invitation_id').val(id);
		}
	}

	$('#invitation_id').off('keypress', onKeyPress).on('keypress', onKeyPress);
	function onKeyPress ( e ) {
		if (e.which == 13) {
			e.preventDefault();
			submitInvitation();
		}
	}
	
	$('#invitation_submit').off('click', submitInvitation).on('click', submitInvitation);
	function submitInvitation() {
	    if ($('#invitation_id').val().trim() == '')
		{
			WriteError("You must enter a value");
			return;
		}
		var data = JSON.stringify({ invitation_id: $('#invitation_id').val(), program_guid: psg.programGuid });
		getJson('ENROLLMENT.INVITATION', HandleInvitationCallback, data);
	};
	function HandleInvitationCallback ( data ) {
		if (data.Result == "success") {
			psg.participantTypeId = data.ParticipantDataTable[0].participant_type_id;
			psg.setSessionItem('enrollPrefill',JSON.stringify(data.ParticipantDataTable));
			psg.setSessionItem('participantKey',data.ParticipantKey);
			$.mobile.pageContainer.pagecontainer('change', 'enrollment.html');
			
			//Send tracking data to Google
			ga('send','event','Invitation ID','Submit');
			
			
		} else {
		    var message = data.Result; 
		    if (message.indexOf('login') > 1){
				message = message.replace('login','login <a href="login.html">here</a>');
			}
			WriteError(message);
		}
	}

	function invitationScan() {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				if ( !result.cancelled ) {
					$('#invitation_id').val(result.text);
					submitInvitation();
				}
			},
			function (error) {
				navigator.notification.alert('Unable to read QR code.', function(){}, 'Scan Failed', 'OK');
			}
		);
	}
}
