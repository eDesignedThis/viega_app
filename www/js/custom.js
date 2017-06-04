function page_edit_checkout_address_show()
{
	//debugger;
    var addressResult = psg.getSessionItem('checkoutAddress');
    if (addressResult === null) {
        getJson("CHECKOUT.ADDRESS.GET", HandleEditCheckoutAddress);
    } else {
        HandleEditCheckoutAddress(JSON.parse(addressResult));
    }
	$('#div_edit_checkout_email').show();
	
	$('#frmEditCheckoutAddress').validate({ submitHandler: doUpdateCheckoutAddress });
}
