function page_checkout_confirm_show(){
getJson("SHOPPING.SHOPPINGCARTITEMS", HandleGetConfirm);
$("#psg_checkout_confirm_button").click(HandlePurchaseButtonClick);
}

function HandleGetConfirm(data) {
	var listString = '';
	var ptBalance = 0;
	var cartBalance = 0;
	var shoppingandsalestax = '';
	var listSummary = '';

	$.each(data, function (index, value) {
		var ispu = false;
		//Calculate running totals
		cartBalance += value.ExtendedPoints;
		ptBalance = value.PointBalance;
		if (value.SelectedOrderOptions != null && value.SelectedOrderOptions.indexOf("DELIVERYMETHOD=ISPU") > -1)
			ispu = true;

		listString += '<li><img class="ui-product-thumbnail" src="' + value.ItemSmallImageUrlFullyQualified + '"/>\
		<h2 id="title_' + value.CatalogItemId + '" class="ui-no-ellipse">' + value.ItemName + '</h2>\
		<p class="ui-paragraph-padding"><span class="shopPtsStyle">' + value.ExtendedPointsFormatted + ' </span>points</p> \
		<div class="ui-text-small">Quantity: ' + value.Quantity + '</div>';
		if (ispu) {
			var buttonTitle = "Select Store";
			if (value.InStorePickUp != null && value.InStorePickUp.StoreId != null) {
				buttonTitle = "Change Store";
				listString += '<div>Pickup at ' + value.InStorePickUp.StoreName; +'</div>';
			} else {
				listString += '<span class="checkout-confirm-nostore"></span>';
			}
			listString += '<div class="ui-paragraph-padding psg-cg" data-role="controlgroup" data-type="horizontal" data-mini="true"> \
			<button data-psg-points="' + value.PointsPerUnitFormatted + '" data-psg-key="' + value.CatalogItemId + '" \
			class="change-pickup-store ui-btn ui-btn-a ui-shadow ui-corner-all ui-first-child ui-last-child" >' + buttonTitle + '</button> \
			</div>';
		}
		listString += '</li>';
	});

	if (listString == '') {
		listString = '<li>No items in shopping cart.</li>';
		$('#psg_checkout_confirm_button').hide();
	}

	listString = '<li data-role="list-divider" class="headerDivider" data-theme="a">Confirm Order</li>' + listString;
	var ul = $('#psg-listview-checkout_confirm');
	//appending to the div
	ul.html(listString);
	// refreshing the list to apply styles

	//Summary
	var remainingPts = (ptBalance - cartBalance);
 
	var page = $('#page_checkout_confirm');
	ul.listview('refresh');
	$('#psg_checkout_confirm_total_points').html(addCommas(cartBalance));
	$('#psg_checkout_confirm_remaining_points').html(addCommas(remainingPts));
	page.find('.psg-cg').controlgroup().controlgroup('refresh');
	page.find('.change-pickup-store').on("click", HandlePickupStoreButtonClick);
}

function HandlePickupStoreButtonClick(event){
	var keyValue = $(event.target).attr("data-psg-key");
	var title = $('#title_' + keyValue).html();
	var points = $(event.target).attr("data-psg-points");
	sessionStorage.setItem(getBase() + "ispu.title", title);
	sessionStorage.setItem(getBase() + "ispu.key", keyValue);
	sessionStorage.setItem(getBase() + "ispu.points", points);
	$.mobile.changePage( "ispuselect.html");
}

function HandlePurchaseButtonClick(event) {
	if ($(".checkout-confirm-nostore").length) {
		WriteError("You must select a store for one or more items.");
		return;
	}
	if (!$('#checkout_checkbox').prop("checked")){
		var errorDiv = $('#checkout_confirm_error');
		errorDiv.text("You must agree to the return policy.");
		errorDiv.show();
		return;
	}

	//todo add stringify to getJson
	getJson("CHECKOUT.CART.PURCHASE", function(data) {
		if (data.Result == null || data.Result == "success") {
			sessionStorage.setItem(getBase() + "checkout.orderNumber", data.OrderNumber);
			$.mobile.changePage( "receipt.html");
		} else {
			WriteError(data.Result);
		}
	});
}