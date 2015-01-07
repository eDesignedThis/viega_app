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
