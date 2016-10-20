function page_claims_tabled_show() {
	var promotionName = psg.getSessionItem('promotion_name');
	$('#claims_tabled_title').html(promotionName);

	var instructions = getClaimsTabledInstructions();
	$('#claims_tabled_instructions').html(instructions);
	
	$('.number-rows-add').on('click', incrementNumberOfRows);
	$('.number-rows-subtract').on('click', decrementNumberOfRows);
	$('#psg_claims_tabled_continue_button').on('click', continueToClaimPage);
}

function getClaimsTabledInstructions() {
	var promotionTypeId = psg.getSessionItem('promotion_type_id');
	
	var options = psg.configXml;
	var $xml = $(options);

	var searchTerm = 'PROMOTION_TYPES[PROMOTION_TYPE_ID="' + promotionTypeId + '"] FIELD[NAME="product_code"]';

	var label = '';
	$xml.find(searchTerm).each(function () {
		var item = $(this);
		label = item.attr("LABEL");
	});
	label = label.toLowerCase() + 's';
	
	return 'How many ' + label + ' do you want to enter?';
}

function incrementNumberOfRows() {
	var control = $('#number_of_rows');
	var rows = parseInt(control.val()) || 1;
	if (rows >= 10) {
		control.val('10');
		return;
	}
	if (rows < 1) {
		control.val('1');
		return;
	}
	rows++;
	control.val(rows.toString());
}

function decrementNumberOfRows() {
	var control = $('#number_of_rows');
	var rows = parseInt(control.val()) || 1;
	if (rows > 10) {
		control.val('10');
		return;
	}
	if (rows <= 1) {
		control.val('1');
		return;
	}
	rows--;
	control.val(rows.toString());
}

function continueToClaimPage() {
	var control = $('#number_of_rows');
	var rows = parseInt(control.val()) || 1;
	if (rows <= 0) rows = 1;  // min value
	if (rows > 10) rows = 10; // max value
	psg.setSessionItem('promotion_number_of_rows', rows);
	event.stopImmediatePropagation();
	event.preventDefault();
	var claimPage = psg.getSessionItem('open_new_claim_target_page');
	$.mobile.pageContainer.pagecontainer('change', claimPage, { transition: 'slide', changeHash: true } );
}