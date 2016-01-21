function page_shopping_cart_show(previousId) {				
	$('#psg_shopping_cart_checkout_button').on("click", HandleShoppingCartCheckoutClick);
	if (previousId == 'page_shopping_main') {
        cache = psg.getCache('shoppingCart',.25);
        if (cache.data !== null && !cache.expired) {
            HandleGetShoppingItems(cache.data);       
        }else{
          getJson("SHOPPING.SHOPPINGCARTITEMS", HandleGetShoppingItems); 
        }
    }else{
        getJson("SHOPPING.SHOPPINGCARTITEMS", HandleGetShoppingItems);
    }
	var cartChangeDetails = psg.getSessionItem('cartChangeDetails');
	if (cartChangeDetails){
	    WriteError(cartChangeDetails);
		psg.removeSessionItem('cartChangeDetails');
	}
	
	function HandleGetShoppingItems(data) {
		var listString = '';
		var ptBalance = 0;
		var cartBalance = 0;
		// todo  var shoppingandsalestax = '';
		var listSummary = '';
		var ispu = false;

		$.each(data, function (index, value) {
			//Calculate running totals
			cartBalance += value.ExtendedPoints;
			ptBalance = value.PointBalance;
			if (value.SelectedOrderOptions != null && value.SelectedOrderOptions.indexOf("DELIVERYMETHOD=ISPU") > -1)
				ispu = true;

			listString += '<li><img class="ui-product-thumbnail ui-margin-top-1x" src="' + value.ItemSmallImageUrlFullyQualified + '"/>\
							<h2 class="ui-no-ellipse shopDscptStyle">' + value.ItemName + '</h2>\
							<div>' + value.SelectedOrderOptionsFormatted + '</div><p><a href="#" data-psg-item-key="' + htmlEncode(JSON.stringify(value.CatalogItemKey)) + '" data-transition="slide" class="link-detail">Details</a></p>\
							<p class="ui-paragraph-padding"><span class="shopPtsStyle">' + value.ExtendedPointsFormatted + ' </span>points</p> \
							<div class="ui-text-small">Quantity: '+ value.Quantity +'&nbsp &nbsp\
								<button data-psg-key="' + value.LineItemSequence + '" data-mini="true" class="shopping-cart-add ui-btn ui-btn-a ui-icon-plus ui-btn-icon-notext ui-shadow ui-corner-all ui-btn-inline">Add</button> &nbsp &nbsp \
								<button data-psg-key="' + value.LineItemSequence + '" data-mini="true" class="shopping-cart-subtract ui-btn ui-btn-a ui-icon-minus ui-btn-icon-notext ui-shadow ui-corner-all ui-btn-inline">Subtract</button> \
							</div> \
							<div class="psg-cg"> \
								<button data-psg-key="' + value.LineItemSequence + '" data-mini="true" class="shopping-cart-remove noCenter ui-btn ui-btn-a ui-shadow ui-corner-all ">Remove</button> \
								<button data-psg-key="' + value.LineItemSequence + '" data-mini="true" class="shopping-cart-to-wishlist noCenter ui-btn ui-btn-a ui-shadow ui-corner-all" >Move to Wish List</button> \
							</div> \
						</li>';
		});

		sessionStorage.setItem(getBase() + "checkout.hasISPU", ispu);

		if (listString == '') {
			listString = '<li>No items in your shopping cart.</li>';
			$('#psg_shopping_cart_checkout_button').hide();
		}

		var page = $('#page_shopping_cart');
		var ul = $('#psg-listview-shopping_cart');
		ul.html(listString);

		//Summary
		var remainingPts = (ptBalance - cartBalance);

		ul.listview('refresh');
		$('#psg_shopping_cart_total_points').html(addCommas(cartBalance));
		$('#psg_shopping_cart_remaining_points').html(addCommas(remainingPts));
		page.find('.psg-cg').controlgroup().controlgroup('refresh');

		page.find('.shopping-cart-add').on("click", function (event) {
			doShoppingCartAction(event,"SHOPPING.CART.INCREMENT");
		});
		page.find('.shopping-cart-subtract').on("click", function (event) {
			doShoppingCartAction(event,"SHOPPING.CART.SUBTRACT");
		});
		page.find('.shopping-cart-remove').on("click", function (event) {
			doShoppingCartAction(event,"SHOPPING.CART.REMOVE");
            
            //Send tracking data to Google
            ga('send','event','User Removed Item From Cart','Remove');
                
		});
		page.find(".shopping-cart-to-wishlist").on("click", function(event) {
			doShoppingCartAction(event,"SHOPPING.CART.MOVETOWISHLIST");
            
            //Send tracking data to Google
            ga('send','event','User Move Item To Wish List','Cart');
                
		});
		page.find('.link-detail').on("click", function () {
			psg.setSessionItem('psg-item-key', $(this).attr('data-psg-item-key'));
			$.mobile.pageContainer.pagecontainer('change', 'itemdetail.html', { transition: 'slide' } );
		});
	}

	function doShoppingCartAction(event,action) {
		var keyValue = $(event.target).attr("data-psg-key");
		var data = JSON.stringify({ key: keyValue });
		getJson(action, function(data) {
			getJson("SHOPPING.SHOPPINGCARTITEMS", HandleGetShoppingItems);
		}, data);
	}

	function HandleShoppingCartCheckoutClick(event) {
		if ($("#shopping_cart_remaining").attr("data-psg-remaining") < 0) {
			WriteError("You have insufficient points in your account to redeem the items in the shopping cart.");
			return;
		}

		getJson("CHECKOUT.CART.REFRESH", HandleShoppingCartRefresh);
        
        //Send tracking data to Google
        ga('send','event','User Checkout Items From Cart','Checkout');
                
	}
	
	function HandleShoppingCartRefresh(data) {
		if (data.SSNRequired || data.BuyInRequired) {
			// todo redirect to full site wont work for mobile app
			WriteError("You must checkout using the desktop site.  Click <a rel='external' class='cart_desktop_link' data-role='none' data-enhance='false' href='../cart.aspx'>HERE</a> to complete.");
			if (app.isPhoneGap) {
				$('.cart_desktop_link').click(function() {
					window.open(psg.baseUrl + "/Cart.aspx", "_system");
					return false;
				});
			}
		} else if (data.Result == null || data.Result == "success") {
			$.mobile.pageContainer.pagecontainer('change', 'checkoutaddress.html');
		} else {
			WriteError(data.Result);
		}
	}
}
