function page_promotion_history_show () {
	var filter = psgClaimHistory.Filter.get();
	var data = psgClaimHistory.Data.get();
	
	var listString = buildPromotionList(data.Promotions);
	
	var ul = $('#psg-listview-promotionhistory');
	ul.html(listString).listview().listview('refresh');
	ul.find(':jqmData(role=controlgroup)').controlgroup().controlgroup('refresh');
	ul.find('.psg_promotion_filter [value="' + filter.PromotionFilter + '"]').prop('checked', true);
	
	ul.find('.psg_promotion_filter').on('click', function(e) {
		var filter = psgClaimHistory.Filter.get();
		filter.PromotionFilter = $(e.delegateTarget).val();
		psgClaimHistory.Filter.set(filter);
		
		getJson("CLAIM.HISTORY.GET", function(data) {
			data = psgClaimHistory.Data.prep(data);
			psgClaimHistory.Data.set(data);
			
			page_claim_detail_show();
		}, filter);
	});
	
	ul.find('.psg-promotion-item').on('click', function ( event ) {
		var id = $(event.delegateTarget).attr('psg-promotion-id');
		psgClaimHistory.SelectedPromotion.set(id);
	});
	
	function buildPromotionList ( promotions ) {
		var filter = psgClaimHistory.Filter.get();
		var output = '';
		
		output += '<li data-theme="c" class="ui-text-small"><table><tr><td>Promotions</td><td><fieldset data-role="controlgroup" data-type="horizontal" data-mini="true"><input name="psg_promotion_filter" id="psg_promotion_filter_active" class="psg_promotion_filter" value="0" type="radio"';
		output += filter.PromotionFilter == "0" ? ' checked="true"' : '';
		output += '><label for="psg_promotion_filter_active">Active</label><input name="psg_promotion_filter" id="psg_promotion_filter_all" class="psg_promotion_filter" value="1" type="radio"';
		output += filter.PromotionFilter == "1" ? ' checked="true"' : '';
		output += '><label for="psg_promotion_filter_all">All</label></fieldset></td></tr></table></li>';
		
		if (psg.isNothing(promotions)) {
			output += '<li><p>There are no matching or eligible promotions.<p></li>';
		}
		else {
			$.each(promotions, function( index, promotion ) {
				output += '<li><a href="promotiondetail.html" class="psg-promotion-item" data-transition="slide" psg-promotion-id="';
				output += promotion.promotion_id.toString();
				output += '"><div class="ui-no-ellipse ui-text-small"><strong>';
				output += promotion.promotion_name;
				output += '</strong></div><div class="ui-text-small"><div class="ui-float-left">';
				output += moment(promotion.sales_start_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
				output += ' thru ';
				output += moment(promotion.sales_end_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
				output += '</div><div class="ui-float-right">';
				output += promotion.payout_formatted
				output += '</div></div></a></li>';
			});
		}
		
		return output;
	}
}
