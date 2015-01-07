function page_shopping_recomended_show(){
	//is page cached?
	if (!$('#reward_yourself').length) {
		getJson("SHOPPING.RECOMMENDED", HandleGetRecItems);
	}

	function HandleGetRecItems(data) {
		if (data.Result == "success") {
			var listString = '<span id="reward_yourself"></span>';
			if ( data.RecommendedItems.length === 0){
				listString = 'No items to recommend for your point balance.';
			} else {
				$.each(data.RecommendedItems, function (index, value) {
					listString = GetCatalogItemListItem(value, listString);
				});
			}
			var ul = $('#psg-listview-recommend');
			ul.html(listString);
			ul.listview('refresh');
			ul.find('.link-detail').on("click", function () {
				sessionStorage.setItem(getBase() + 'psg-item-key', $(this).attr('data-psg-item-key'));
				$.mobile.changePage( 'itemdetail.html');
			});
		} else {
			WriteError(data.Result);
		}
	}
}
