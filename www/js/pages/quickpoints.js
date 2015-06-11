function page_quick_points_show(){
    //TODO: write correct label to div quick_points_label
	if (app.isPhoneGap) {
		$('#quick_points_scan_instructions').show();
	}
	$('#quick_points_submit').click(function(e) {
	    if ($('#certificate_number').val().trim() == '')
		{
			WriteError("You must enter a value");
			return;
		}
		$(this).prop("disabled",true);
		var data = JSON.stringify({ certificate_number: $('#certificate_number').val()});
		getJson('QUICKPOINTS.SAVE',HandleQuickPointsCallback,data,function () {
				$('#quick_points_submit').prop("disabled",false);						
			});
	});
	
	 $('#certificate_number').keypress(function(e){ 
		if ( e.which == 13 ){ 
			$('#quick_points_submit').trigger('click');
		}
	});
			
	if (app.isPhoneGap){
		
		$('#quick_points_scan').show().click(HandleQuickPointsScan);
		$("#quick_points_scan2").click(HandleQuickPointsScan);
	
		$("#certificate_number").focus(function() {
				
		$("#qpointsContainer .panelRight").hide();
		$(".focusScan").show();	
		
		 });
      
	      $("#certificate_number").blur(function() {
				      
			$("#qpointsContainer .panelRight").show(function(){
				
				if ($("#certificate_number").val().length == 0) {
					
					$(".focusScan").hide();
				}
				
				});
		
			
		});
	      
	      $("#certificate_number").keyup(function(){
		      
		      if ($(this).val().length > 0) {
					    
		      $(".focusScan").hide();
			      
		      } else {
			      
			      $(".focusScan").show();
		      }
      
	      });
		
		
		
	}
		

	
	
	
	
	
}



function HandleQuickPointsScan(){
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			$('#certificate_number').val(result.text);
			$('#quick_points_submit').trigger('click');
			
			//Send tracking data to Google
			ga('send','event','Redeem Points','Scan');
			
		},
		function (error) {
			navigator.notification.alert('Unable to read QR code', function(){}, 'Scan Failed', 'OK');
		}
	);
}

function HandleQuickPointsCallback(data){
	$('#quick_points_submit').prop("disabled",false);						
	if (data.Result == null || data.Result == "success") {
		if (typeof data.PointAccount !== null) {
                UpdatePointAccount(data.PointAccount);
		
		//Send tracking data to Google
		ga('send','event','Redeem Points','Submit');
		
            }
		//TODO: Need better message.	
		$('#certificate_number').val(""); 
		if (psg.payoutType == 1) {
			ShowAlert("We have awarded you $" + data.Amount + " dollars.  Funds will be added to your card on the next funding cycle.","Congratulations!");
		} else {
		ShowAlert("We have added " + data.Amount + " points to your account.","Congratulations!");
		}
		WriteError("");
		psg.pageInit();
	} else {
		WriteError(data.Result);
	}
}








