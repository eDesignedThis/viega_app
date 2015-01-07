function page_ispu_select_show(){
	$("#ispu_select_item_title").text(sessionStorage.getItem(app.getBase() + "ispu.title"));
	var points = sessionStorage.getItem(app.getBase() + "ispu.points");
	var keyValue = sessionStorage.getItem(app.getBase() + "ispu.key");
	var data = JSON.stringify({ key: keyValue});
	getJson("ISPU.STORES.GET", HandleGetIpuSelect, data);	
}

function HandleGetIpuSelect(data){
	if (data.Result == null || data.Result == "success")
	{
		var storeString = '';

		$.each(data.Stores, function(index,store){

			storeString += '<li><h2><a target="_blank" href="'+ store.StoreUrl + '">' + store.StoreName + '</a></h2>\
			<div>' + store.StoreAvailabilityMessage + '</div>';
			if (store.StoreAvailabilityMessage != "Not Available") {
				storeString += '<div class="ui-paragraph-padding psg-cg" data-role="controlgroup" data-type="horizontal" data-mini="true"> \
								<button  data-psg-store-index="' + index + '" \
								class="ispu-select-button ui-btn ui-btn-a ui-shadow ui-corner-all ui-first-child ui-last-child" >Select Store</button>';
			}
			storeString += '</li>';
		});
				
		if (storeString == '') {
			storeString = '<li>No Stores Available</li>';
		}
				
		var page = $('#page_ispu_select');
		var ul = $("#ispu_select_listview");
		ul.append(storeString);
		ul.listview('refresh');
		page.find('.psg-cg').controlgroup().controlgroup('refresh');

		page.find('.ispu-select-button').on("click", function(event)
		{
			var itemKey = sessionStorage.getItem(getBase() + "ispu.key");
			var index = $(event.target).attr("data-psg-store-index");
			var store = data.Stores[index];
			var ispuData = JSON.stringify({ key: itemKey, Store: store});
			getJson("CHECKOUT.ISPU.STORES.SET",  function (checkoutData)
			{
				if (checkoutData.Result == null || checkoutData.Result == "success") {
					$.mobile.changePage( "checkoutconfirm.html");
				}else {
					WriteError(checkoutData.Result);
				}
			},
			ispuData);
		});
				 
	} else {
		WriteError(data.Result);
	}
}