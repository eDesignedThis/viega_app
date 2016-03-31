function page_item_options_show(){
	$("#item_options_item_title").text(sessionStorage.getItem(getBase() + "add.title"));
	var options = $.parseXML(sessionStorage.getItem(getBase() + "add.options"));
	$xml = $(options)
	$label = $xml.find("OptionList > DropDownList").attr("Label");
	id = $xml.find("OptionList > DropDownList").attr("ID");

	var points = sessionStorage.getItem(getBase() + "add.points");  
	var optionsString = '';
	var optionCounter = 1;
	var hasPricing = (points.indexOf("From") > -1) ? true:false;
	$xml.find("OptionList > DropDownList > ListItem").each( function(){
			var item = $(this)
			var points = item.attr("TotalPoints");
			optionsString += '<input data-psg-id="' + id + '" name="order-choice" id="order-choice-' + optionCounter + '" \
				value="' + item.attr("Value") + '"  type="radio"> \
					<label for="order-choice-' + optionCounter + '">' + item.attr("Text");
			if (hasPricing) {
				optionsString += ' / ' + addCommas(points) + ' Points';
			}					
			optionsString += '</label>';
			optionCounter++;
		});
		
	$("#item_options_points").text( points + " Points");
	
	if ($label != "Delivery Options") {
		  $item_options = $("#item_options");
		  $("#item_options_legend").text($label + ":");
		  $item_options.append(optionsString);
		  $item_options.show();
		  $item_options.controlgroup().controlgroup("refresh");
	 }else{
		 $delivery_options = $("#delivery_options");
		 $("#delivery_options_legend").text($label + ":");
		 $delivery_options.append(optionsString);
		 $delivery_options.show();
		 $delivery_options.controlgroup().controlgroup("refresh");
	}
	var page = $('#page_item_options');
	page.find(':button').on("click", HandleItemOptionClick);
}

function HandleItemOptionClick(event) {
	var urlAction = "SHOPPING.WISHLIST.MOVETOCART";
	var keyValue = sessionStorage.getItem(getBase() + "add.key");
	var id =  $('input[type=radio]:checked').attr("data-psg-id");
	if (psg.isNothing(id)) {
		WriteError('Please select an option.');
	}
	else {
		var selectedOrderOptions = id + "=" + $('input[type=radio]:checked').val() + ";";
		var data = JSON.stringify({ key: keyValue, options: selectedOrderOptions }); 
		getJson(urlAction, HandleItemOptionCallback, data);
	}
}

function HandleItemOptionCallback(data) {
	if (data.Result == null || data.Result == "success") {
		 $.mobile.pageContainer.pagecontainer('change', 'shoppingcart.html');
	} else {
		WriteError(data.Result);
	}
}