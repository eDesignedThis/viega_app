function page_claims_confirmation_show (){
	resetPage();
	
	var result = JSON.parse(psg.getSessionItem('claim_result_array'));
	if (psg.isNothing(result)) {
		hidePage();
		return;
	}
	
	var claimId = result[2];
	var auditId = result[4];
	var coverSheetId = result.length > 7 ? result[7] : "";
	if (psg.isNothing(auditId)) {
		showSuccess();
	}
	else {
		if (psg.isNothing(coverSheetId)) {
			showAudit();
		}
		else {
			var documentsSuccess = result.length > 5 ? result[5] : "";
			var documentsFailed = result.length > 6 ? result[6] : "";
			if (psg.isNothing(documentsSuccess) && psg.isNothing(documentsFailed)) {
				showDocumentationRequired();
			}
			else {
				showDocumentationProvided();
				$('#psg-claims-confirmation-documents-success').html(documentsSuccess);
				$('#psg-claims-confirmation-documents-failed').html(documentsFailed);
			}
			psgClaimHistory.SelectedClaim.set(claimId);
		}
	}

	psg.setSessionItem('claim_id', claimId);
	
	$('.psg-claims-confirmation-page-link').on('click', function ( event ) {
		event.stopImmediatePropagation();
		event.preventDefault();
		$.mobile.pageContainer.pagecontainer('change', $(event.target).attr('href'), { transition: 'slide', changeHash: false, reverse: true } );
	});
	
	function resetPage() {
		$('#psg-claims-confirmation-success-div').show();
		$('#psg-claims-confirmation-audit-div').show();
		$('#psg-claims-confirmation-documentation-required-div').show();
		$('#psg-claims-confirmation-documentation-provided-div').show();
		$('#psg-claims-confirmation-new-claim-div').show();
	}
	
	function hidePage() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').hide();
		$('#psg-claims-confirmation-documentation-required-div').hide();
		$('#psg-claims-confirmation-documentation-provided-div').hide();
		$('#psg-claims-confirmation-new-claim-div').hide();
	}
	
	function showAudit() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').show();
		$('#psg-claims-confirmation-documentation-required-div').hide();
		$('#psg-claims-confirmation-documentation-provided-div').hide();
	}
	
	function showSuccess() {
		$('#psg-claims-confirmation-success-div').show();
		$('#psg-claims-confirmation-audit-div').hide();
		$('#psg-claims-confirmation-documentation-required-div').hide();
		$('#psg-claims-confirmation-documentation-provided-div').hide();
	}
	
	function showDocumentationRequired() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').hide();
		$('#psg-claims-confirmation-documentation-required-div').show();
		$('#psg-claims-confirmation-documentation-provided-div').hide();
	}
	
	function showDocumentationProvided() {
		$('#psg-claims-confirmation-success-div').hide();
		$('#psg-claims-confirmation-audit-div').hide();
		$('#psg-claims-confirmation-documentation-required-div').hide();
		$('#psg-claims-confirmation-documentation-provided-div').show();
	}
}