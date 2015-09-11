function page_promotion_detail_show () {
	var content = $('#psg-promotion-detail-content');
	content.html('');
	
	var promotionId = psgClaimHistory.SelectedPromotion.get();
	if (psg.isNothing(promotionId)) {
		content.html('<p class="error"><strong>Yikes!</strong> Unable to retrieve the promotion ID.</p><p class="ui-text-small">Try returning to the main menu and see if the problem corrects itself.</p>');
		return;
	}
	
	var listString = buildPromotionDetail(promotionId);
	content.html(listString);
	var detail = content.children('#psg-collapsible-set-promotion-detail');
	detail.collapsibleset().collapsibleset("refresh");
	detail.find(':jqmData(role=listview)').listview().listview('refresh');
	detail.find(':jqmData(role=controlgroup)').controlgroup().controlgroup('refresh');
	detail.find('.psg-promotion-goal-progress-bar').each(function () {
		var progressBar = $(this);
		var percent = parseFloat(progressBar.attr('psg-progress-percent'));
		progressBar.jqxProgressBar({ width: 180, height: 23, value: percent, showText: true });
	});
	detail.find('.jqx-widget-content').css('background-color', '#999');
	detail.find('.jqx-widget-content').css('color', 'white');
	detail.find('.jqx-fill-state-pressed').css('background-color', 'green');
	
	$('#psg-promotion-claim-view').on('change', function() {
		var filter = psgClaimHistory.Filter.get();
		filter.ClaimFilter = $(this).val();
		psgClaimHistory.Filter.set(filter);
		page_promotion_detail_show();
	});
	
	detail.find('.psg-claim-item').on('click', function ( event ) {
		var id = $(event.delegateTarget).attr('psg-claim-id');
		psgClaimHistory.SelectedClaim.set(id);
	});

	function buildPromotionDetail ( promotionId ) {
		var output = '';
		var data = psgClaimHistory.Data.get();
		
		$.each(data.Promotions, function( index, promotion) {
			if (psg.isNothing(promotion) || promotion.promotion_id != promotionId) {
				return;
			}
			output += '<h3 class="headerDivider">' + promotion.promotion_name + '</h3><div class="ui-margin-top-1x">';
			output += moment(promotion.sales_start_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += ' thru ';
			output += moment(promotion.sales_end_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</div><div>';
			if (psg.payoutType != '1') {
				output += psg.NumberUtil.toPoints(promotion.payout);
			} else {
				output += psg.NumberUtil.toCurrency(promotion.payout);
			}
			output += '</div><div id="psg-collapsible-set-promotion-detail" data-role="collapsibleset" data-theme="a" data-content-theme="a" data-inset="false">';
			
		});
		
		var goalCount = 0;
		var goalText = '';
		var promotion_id = parseInt(promotionId);
		$.each(data.Goals, function( index, goal) {
			if (psg.isNothing(goal) || goal.promotion_id != promotion_id || psg.isNothing(goal.goal_value) || goal.goal_value == 0) {
				return;
			}
			goalCount++;
			goalText += '<li><table width="100%"><tr><td>';
			switch (goal.goal_basis) {
				case 0:
				case 1:
					goalText += psg.StringUtil.Concatenate(' ', goal.product_code, goal.tier_group_name, 'Units Goal').trim();
					break;
				case 2:
					goalText += psg.StringUtil.Concatenate(' ', goal.product_code, goal.tier_group_name, 'Sales Goal').trim();
					break;
			}
			goalText += '</td><td class="ui-text-right"><strong>';
			switch (goal.goal_basis) {
				case 0:
				case 1:
					goalText += psg.NumberUtil.toNumber(goal.goal_value, 2) + ' Units';
					break;
				case 2:
					goalText += psg.NumberUtil.toCurrency(goal.goal_value);
					break;
			}
			goalText += '</strong></td></tr></table><table width="100%"><tr><td><div class="psg-promotion-goal-progress-bar" psg-progress-percent="';
			goalText += psg.NumberUtil.toNumber(goal.tier_size <= 0 ? 100 : goal.tier_progress <= 0 ? 0 : goal.tier_progress >= goal.tier_size ? 100 : (goal.tier_progress / goal.tier_size) * 100, 0);
			goalText += '"></div></td><td class="ui-text-right"><small>';
			var total;
			switch (goal.goal_basis) {
				case 0:
				case 1:
					total = goal.units_sold;
					if (total > goal.goal_value) {
						total = goal.goal_value
					}
					if (goal.tier_progress > 0) {
						goalText += psg.NumberUtil.toNumber(total, 2) + ' Units';
					}
					break;
				case 2:
					total = goal.total_sales;
					if (total > goal.goal_value) {
						total = goal.goal_value
					}
					if (goal.tier_progress > 0) {
						goalText += psg.NumberUtil.toCurrency(total);
					}
					break;
			}
			goalText += '</small></td></tr></table></li>';
		});
		if (goalCount > 0) {
			output += '<div data-role="collapsible" data-collapsed="true" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" data-theme="a" data-content-theme="a"><h3><div class="ui-btn-up-c ui-btn-corner-all ui-li-count">';
			output += psg.NumberUtil.toNumber(goalCount, 0);
			output += '</div>Goals</h3><ul id="psg-listview-promotiongoals" data-role="listview" data-theme="a" data-divider-theme="a">';
			output += goalText;
			output += '</ul></div>';
		}
		
		output += '<div id="psg-collapsible-promotion-claims" data-role="collapsible" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" data-collapsed="false" data-theme="a" data-content-theme="a"><h3><div class="ui-btn-up-c ui-btn-corner-all ui-li-count">';
		var claims = [];
		var filter = psgClaimHistory.Filter.get();
		$.each(data.Claims, function( index, claim) {
			if (psg.isNothing(claim) || claim.promotion_id != promotionId) {
				return;
			}
			switch (filter.ClaimFilter) {
				case "2": if (claim.status_type_id != "0") { return; } break;
				case "3": if (claim.status_type_id != "1" && claim.status_type_id != "2") { return; } break;
				case "4": if (claim.status_type_id != "3") { return; } break;
				case "5": if (claim.status_type_id != "4") { return; } break;
			}
			claims[claims.length] = claim;
		});
		output += psg.NumberUtil.toNumber(claims.length, 0);
		output += '</div>Claims</h3><ul id="psg-listview-promotionclaims" data-role="listview" data-theme="a" data-divider-theme="a"><li><div id="psg-promotion-claim-view-cGroup" data-role="controlgroup"><label for="psg-promotion-claim-view">View</label><select name="psg--claim-view" id="psg-promotion-claim-view" data-mini="true" data-inline="true" data-native-menu="true"><option>Filter your claims</option>';
		$.each(data.Views, function( index, view) {
			if (psg.isNothing(view)) {
				return;
			}
			output += '<option value="' + view.Key + '"' + (view.Key == filter.ClaimFilter ? ' selected' : '') + '>' + view.Value + '</option>';
		});
		output += '</select></div></li>';
		if (claims.length == 0) {
			output += '<li><p class="ui-no-ellipse">You have no matching claims, or your claims are archived.</p></li>';
		}
		else {
			output += psgClaimHistory.buildClaimList(claims);
		}
		output += '</ul></div></div>';

		return output;
	}
}
