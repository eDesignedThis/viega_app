function page_shopping_item_detail_show() {
	$('#psg_detail_onsale_info').hide();
	$("#psg_ispu_info").hide();
	itemDetails.show();
}

var itemDetails = {
	ispuValue: null,
	ispuKey: null,

	show: function()
	{
		var idThis = this;
		this.ispuValue = null;
		this.ispuKey = null;

		var keyValue = sessionStorage.getItem(getBase() + "psg-item-key");
		getJson("SHOPPING.DETAIL",
			function (result) {
				idThis.HandleGetShoppingDetail(result);
			},
			{key: keyValue});

		$('#psg_item_detail_cart').on('click', function () {
			//TODO: validate an option is checked.
			var selectedOptions = "";
			if ($('#psg_detail_item_options').length && !psg.isNothing($('#psg_detail_item_options').attr('data-psg-id'))) {
				var id = $('#psg_detail_item_options').attr('data-psg-id');
				var option = $("#psg_detail_item_options option:selected").val();
				selectedOptions = id + '=' + option + ';';
			}
			var keyValue = sessionStorage.getItem(getBase() + "psg-item-key");
			getJson("SHOPPING.CART.ADD",
				function(result) { idThis.HandleItemDetailAddCallback(result, 'shoppingcart.html'); },
				{key: keyValue, selectedOrderOptions: selectedOptions});
		});

		$('#psg_item_detail_wishlist').on('click', function () {
			var keyValue = sessionStorage.getItem(getBase() + "psg-item-key");
			getJson("SHOPPING.WISHLIST.ADD",
				function(result){ idThis.HandleItemDetailAddCallback(result, 'wishlist.html'); },
				{key: keyValue});
		});
	},

	HandleItemDetailAddCallback: function (data, nextPage) {
		if (data.Result == null || data.Result == "success") {
			$.mobile.pageContainer.pagecontainer('change', nextPage);
		} else {
			WriteError(data.Result);
		}
	},

	HandleGetShoppingDetail: function (data) {
		var idThis = this;
		if (data.Result == null || data.Result == "success") {
			var listString = '';
			$('#psg_detail_item_title').html(data.Item.ItemName);
			$('#psg_detail_item_url').attr("src", data.Item.ItemMediumImageUrlFullyQualified);
			$('#psg_detail_item_points').html('<span class="shopPtsStyle">' + data.Item.PointsPerUnitFormatted + '</span> points');
			$('#psg_item_detail_text').html(data.Item.ItemText);
			if (app.isPhoneGap) {
				$('#psg_item_detail_text').on('click', 'a', function(e) {
					e.preventDefault();
					window.open($(this).attr('href'), '_system');
				});
			}
			if (data.Item.IsOnSale) {
				$('#psg_detail_onsale_info').show();
				if (data.Sale) {
					var pricing = 'Regular Price&nbsp;' + data.Sale.RegularPointsPerUnitWithLabel;
					$('#psg_detail_item_regular_price').html(pricing);
				}
			}
			if (data.Item.OrderOptions != null && data.Item.OrderOptions != '') {
				var hasPricing = (data.Item.PointsPerUnitFormatted.indexOf("From") > -1) ? true : false;
				var orderOptions = $.parseXML(data.Item.OrderOptions);
				var xml = $(orderOptions);
				var label = xml.find("OptionList > DropDownList").attr("Label");
				var optionDiv = $('#psg_item_options');
				optionDiv.addClass("ui-field-contain");
				optionDiv.html('<label for="psg_detail_item_options">' + label + '</label>');
				var id = xml.find("OptionList > DropDownList").attr("ID");
				var optionsString = '';
				optionDiv.append('<select id="psg_detail_item_options" data-psg-id="' + id + '"></select>');
				xml.find("OptionList > DropDownList > ListItem").each(function () {
					var item = $(this)
					var points = item.attr("TotalPoints");
					optionString = '<option value="' + item.attr('Value') + '" class="ui-no-ellipse">' + item.attr('Text');
					if (hasPricing) {
						if (optionString.indexOf('/') > -1) {
							optionString += ' /'
						}
						optionString += ' ' + addCommas(points) + ' Points';
					}
					optionString = optionString + '</option>';
					$("#psg_detail_item_options").append(optionString);

					// the catalog id is embedded in the ispu item Value
					if (item.attr('Text') == 'In-Store Pickup')
						idThis.ispuValue = item.attr('Value');
				});

				$("#psg_detail_item_options").selectmenu().selectmenu('refresh').on('change', function () {
					idThis.detailChangeDeliveryOption(this);
				});
				
				if (app.isPhoneGap) {
				$('.cart_desktop_link').click(function() {
								window.open(psg.baseUrl + "/Cart.aspx", "_system");
								return false;
							});
				}

				// if we got the ISPU key then prefetch the list of stores where the item can be picked up
				if (this.ispuValue != null) {
					// keyValue="ISPU_535_8879139"
					var i = this.ispuValue.lastIndexOf('_');
					if (i > 0) {
						this.ispuKey = this.ispuValue.substring(i + 1);
						var data = JSON.stringify({ sku: this.ispuKey});

						getJson("ISPU.STORES.GET",
							function (result) {
								idThis.HandleGetIpuStoreList(result);
							},
							data);
					}
				}
			}

		} else {
			WriteError(data.Result);
		}
	},

	// populate the list of stores on response from ISPU.STORES.GET
	HandleGetIpuStoreList: function (data) {
		var storeString = '';
		if (data.Result == null || data.Result == "success") {
			$.each(data.Stores, function (index, store) {

				storeString += "<li>" + store.StoreName +
				"<br><span style='font-size:small;'>" + store.StoreAvailabilityMessage +
				"</span></li>";
			});
		}
		else
			storeString = '<li>No stores found.</li>';

		$("#ispu_store_list").html(storeString);
		$("#ispu_store_list").listview("refresh");

		this.detailChangeDeliveryOption($("#psg_detail_item_options"));
		$("#ispu_store_panel_search").hide();
		$("#ispu_store_panel_more").show();

	},


	// show or hide store list button based on delivery option
	detailChangeDeliveryOption: function (sel) {
		if ($(sel).val() == this.ispuValue)
			$("#psg_ispu_info").show();
		else
			$("#psg_ispu_info").hide();
	},

	// open the stores panel when user taps stores button
	detailShowStores: function () {
		$("#ispu_store_panel_search").hide();
		$("#ispu_store_panel_more").show();
		$("#ispu_store_panel").panel("open");
	},

	// dismiss the stores panel when user taps dismiss button
	detailDismissStores: function () {
		$("#ispu_store_panel").panel("close");
	},

	// show the zip code search input and button when user taps on ''Check More Stores'
	detailCheckMoreStores: function () {
		$("#ispu_store_panel_more").hide();
		$("#ispu_store_panel_search").show();
	},

	// search for stores in zip code when user taps 'Show Nearby Stores' button
	detailShowMoreStores: function () {
		$("#detailMoreStoresZip").blur();

		var idThis = this;
		var data = { sku: this.ispuKey };
		var zip = $("#detailMoreStoresZip").val();
		if (zip.length > 0)
			data['zip'] = zip;
		$("#ispu_store_list").html(
			"<li>Looking for stores in<br>" + (zip == '' ? ' your zip code' : zip) + "</li>");
		$("#ispu_store_list").listview("refresh");


		getJson("ISPU.STORES.GET",
			function (result) {
				idThis.HandleGetIpuStoreList(result);
			},
			data);
	},

	// track keystrokes in the search box and trigger a find on enter key
	detailSearchKeyPress: function (e) {
		if (e.which == 13) {
			$(e.target).blur();
			this.detailShowMoreStores();
		}
	},

	storeSearchMouse : function(e) {
		$("#detailMoreStoresZip").blur();
		this.detailShowMoreStores();
	},

	// https://github.com/jquery/jquery-mobile/issues/5532
	// footer does not get repositioned correctly when soft keypad is hidden
	// Here's the the workaround:
	// $(document).on('blur', 'input, textarea', function() {
	// 		setTimeout(function() {
	//			window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
	//		}, 0);
	// });
	moreStoresZipBlur : function() {
		setTimeout(function () {
			window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
		}, 0);
	}

};

