function page_edit_checkout_address_show()
{
    var addressResult = psg.getSessionItem('checkoutAddress');
    if (addressResult === null) {
        getJson("CHECKOUT.ADDRESS.GET", HandleEditCheckoutAddress);
    } else {
        HandleEditCheckoutAddress(JSON.parse(addressResult));
    }
	
	$('#frmEditCheckoutAddress').validate({ submitHandler: doUpdateCheckoutAddress });
}

function HandleEditCheckoutAddress(data) {

	$("#edit_checkout_name").val(data.Name);
	$("#edit_checkout_address1").val(data.Address.StreetAddress1);
	$("#edit_checkout_address2").val(data.Address.StreetAddress2);
	$("#edit_checkout_city").val(data.Address.CityName);
	$("#edit_checkout_state").val(data.Address.StateCode);
	$("#edit_checkout_zip").val(data.Address.PostalCode);
	$("#edit_checkout_country").val(data.Address.CountryCode);
	$("#edit_checkout_phone").val(data.Address.PhoneNumber);
	$("#edit_checkout_email").val(data.Email);
}


function doUpdateCheckoutAddress()
{
	if(!ValidateInput()){
		return;
	}	

	var address = JSON.stringify({
		Name:$("#edit_checkout_name").val(),
		StreetAddress1: $("#edit_checkout_address1").val(),
		StreetAddress2: $("#edit_checkout_address2").val(),
		CityName: $("#edit_checkout_city").val(),
		StateCode: $("#edit_checkout_state").val(),
		PostalCode: $("#edit_checkout_zip").val(),
		PhoneNumber: $("#edit_checkout_phone").val()
	});

	getJson("CHECKOUT.ADDRESS.SET", function(data) {
		if ( data.Result == 'success' ){
			history.back();
		} else {
		    psg.setSessionItem('cartChangeDetails', data.ChangeDetails);
			$.mobile.pageContainer.pagecontainer('change', 'shoppingcart.html');
		}
	
	}, address);
}
function ValidateStreetAddress(address){
	
	if(address != null)	{
		var pattern = new RegExp('\\b[p]*(ost)*\\.*\\s*[o|0]*(ffice)*\\.*\\s*b[o|0]x\\b', 'i');
		if(address.match(pattern)){
			return 'P.O. Box is not allowed for address fields.';
		}
	}
	return '';
}
function ValidStateShipping(sstate,countryCode) {
	var sstates;
	switch (countryCode) {
		case "USA":
			sstates = "wa|or|ca|ak|nv|id|ut|az|hi|mt|wy|" +
			"co|nm|nd|sd|ne|ks|ok|tx|mn|ia|mo|" +
			"ar|la|wi|il|ms|mi|in|ky|tn|al|fl|" +
			"ga|sc|nc|oh|wv|va|pa|ny|vt|me|nh|" +
			"ma|ri|ct|nj|de|md|dc|as|fm|gu|mh|" +
			"mp|pw|pr|vi|um|ae|aa|ap|";
			break;
		case "CAN":
			sstates = "ab|bc|mb|nb|nl|ns|nt|nu|on|pe|qc|sk|yt|";
			break;
		default:
			sstates = "wa|or|ca|ak|nv|id|ut|az|hi|mt|wy|" +
			"co|nm|nd|sd|ne|ks|ok|tx|mn|ia|mo|" +
			"ar|la|wi|il|ms|mi|in|ky|tn|al|fl|" +
			"ga|sc|nc|oh|wv|va|pa|ny|vt|me|nh|" +
			"ma|ri|ct|nj|de|md|dc|as|fm|gu|mh|" +
			"mp|pw|pr|vi|um|ae|aa|ap|";
			break;
	}
	if (sstates.indexOf(sstate.toLowerCase() + "|") > -1) {
		return true;
	}
	return false;
}

function ValidPostalCodeShipping(postalCode, countryCode) {
	switch (countryCode) {
	case "USA":
		postalCodeRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
		break;
	case "CAN":
		postalCodeRegex = /^([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])$/;
		break;
	default:
		postalCodeRegex = /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/;
	}
	return postalCodeRegex.test(postalCode);
}
function ValidateInput(){
	var addressOne = $("#edit_checkout_address1").val();
	var addressOneError = $("#edit_checkout_address1_error");
	addressOneError.html('');
	var validateAddressOne = ValidateStreetAddress(addressOne);
	if (validateAddressOne.length > 0){
		addressOneError.html(validateAddressOne);
		return false;
	}	 	
	
	var addressTwo = $("#edit_checkout_address2").val();
	var addressTwoError = $("#edit_checkout_address2_error");
	addressTwoError.html('');
	var validateAddressTwo = ValidateStreetAddress(addressTwo);
	if (validateAddressTwo.length > 0){
		addressTwoError.html(validateAddressTwo);
		return false;
	}
	// USA validation only for now
	var shippingCountry = $("#edit_checkout_country").val();
	if(shippingCountry != 'USA'){return true;}
	
	var shippingState = $("#edit_checkout_state").val();
	var shippingStateError = $("#edit_checkout_state_error");
	shippingStateError.html('');
	if(!ValidStateShipping(shippingState,shippingCountry)){
		shippingStateError.html('Incorrect state input.');
		return false;
	}

	var shippingPostal = $("#edit_checkout_zip").val();
	var shippingPostalError = $("#edit_checkout_zip_error");
	shippingPostalError.html('');
	if(!ValidPostalCodeShipping(shippingPostal,shippingCountry)){
		shippingPostalError.html('Incorrect Postal Code.');
		return false;
	}
	
	return true;	
}
