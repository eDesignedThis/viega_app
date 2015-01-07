function page_shopping_main_show() {
	// Clear the browse state for shoppingSearch
	psgShopping.Search.Mode.set();
	psgShopping.Search.Trigger.reset();
	psgShopping.Department.Current.reset();

	$("#shoppingmain_point_balance").html(psg.getSessionItem('balance'));
	$("#shoppingmain_wish_count").hide();
	getJson("SHOPPING.WISHLISTITEMS", function(data)
	{
		if ( data.length > 0 ) {
			$("#shoppingmain_wish_count").show();
			$("#shoppingmain_wish_count").html(data.length);
            psg.setCache('wishList',data);
			
		} else {
			psg.removeCache('wishList');
		}
			
	},null,function(){},10000,true,false);

	$("#shoppingmain_cart_count").hide();
	getJson("SHOPPING.SHOPPINGCARTITEMS", function(data)
	{
		if ( data.length > 0 )
		{
			$("#shoppingmain_cart_count").show();
			$("#shoppingmain_cart_count").html(data.length);
            psg.setCache('shoppingCart',data);
		} else {
			psg.removeCache('shoppingCart');
		}
	},null,function(){},10000,true,false);

	// todo not sure if deals may go away
//	$("#shoppingmain_deal_count").hide();
//	getJson("SHOPPING.SHOPPINGCARTITEMS", function(data)
//	{
//		if ( data.length > 0 )
//		{
//			$("#shoppingmain_cart_count").show();
//			$("#shoppingmain_cart_count").html(data.length);
//		}
//	});


}
