function page_checkout_address_show() {
	var ispu = sessionStorage.getItem(getBase() + "checkout.hasISPU");
	if (ispu == "true") {
		$("#checkout_address_ispu").show();
	}
	getJson("CHECKOUT.ADDRESS.GET", HandleGetCheckoutAddress);
}

function HandleGetCheckoutAddress(data) {
        var setString = '<strong>' + data.Name + '</strong><br/>' + data.Address.StreetAddress1 + '<br/>';
        if (data.Address.StreetAddress2 != '') {
            setString += data.Address.StreetAddress2 + '<br/>';
        }
        setString += data.Address.CityName + ', ' + data.Address.StateCode + '  '
                + data.Address.PostalCode + '  ' + data.Address.CountryCode + '<br/>'
                + data.Address.PhoneNumber + '<br/>' + data.Email + '<br/>';
        var div = $('#div_checkout_address');
        div.html(setString);
        psg.setSessionItem('checkoutAddress', JSON.stringify(data)); 

		CheckSSN();
	
}
function CheckSSN(){
	 $('#checkout_validate_ssn').hide();
	 $('#checkout_validate_ftin').hide();	
	 $('#div_checkout_show_ssn').hide();
	 $('#div_checkout_show_ftin').hide();
	 $('#psg_ssn_ftin_info').hide();


	if(!app.isPhoneGap){
		getJson("SHOPPING.CHECKSSN", HandleShowSSN);
	}	
}
function HandleShowSSN(data) {
	var showSsn = false;
	var showFtin = false;
	var SsnAtRedemptionEnabled = 0;

	//show
	if(data.result.ShowSSNFTIN)
	{
		$('#psg_ssn_ftin_info').show();
		SsnAtRedemptionEnabled = data.result.SsnAtRedemptionEnabled;
		switch (SsnAtRedemptionEnabled)
		{
			case 1:
				$('#div_checkout_show_ssn').show();
				$('span.psg_tax_id_name').html('SSN');
				showSsn = true;
				break;
			case 2:
				$('#div_checkout_show_ftin').show();
				$('span.psg_tax_id_name').html('FTIN (EIN)');
				showFtin = true;
				break;
			case 3:
				$('#div_checkout_show_ssn').show();
				$('#div_checkout_show_ftin').show();
				$('span.psg_tax_id_name').html('SSN or FTIN (EIN)');
				showSsn = true;
				showFtin = true;
				break;				
			default:
				break;
			
		}
	}

	$('#checkout_continue').on('click', (function (e) {
		if(!CheckAddressOnCheckOut())
		{
			return false;
		}		
		//save ssn 
		if (!showSsn && !showFtin) {
			$.mobile.pageContainer.pagecontainer('change', 'checkoutconfirm.html', {
				transition : 'slide',
				changeHash : true
			});
		}
		else if((SsnAtRedemptionEnabled == 1 || SsnAtRedemptionEnabled == 2)  && ValidateSSN(showSsn) && ValidateFTIN(showFtin))
		{
			SetSSNFTIN();
		}
		else if((SsnAtRedemptionEnabled == 3)  && (ValidateSSN(showSsn) || ValidateFTIN(showFtin)))
		{
			SetSSNFTIN();			
		}
		 e.preventDefault();
		 e.stopPropagation();
	}));	
}
function CheckAddressOnCheckOut(){
	var data = sessionStorage.getItem(getBase() + "checkoutAddress");
		data = JSON.parse(data);
		var validAddressOneCheckout = ValidateStreetAddress(data.Address.StreetAddress1);
		$('#div_checkout_address_error').html('');		
		if(validAddressOneCheckout.length > 0){
			$('#div_checkout_address_error').html(validAddressOneCheckout);
			return false;
		} 
		var validAddressTwoCheckout = ValidateStreetAddress(data.Address.StreetAddress2);
		if(validAddressTwoCheckout.length > 0){
			$('#div_checkout_address_error').html(validAddressTwoCheckout);
			return false;
		}
	return true;		
}
function SetSSNFTIN()
{
	var data = {};
	data["ssn"] = $('#checkout_ssn').val();
	data["ftin"] = $('#checkout_ftin').val();
	var passData = JSON.stringify(data);			
	getJson("SHOPPING.CHECKOUT.SSN.SET", HandleSetCheckoutSSN,passData);	
}
function HandleSetCheckoutSSN(data) {
	if (data.result != "success") {
		WriteError(data.result);
	}
	else {
		$.mobile.pageContainer.pagecontainer('change', 'checkoutconfirm.html', {
			transition : 'slide',
			changeHash : true
		});
	}
}	
function ValidateSSN(showSsn)
{
	if (!showSsn) return true;
	var ssnInput = $('#checkout_ssn');
	var ssn = ssnInput.val();
	if (ssn == ''){
		$('#checkout_validate_ssn').show();
		return false;
		}
	var re = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/
	var test = re.test(ssn);
	if (!test) {
		$('#checkout_validate_ssn').show();
		return false;
	}
	return true;
}
function ValidateFTIN(showFtin)
{
	if (!showFtin) return true;
	var ftinInput = $('#checkout_ftin');
	var ftin = ftinInput.val();
	if (ftin == ''){
		$('#checkout_validate_ftin').show();
		return false;
		}
	var re = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/
	var test = re.test(ftin);
	if (!test) {
		$('#checkout_validate_ftin').show();
		return false;
	}
	return true;
	
}
	

