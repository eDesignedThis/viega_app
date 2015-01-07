function page_claims_landing_show (){
	getJson("CLAIM.PROMOTIONS.GET", function(data) {
		psg.setSessionItem('claim.promotions', JSON.stringify(data.Promotions));
		var listString = buildPromotionList(data.Promotions);
		
		var ul = $('#psg-listview-claimslanding');
		ul.html(listString).listview().listview('refresh');
	
		ul.find('.psg-promotion-item').on('click', function ( event ) {
			var id = $(event.delegateTarget).attr('psg-promotion-id');
			var typeId = $(event.delegateTarget).attr('psg-promotion-type-id');
			var promotion = $.grep(JSON.parse(psg.getSessionItem('claim.promotions')), function (promotion, index) {
				return (!psg.isNothing(promotion) && promotion.promotion_id == id);
			});
			psg.removeSessionItem('claim_id');
			psg.setSessionItem('promotion_id', id);
			psg.setSessionItem('promotion_type_id', typeId);
			psg.setSessionItem('promotion_name', !psg.isNothing(promotion) ? promotion[0].promotion_name : '');
			
			event.stopImmediatePropagation();
			event.preventDefault();
			$.mobile.pageContainer.pagecontainer('change', 'claims.html', { transition: 'slide', changeHash: false } );
		});
		
		ul.find('.psg-promotion-info-item').on('click', function ( event ) {
			var id = $(event.delegateTarget).attr('psg-promotion-id');
			psg.setSessionItem('promotion_id', id);
		});
	});
	
	function buildPromotionList(promotions) {
		if (psg.isNothing(promotions)) {
			return '<li><p class="ui-no-ellipse error"><strong>There are no active promotions at this time.  Please check back later.</strong></p></li>';
		}
		
		var output = '<li><p class="ui-no-ellipse">Please select one of the following promotions:</p></li>';
		$.each(promotions, function( index, promotion ) {
			output += '<li><a href="claims.html" class="psg-promotion-item" data-transition="slide" psg-promotion-id="';
			output += promotion.promotion_id.toString();
			output += '" psg-promotion-type-id="';
			output += promotion.promotion_type_id.toString();
			output += '"><div class="ui-no-ellipse ui-text-small"><strong>';
			output += promotion.promotion_name;
			output += '</strong></div><div class="ui-text-small"><div class="ui-float-left">';
			output += moment(promotion.sales_start_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += ' thru ';
			output += moment(promotion.sales_end_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</div></div></a><a href="promotioninfo.html" class="psg-promotion-info-item" data-transition="slide" psg-promotion-id="';
			output += promotion.promotion_id.toString();
			output += '">Promotion Information</a></li>';
		});
		
		return output;
	}
}