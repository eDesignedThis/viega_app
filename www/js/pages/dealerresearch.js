function page_dealer_research_show() {
	$('#dealer_research_dealership_name').text('');
	$('#dealer_research_street_address').text('');
	$('#dealer_research_city_name').text('');
	$('#dealer_research_state').text('');
	$('#dealer_research_zip').text('');
	$('#dealer_research_dealership_phone').text('');
	$('#dealer_research_pax_name').text('');
	$('#dealer_research_pax_email').text('');
	$('#dealer_research_comment').text('');

	$('#dealer_research_submit').click(ReturnDealerResearchInfo);
	$('#dealer_research_close').click(CloseDealerResearch);
	$('#dealer_research_comment').on('keyup', CountDealerResearchComment);
}

function ReturnDealerResearchInfo() {
	var dealershipName = $('#dealer_research_dealership_name').val();
	var streetAddress = $('#dealer_research_street_address').val();
	var city = $('#dealer_research_city_name').val();
	var state = $('#dealer_research_state').val();
	var zip = $('#dealer_research_zip').val();
	var phone = $('#dealer_research_dealership_phone').val();
	var paxName = $('#dealer_research_pax_name').val();
	var paxEmail = $('#dealer_research_pax_email').val();
	var comment = $('#dealer_research_comment').val();
	var researchText = "Dealership Information ---------- \r\n" +
		"Dealership Name:\t" + dealershipName + "\r\n" +
		"Street Address:\t" + streetAddress + "\r\n" +	
		"City:\t\t" + city + "\r\n" +	
		"State:\t\t" + state + "\r\n" +	
		"Zip\\Postal Code:\t" + zip + "\r\n" +	
		"Phone Number:\t" + phone + "\r\n" +	
		"\r\n" +
		"Participant Information ---------- \r\n" +
		"Name:\t\t" + paxName + "\r\n" +	
		"Email:\t\t" + paxEmail + "\r\n" +	
		"\r\n" +
		"Additional Comments ---------- \r\n" +
		comment;
	SetDealerResearchValue(researchText);
	$('#page_dealer_research').dialog('close');
}

function CloseDealerResearch() {
	$('#page_dealer_research').dialog('close');
}

function CountDealerResearchComment() {
	var len = this.value.length;
	if (len > 1000) {
		showAlert('Comment is limited to 1000 characters.','Too Many Characters');
		thetext.focus();
	}
}
