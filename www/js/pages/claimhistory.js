function page_claim_history_show () {
	var filter = psgClaimHistory.Filter.get();

	getJson("CLAIM.HISTORY.GET", function(data) {
		data = psgClaimHistory.Data.prep(data);
		psgClaimHistory.Data.set(data);
		
		var listString = '<li data-theme="a"><a href="promotionhistory.html" data-transition="slide">More...</a></li>';
		if (psg.isNothing(data) || psg.isNothing(data.Claims)) {
			listString += '<li>You have no claims or your claims are archived.</li>';
		}
		else {
			var latest = psgClaimHistory.getLastClaims(data.Claims);
			listString += psgClaimHistory.buildClaimList(latest);
		}
		
		var ul = $('#psg-listview-claimhistory');
		ul.html(listString);
		ul.listview().listview('refresh');
		$('.psg-claim-item').on('click', function ( event ) {
			var id = $(event.delegateTarget).attr('psg-claim-id');
			psgClaimHistory.SelectedClaim.set(id);
		});
	}, filter);
}

var psgClaimHistory = {
	SelectedClaim: {
		get: function () {
			return psg.getSessionItem("claim.history.selectedclaim");
		},
		set: function ( id ) {
			if (psg.isNothing(id)) {
				psg.removeSessionItem("claim.history.selectedclaim");
			}
			else {
				psg.setSessionItem("claim.history.selectedclaim", id);
			}
		}
	},
	SelectedPromotion: {
		get: function () {
			return psg.getSessionItem("claim.history.selectedpromotion");
		},
		set: function ( id ) {
			if (psg.isNothing(id)) {
				psg.removeSessionItem("claim.history.selectedpromotion");
			}
			else {
				psg.setSessionItem("claim.history.selectedpromotion", id);
			}
		}
	},
	Filter: {
		get: function () {
			var raw = psg.getSessionItem("claim.history.filter");
			if (psg.isNothing(raw)) {
				return psgClaimHistory.Filter.getDefault();
			}
			return JSON.parse(raw);
		},
		getDefault: function () {
			return { PromotionFilter: "0", ClaimFilter: "1" };
		},
		set: function ( filter ) {
			psg.setSessionItem("claim.history.filter", JSON.stringify(filter));
		}
	},
	Data: {
		prep: function ( raw ) {
			var data = $.extend({}, psgClaimHistory.Data.getDefault(), raw);
			if (!psg.isNothing(data.Claims)) {
				data.Claims.sort(function(a,b) { return !a.claim_date.localeCompare(b.claim_date); } );
			}
			return data;
		},
		get: function () {
			var raw = psg.getSessionItem("claim.history.data");
			if (psg.isNothing(raw)) {
				return psgClaimHistory.Data.getDefault();
			}
			return JSON.parse(raw);
		},
		getDefault: function () {
			return { Views: [ { Key: "1", Value: "All - Not Denied" } ], Promotions: [], Goals: [], Claims: [] };
		},
		set: function ( data ) {
			psg.setSessionItem("claim.history.data", JSON.stringify(data));
		}
	},
	getLastClaims: function ( claims, count ) {
		if (psg.isNothing(claims)) {
			return [];
		}
		if (psg.isNothing(count)) {
			count = 3;
		}
		return claims.slice(0, Math.min(claims.length, count));
	},
	buildClaimList: function ( claims ) {
		if (psg.isNothing(claims)) {
			return '';
		}
		
		var output = '';
		var claim;
		var amount;
		for (var i = 0; i < claims.length; i++) {
			claim = claims[i];
			output += '<li><a href="claimdetail.html" class="psg-claim-item" data-transition="slide" psg-claim-id="';
			output += claim.claim_id.toString();
			output += '"><div class="ui-overlay-container"><div class="ui-no-ellipse ui-text-small"><strong>';
			output += claim.promotion_name;
			output += '</strong></div><div class="ui-text-small"><table>';
			if (!psg.isNothing(claim.invoice_number)) {
				output += '<tr><td class="ui-form-label">Invoice</td><td class="ui-form-field">';
				output += claim.invoice_number;
				output += '</td></tr>';
			}
			output += '<tr><td class="ui-form-label">Product</td><td class="ui-form-field">';
			output += claim.product_name;
			if (!psg.isNothing(claim.is_claim_split) && claim.is_claim_split === 1) {
				output += '<small style=\"margin-left:1.5em;\">Claim Split</small>';
			}
			output += '</td></tr>';
			output += '<tr><td class="ui-form-label">Claim Date</td><td class="ui-form-field">';
			output += moment(claim.claim_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</td></tr>';
			output += '<tr><td class="ui-form-label">Sale Date</td><td class="ui-form-field">';
			output += moment(claim.sale_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			output += '</td></tr>';
			if (!psg.isNothing(claim.quantity)) {
				output += '<tr><td class="ui-form-label">Quantity</td><td class="ui-form-field">';
				output += claim.quantity.toString();
				output += '</td></tr>';
			}
			if (!psg.isNothing(claim.promotion_basis) && claim.promotion_basis >= 20) {
				output += '<tr><td class="ui-form-label">Amount</td><td class="ui-form-field">';
				output += psg.NumberUtil.toCurrency(claim.sale_amount);
				output += '</td></tr>';
			}
			output += '<tr><td class="ui-form-label">Payout</td><td class="ui-form-field">';
			if (!psg.isNothing(claim.status_type_id) && claim.status_type_id === 0) {
				amount = claim.amount_paid_formatted;
			}
			else {
				amount = claim.payout_formatted;
			}
			output += amount;
			output += '</td></tr>';
			output += '</table></div><div class="ui-no-ellipse ui-text-small ui-text-right ui-claim-status ui-underlay"><div class="ui-claim-status">';
			output += claim.claim_status
			if (!psg.isNothing(claim.status_type_id) && claim.status_type_id === 0) {
				output += '<br />' + moment(claim.date_paid1_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
			}
			output += '</div></div></div></a></li>';
		}
		return output;
	},
	buildClaimDetail: function ( claim ) {
		if (psg.isNothing(claim)) {
			return '';
		}
		
		var output = '';
		if (!psg.isNothing(claim.cover_sheet_id)) {
			if (claim.status_type_id == 3 || claim.status_type_id == 11) {
				output += '<div class="audit_div">';
				var hasDocuments = !psg.isNothing(claim["Documents"]);
				if (!hasDocuments) {
					output += '<h3><i class="fa fa-exclamation-triangle fa-2x psg-claims-confirmation-audit-icon"></i>&nbsp; ATTENTION</h3>';
					output += '<p>Your submission <b>requires documentation</b>. You may attach a picture now.</p>';
				}
				else {
					output += '<h3>Claim Verification</h3>';
					output += '<p>You have attached the following picture as verification:</p>';
					output += '<code>';
					$.each(claim["Documents"], function( index, doc ) {
						if (psg.isNothing(doc)) return;
						output += doc.DocumentLocation + '<br />';
					});
					output += '</code>';
					output += '<p>You may upload additional documentation, if needed.</p>';
				}
				var picture = drawPictureControl('claimdetail_document', 'document', 'Upload Document', '0', '');
				if (!psg.isNothing(picture) && picture.isSupported) {
					output += '<form data-ajax="false" id="frmClaimDetail">';
					output += '<div class="ui-margin-top-1x">'
					output += '<input name="cover_sheet_id" type="hidden" value="' + claim.cover_sheet_id + '" >';
					output += picture.html;
					output += '</div>';
					output += '<br />';
					output += '<button class="ui-btn ui-btn-a ui-shadow ui-corner-all" type="submit">Submit</button>';
					output += picture.script;
					output += '</form>';
				}
				else {
					output += '<div class="ui-margin-top-1x ui-text-small">'
					output += 'Unfortunately, the mobile website <b>does not support</b> document uploads.';
					output += '</div>';
				}
				output += '</div><br /><br />';
			}
		}
		output += '<h3 class="headerDivider">' + claim.promotion_name + '</h3>';
		output += '<h4>Claim ID: ' + claim.claim_id.toString() + '</h4>';
		output += '<ul id="psg-listview-claimdetail-status" data-role="listview" data-theme="a" data-divider-theme="a" data-inset="false"><li data-role="list-divider">Claim Status</li><li class="ui-field-contain"><label for="psg-claim-detail-claim-date" class="ui-text-small">Claim Date:</label><span id="psg-claim-detail-claim-date">';
		output += moment(claim.claim_date_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
		output += '</span></li><li class="ui-field-contain"><label for="psg-claim-detail-claim-status" class="ui-text-small">Claim Status:</label><span id="psg-claim-detail-claim-status">';
		output += claim.claim_status;
		output += '</span></li>';
		switch (claim.status_type_id) {
			case 0:
				output += '<li class="ui-field-contain"><label for="psg-claim-detail-paid-date" class="ui-text-small">Approved Date:</label><span id="psg-claim-detail-paid-date">';
				output += moment(claim.date_paid_jdate,'MM-DD-YYYY').format('MM-DD-YYYY');
				output += '</span></li><li class="ui-field-contain"><label for="psg-claim-detail-paid-amount" class="ui-text-small">Award Amount:</label><span id="psg-claim-detail-paid-amount">';
				output += claim.amount_paid_formatted;
				output += '</span></li>';
				break;
			default:
				output += '<li class="ui-field-contain"><label for="psg-claim-detail-payout" class="ui-text-small">Payout:</label><span id="psg-claim-detail-payout">';
				output += claim.payout_formatted;
				output += '</span></li>';
		}
		output += '</ul>';
		output += '<ul id="psg-listview-claimdetail-details" data-role="listview" data-theme="a" data-divider-theme="a" data-inset="false"><li data-role="list-divider">Details</li>';
		
		var fields = ['invoice_number','product_name','sale_date','quantity','sale_amount','dealer_code','distributor_code','serial_number','receiver_serial','consumer_full_name','consumer_company','wholesaler_name','consumer_line_one','consumer_line_two','consumer_city','consumer_state','consumer_zip','consumer_phone_number'];
		var labels = ['Invoice','Product','Sale Date','Quantity','Sale Amount','Dealer','Distributor','Serial Number','Receiver Serial','Consumer','Company','Wholesaler','Address 1','Address 2','City','State','Zip','Phone'];
		$.each(fields, function( index, field ) {
			var value = claim[field];
			if (!psg.isNothing(value)) {
				output += '<li class="ui-field-contain"><label for="psg-claim-detail-invoice" class="ui-text-small">';
				output += labels[index];
				output += ':</label><span id="psg-claim-detail-invoice">';
				if (field.indexOf('jdate') > -1) {
					output += moment(value,'MM-DD-YYYY').format('MM-DD-YYYY');
				}
				else if (field === 'quantity') {
					output += psg.NumberUtil.toNumber(value, 2);
					if (!psg.isNothing(claim.uom)) {
						output += '&nbsp;' + claim.uom;
					}
				}
				else if (field === 'sale_amount') {
					output += psg.NumberUtil.toCurrency(value);
				}
				else {
					output += value;
				}
				output += '</span></li>';
			}
		});
		output += '</ul>';

		return output;
	}
};
