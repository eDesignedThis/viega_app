function page_claims_confirmation_show (){
	resetPage();
	
	var result = JSON.parse(psg.getSessionItem('claim_result_array'));
	if (psg.isNothing(result)) {
		hidePage();
		return;
	}
	
	var auditId = result[4];
	if (psg.isNothing(auditId)) {
		showSuccess();
	}
	else {
		showAudit();
	}

	psg.setSessionItem('claim_id', result[2]);
	
	$('.psg-claims-confirmation-page-link').on('click', function ( event ) {
		event.stopImmediatePropagation();
		event.preventDefault();
		$.mobile.pageContainer.pagecontainer('change', $(event.target).attr('href'), { transition: 'slide', changeHash: false, reverse: true } );
	});
	
	function resetPage() {
		$('#psg-claims-confirmation-success-div').show();
		$('#psg-claims-confirmation-audit-div').show();
		$('#psg-claims-confirmation-new-claim-div').show();
	}
	
	function hidePage() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').hide();
		$('#psg-claims-confirmation-new-claim-div').hide();
	}
	
	function showAudit() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').show();
	}
	
	function showSuccess() {
		$('#psg-claims-confirmation-success-div').show();
		$('#psg-claims-confirmation-audit-div').hide();
	}
}