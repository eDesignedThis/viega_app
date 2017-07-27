function page_claims_landing_show() { //@@@ CL
	getJson("CLAIM.PROMOTIONS.GET", function (data) {
		psg.setSessionItem('claim.promotions', JSON.stringify(data.Promotions));
		var listString = buildPromotionList(data.Promotions);

		var ul = $('#psg-listview-claimslanding');
		ul.html(listString).listview().listview('refresh');

		ul.find('.psg-promotion-item').on('click', function (event) {
			var id = $(event.delegateTarget).attr('psg-promotion-id');
			var typeId = $(event.delegateTarget).attr('psg-promotion-type-id');
			var promotion = $.grep(JSON.parse(psg.getSessionItem('claim.promotions')), function (promotion, index) {
					return (!psg.isNothing(promotion) && promotion.promotion_id == id);
				});
			psg.removeSessionItem('claim_id');
			openNewClaim(id, typeId, !psg.isNothing(promotion) ? promotion[0].promotion_name : '', 'claims.html');

			event.stopImmediatePropagation();
			event.preventDefault();
		});

		ul.find('.psg-promotion-info-item').on('click', function (event) {
			var id = $(event.delegateTarget).attr('psg-promotion-id');
			var typeId = $(event.delegateTarget).attr('psg-promotion-type-id');
			psg.setSessionItem('promotion_id', id);
			psg.setSessionItem('promotion_type_id', typeId);
		});
	});
}
function buildPromotionList(promotions) { //@@@ CL
	if (psg.isNothing(promotions)) {
		return '<li><p class="ui-no-ellipse error"><strong>There are no active promotions at this time.  Please check back later.</strong></p></li>';
	}
	var noForm = false;
	var output = '<li><p class="ui-no-ellipse">Please select one of the following promotions:</p></li>';
	$.each(promotions, function (index, promotion) {
		noForm = false;
		output += '<li>';
		if ($(psg.configXml).find('PROMOTION_TYPES[PROMOTION_TYPE_ID="' + promotion.promotion_type_id.toString() + '"][REMOVE_FORM="1"]').length > 0)
			noForm = true;

		if (!noForm) {
			output += '<a href="claims.html" class="psg-promotion-item" data-transition="slide" psg-promotion-id="';
			output += promotion.promotion_id.toString();
			output += '" psg-promotion-type-id="';
			output += promotion.promotion_type_id.toString();
			output += '">';
		} else {
			output += '<a href="#" >';
		}
		output += '<div class="ui-no-ellipse ui-text-small"><strong>';
		output += promotion.promotion_name;
		output += '</strong></div><div class="ui-text-small"><div class="ui-float-left">';
		output += moment(promotion.sales_start_date_jdate, 'MM-DD-YYYY').format('MM-DD-YYYY');
		output += ' thru ';
		output += moment(promotion.sales_end_date_jdate, 'MM-DD-YYYY').format('MM-DD-YYYY');
		output += '</div></div></a>';
		output += '<a href="promotioninfo.html" class="psg-promotion-info-item" data-transition="slide" psg-promotion-id="';
		output += promotion.promotion_id.toString();
		output += '" psg-promotion-type-id="';
		output += promotion.promotion_type_id.toString();
		output += '">Promotion Information</a></li>';
	});

	return output;
}

function openNewClaim(promotionId, promotionTypeId, promotionName, claimPage) { //@@@ CL
	psg.setSessionItem('promotion_id', promotionId);
	psg.setSessionItem('promotion_type_id', promotionTypeId);
	psg.setSessionItem('promotion_name', !psg.isNothing(promotionName) ? promotionName : '');
	
	$.mobile.pageContainer.pagecontainer('change', claimPage, {
		transition : 'slide',
		changeHash : true
	});
}


function checkForTabledPromotion(promotionTypeId) {
	var isTabled = false;
	var rowCount = '1';
	var searchTerm = 'PROMOTION_TYPES[PROMOTION_TYPE_ID="' + promotionTypeId + '"] FIELDGROUP';

	var options = psg.configXml;
	var $xml = $(options);
	$xml.find(searchTerm).each(function () {
		var item = $(this);
		if (!psg.isNothing(item.ROWCOUNT) && item.ROWCOUNT > 1) {
			rowCount = item.ROWCOUNT;
		}
		isTabled = true;
	});

	return {
		IsTabled : isTabled,
		RowCount : rowCount
	};
}
