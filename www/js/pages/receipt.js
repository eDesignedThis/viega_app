function page_receipt_show(){
	$('#receipt_order_number').text(sessionStorage.getItem(getBase() + "checkout.orderNumber"));
	var hasISPU = sessionStorage.getItem(getBase() + "checkout.hasISPU");
	if (hasISPU == "true") {
		$('#receipt_ispu').show();
	}
	sessionStorage.removeItem(getBase() + "checkout.hasISPU");
	sessionStorage.removeItem(getBase() + "checkout.orderNumber");
	getJson("POINTS.SUMMARY", HandleGetReceipt);
}

function HandleGetReceipt(data) {
	if (typeof data !== null) {
                UpdatePointAccount(data);
    }
}