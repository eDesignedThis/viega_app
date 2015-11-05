var wishListNextPage;
function page_wish_list_show(previousId){
    if (previousId == 'page_shopping_main'){
        cache = psg.getCache('wishList',.25);
        if (cache.data !== null && !cache.expired){
            HandleGetWishlist(cache.data);       
        }else{
          getJson("SHOPPING.WISHLISTITEMS", HandleGetWishlist); 
        }
    }else{
        getJson("SHOPPING.WISHLISTITEMS", HandleGetWishlist);
    }
}
function HandleGetWishlist(data) {
				//debugger;
				var listString = '';
				var pointValue = [];

				$.each(data, function (index, value) {

					pointValue.push(value.PercentSaved);

					listString += '<li><img class="ui-product-thumbnail ui-margin-top-1x" src="' + value.ItemSmallImageUrlFullyQualified + '"/>\
						<h2 id="title_' + value.CatalogItemId + '" class="ui-no-ellipse">' + value.ItemName + '</h2><p><a href="#" data-psg-item-key="' + htmlEncode(JSON.stringify(value.CatalogItemKey)) + 
						'" data-transition="slide" class="link-detail">Details</a></p>\
						<p class="ui-paragraph-padding"><span class="shopPtsStyle">' + value.PointsPerUnitFormatted + '</span> points</p> \
						<div  id="psg_jqx_progress_bar_' + index + '" ></div>\
						<div class="psg-cg"> \
						    <button data-psg-key="' + value.CatalogItemId + '"  data-mini="true" class="noCenter ui-btn ui-btn-a ui-icon-delete ui-shadow ui-corner-all">Remove</button> \
						    <button data-psg-key="' + value.CatalogItemId + '" data-psg-options="' + htmlEncode(value.OrderOptions) + '"  \
						    data-psg-points="' + value.PointsPerUnitFormatted + '" data-mini="true" class=" noCenter ui-btn ui-btn-a ui-shadow ui-corner-all " >Move to Cart</button>&nbsp \
						</div> \
						</li>';
				});

				if (listString == '') {
					listString = '<li>There are no items in your wish list.</li>';
				}

				var page = $('#page_wish_list');
				var ul = $('#psg-listview-wishlist');
				ul.html(listString);
				ul.listview('refresh');
				ul.find(".psg-cg").controlgroup().controlgroup("refresh");

				var percent = 0;
				for (var i = 0, l = pointValue.length; i < l; i++) {
					percent = pointValue[i];
					var id = '#psg_jqx_progress_bar_' + i;
					page.find(id).jqxProgressBar({ width: 180, height: 23, value: percent, showText: true });
				}
				page.find('.jqx-widget-content').css('background-color', '#999');
				page.find('.jqx-widget-content').css('color', 'white');
				page.find('.jqx-fill-state-pressed').css('background-color', 'green');

				page.find('#psg-listview-wishlist button').on("click", HandleButtonClick);
				page.find('.link-detail').on("click", function () {
					psg.setSessionItem('psg-item-key', $(this).attr('data-psg-item-key'));
					$.mobile.pageContainer.pagecontainer('change', 'itemdetail.html', { transition: 'slide' } );
				});
			}

			function HandleButtonClick(event) {
				wishListNextPage = "wishlist.html";
				var urlAction;
				var keyValue = $(event.target).attr("data-psg-key");
				var options = $(event.target).attr("data-psg-options");

				if (event.target.innerText == "Move to Cart") {
					if (options == null || options == "null" || options == "") {
						urlAction = "SHOPPING.WISHLIST.MOVETOCART";
						wishListNextPage = "shoppingcart.html";
					} else {
						var title = $('#title_' + keyValue).html();
						var points = $(event.target).attr("data-psg-points");
						sessionStorage.setItem(getBase() + "add.options", options);
						sessionStorage.setItem(getBase() + "add.title", title);
						sessionStorage.setItem(getBase() + "add.key", keyValue);
						sessionStorage.setItem(getBase() + "add.points", points);
						wishListNextPage = "itemoptions.html";
						$.mobile.changePage( wishListNextPage);
						return;
					}
				}
				else if (event.target.innerText == "Remove") {
					urlAction = "SHOPPING.WISHLIST.REMOVE";
				}

				var data = JSON.stringify({ key: keyValue });
				getJson(urlAction,HandleWishlistAction,data);
			}

			function HandleWishlistAction(data) {
				if (data.Result == null || data.Result == "success") {
					if (wishListNextPage == "wishlist.html") {
						getJson("SHOPPING.WISHLISTITEMS", HandleGetWishlist);
					} else {
						$.mobile.changePage( wishListNextPage);
					}
				}
			}