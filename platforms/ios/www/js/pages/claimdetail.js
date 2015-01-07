function page_claim_detail_show () {
	$('#psg-claim-detail-content').html('');
	
	var claimId = psgClaimHistory.SelectedClaim.get();
	if (psg.isNothing(claimId)) {
		$('#psg-claim-detail-content').html('<p class="error"><strong>Yikes!</strong> Unable to retrieve the claim ID.</p><p class="ui-text-small">Try returning to the main menu and see if the problem corrects itself.</p>');
		return;
	}
	
	getJson("CLAIM.DETAIL.GET", function(data) {
		if (psg.isNothing(data) || psg.isNothing(data.Claim)) {
			$('#psg-claim-detail-content').html('<p class="error"><strong>Yikes!</strong> Your claim is unavailable or non-existent.</p><p>Check with your program administrator to see if the claim has been archived.</p>');
			return;
		}
		
		var listString = '';
		listString += psgClaimHistory.buildClaimDetail(data.Claim);
		$('#psg-claim-detail-content').html(listString);
		$('#psg-claim-detail-content').children(':jqmData(role=listview)').listview().listview('refresh');
	}, { ClaimId: claimId });
}
