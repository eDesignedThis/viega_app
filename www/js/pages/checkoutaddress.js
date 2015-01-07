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
}

