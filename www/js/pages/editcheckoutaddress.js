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
	ValidateInput();
	var editShippingAddressError = $("#edit_shipping_address_error");
	editShippingAddressError.html('');
	var streetAddressOne = $("#edit_checkout_address1").val();
	var streetAddressTwo = $("#edit_checkout_address2").val();
	var returnAddressValidation = ValidateStreetAddress(streetAddressOne,streetAddressTwo);
	if(returnAddressValidation.length > 0){
		editShippingAddressError.html(returnAddressValidation);
		return false;
	}	
	var address = JSON.stringify({
		Name:$("#edit_checkout_name").val(),
		StreetAddress1: streetAddressOne,
		StreetAddress2: streetAddressTwo,
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
	
	if(address != null)
	{
		var pattern = new RegExp('\\b[p]*(ost)*\\.*\\s*[o|0]*(ffice)*\\.*\\s*b[o|0]x\\b', 'i');
		if(address.match(pattern)){
			return 'P.O. Box is not allowed for address fields.';
		}
	}
	return '';
}
function ValidateInput(){
	var addressOne = $("#edit_checkout_address1").val();
	var validateAddressOne = ValidateStreetAddress(addressOne);
	if (validateAddressOne.length > 0){
		$("#edit_checkout_address1_error").html(validateAddressOne);
	}	 
	var addressTwo = $("#edit_checkout_address2").val();
	var validateAddressTwo = ValidateStreetAddress(addressTwo);
	if (validateAddressTwo.length > 0){
		$("#edit_checkout_address2_error").html(validateAddressTwo);
	}
		
}
