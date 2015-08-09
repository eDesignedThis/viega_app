function page_claim_detail_show () {
	$('#psg-claim-detail-content').html('');
	
	var claimId = psgClaimHistory.SelectedClaim.get();
	if (psg.isNothing(claimId)) {
		$('#psg-claim-detail-content').html('<p class="error"><strong>Yikes!</strong> Unable to retrieve the claim ID.</p><p class="ui-text-small">Try returning to the main menu and see if the problem corrects itself.</p>');
		return;
	}
	
	getJson("CLAIM.DETAIL.GET", handleClaimDetail, JSON.stringify({ ClaimId: claimId }));
	
	function handleClaimDetail(data) {
		if (psg.isNothing(data) || psg.isNothing(data.Claim)) {
			$('#psg-claim-detail-content').html('<p class="error"><strong>Yikes!</strong> Your claim is unavailable or non-existent.</p><p>Check with your program administrator to see if the claim has been archived.</p>');
			return;
		}
		
		var listString = '';
		listString += psgClaimHistory.buildClaimDetail(data.Claim);
		$('#psg-claim-detail-content').html(listString);
		$('#psg-claim-detail-content').children(':jqmData(role=listview)').listview().listview('refresh');
		$('#frmClaimDetail').validate({ submitHandler: submitClaimDetailDocument });
		$.mobile.silentScroll(0);
	}

	function submitClaimDetailDocument() {
		var data = {};
		var docForm = $('#frmClaimDetail');
		docForm.serializeArray().map(function(x){data[x.name] = x.value;});
		data["ClaimId"] = claimId;
		
		var picture = docForm.find('.psg_picture_image');
		if (!app.isPhoneGap || picture.length == 0 || picture.attr('src') == null
			|| picture.attr('src') == '') {
			return;
		}

		var imageUri = picture.attr('src');
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = imageUri.substr(imageUri.lastIndexOf('/')+1);
		options.mimeType = "image/jpeg";
		options.params = data;
		options.chunkedMode = false;

		var ft = new FileTransfer();
		var url = app.getHost() + "/json/jsonClaim.ashx?action=CLAIM.DOCUMENT.UPLOAD"
		ft.upload(imageUri, url, fileSuccess, fileError, options);
	}
	
	function fileSuccess(fileUploadResult) {
		if (!psg.isNothing(fileUploadResult)) {
			handleClaimDetail(JSON.parse(fileUploadResult.response));
		}
	}
	
	function fileError(fileTransferError) {
		if (!psg.isNothing(fileTransferError)) {
			var status = fileTransferError.code == FileTransferError.CONNECTION_ERR ? "timeout" : fileTransferError.exception;
			var fauxXhr = {
				responseURL: fileTransferError.target,
				status: fileTransferError.http_status,
				statusText: status
			};
			app.standardErrorHandler(fauxXhr, status);
		}
	}
}
