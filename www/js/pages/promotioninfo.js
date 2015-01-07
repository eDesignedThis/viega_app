function page_promotion_info_show () {
	var content = $('#psg-promotion-info-content');
	content.html('');
	
	var promotionId = psg.getSessionItem('promotion_id');
	if (psg.isNothing(promotionId)) {
		content.html('<p class="error"><strong>Yikes!</strong> Unable to retrieve the promotion ID.</p><p class="ui-text-small">Try returning to the main menu and see if the problem corrects itself.</p>');
		return;
	}
	
	var selectedPromotion = null;
	$.each(JSON.parse(psg.getSessionItem('claim.promotions')), function ( index, promotion ) {
		if (psg.isNothing(promotion) || promotion.promotion_id != promotionId) {
			return;
		}
		selectedPromotion = promotion;
	});
	
	var listString = buildPromotionInfo(selectedPromotion);
	content.html(listString);
	content.find(':jqmData(role=controlgroup)').controlgroup().controlgroup('refresh');

	content.find('#psg-promotion-info-download-products').on('click', function () {
		getJson("CLAIM.PROMOTION.PRODUCTS.GET", function(data) {
			var output = '';
			if (psg.isNothing(data) || psg.isNothing(data.Products)) {
				output += '<p class="ui-no-ellipse">There are no eligible products, currently.</p>';
			}
			else {
				output += '<table class="ui-text-small" data-role="table" data-mode="columntoggle"><thead><tr><th>Code</th><th>Name</th></tr></thead><tbody>';
				var products = [];
				$.each(data.Products, function (index, product) {
					if (psg.isNothing(product) || products.indexOf(product.product_code) > -1) {
						return;
					}
					products[products.length] = product.product_code;
					output += '<tr><td>';
					output += product.product_code.toUpperCase();
					output += '</td><td>';
					output += product.product_name;
					output += '</td></tr>';
				});
				output += '</tbody></table>';
			}
			content.find('#psg-promotion-info-download-products').hide();
			var productDiv = content.find('#psg-promotion-info-products');
			productDiv.html(output);
			productDiv.find(':jqmData(role=table)').table().table("refresh");
		}, { PromotionId: promotionId });
	});
	
	function buildPromotionInfo ( promotion ) {
		var output = '';
		
		if (psg.isNothing(promotion)) {
			output += '<p class="error"><strong>Yikes!</strong> Unable to retrieve the promotion.</p><p class="ui-text-small">Try returning to the main menu and see if the problem corrects itself.</p>';
		}
		else {
			output += '<h3 class="headerDivider">' + promotion.promotion_name + '</h3><div class="ui-field-contain"><label for="psg-promotion-sales-dates">Eligible Sales:</label><span name="psg-promotion-sales-dates">';
			output += moment(promotion.sales_start_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += ' thru ';
			output += moment(promotion.sales_end_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</span></div><div class="ui-field-contain"><label for="psg-promotion-sales-dates">Must submit by:</label><span name="psg-promotion-sales-dates">';
			output += moment(promotion.disable_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</span><div><h4>Applicable Products</h4><button id="psg-promotion-info-download-products" class="ui-btn ui-btn-a ui-mini ui-icon-action ui-btn-icon-left">Show Eligible Products</button><div id="psg-promotion-info-products"></div>';
		}
		
		return output;
	}
}
