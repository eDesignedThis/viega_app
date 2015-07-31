function page_claim_show() {
	var promotionId = psg.getSessionItem('promotion_id');
	var promotionTypeId = psg.getSessionItem('promotion_type_id');
	var promotionName = psg.getSessionItem('promotion_name');
	
	$('#psg-claims-promotion-name').html(promotionName);
	
	var searchTerm = 'PROMOTION_TYPES[PROMOTION_TYPE_ID="' + promotionTypeId + '"] FIELD';
    var fields = ParseFields('claim', searchTerm);
	var formDiv = $('#claim_form_div');
	formDiv.html(fields.html);
	formDiv.append(fields.script); 
	$('#page_claim_content').trigger('create');
    $('#frmClaim').validate({ submitHandler: submitClaimForm });
	
	var claimId = psg.getSessionItem('claim_id');
	if (claimId != null){
	    var data = JSON.stringify({ claim_id: claimId});
		getJson("CLAIM.DUPLICATE.GET", handleClaimPrefill, data);
	}

	function handleClaimPrefill(data){
		if (data.Result == "success"){
			psg.removeSessionItem('claim_id');
			var claimDataRow = data.ClaimDetail[0];
			PreFillForm(claimDataRow,'claim');
		}
	}

	function submitClaimForm() {
		var data = {};
		$('#frmClaim').serializeArray().map(function(x){data[x.name] = x.value;});
		var promotionId = psg.getSessionItem('promotion_id');
		data["promotion_id"] = promotionId;
		if (!app.isPhoneGap || $('.psg_picture_image').length == 0 || $('.psg_picture_image').attr('src') == null
			|| $('.psg_picture_image').attr('src') == '') {
			getJson("MOBILE.CLAIM.SUBMIT", submitClaimFormResult, data);
		} else {
			var imageUri = $('.psg_picture_image').attr('src');
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = imageUri.substr(imageUri.lastIndexOf('/')+1);
			options.mimeType = "image/jpeg";
			options.params = data;
			options.chunkedMode = false;

			var ft = new FileTransfer();
			var url = app.getHost() + "/json/jsonmobile.ashx?action=MOBILE.CLAIM.SUBMIT"
			ft.upload(imageUri, url, fileSuccess, fileError, options);
		}
	}

	function submitClaimFormResult(data){
		if (data.Result == "success") {
			psg.setSessionItem('claim_result_array', JSON.stringify(data.ResultArray));
			$.mobile.pageContainer.pagecontainer('change', 'claimsconfirmation.html', { transition: 'slide', changeHash: false } );
		} else {
			if (!psg.isNothing(data.ResultArray) && data.ResultArray.length > 1) {
				WriteError(data.ResultArray[1]);
			}
			else {
				WriteError(data.Result);
			}
		}
	}
	
	function fileSuccess(fileUploadResult) {
		if (!psg.isNothing(fileUploadResult)) {
			submitClaimFormResult(JSON.parse(fileUploadResult.response));
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

function PreFillForm(dataRow, formName) {
	for(var key in dataRow) {
		if (dataRow[key] != null && dataRow[key] != '') {
			var field = $('#' + formName + '_' + key);
			if (field.length) {
				field.val(dataRow[key]);
				if (field.is('select')) {
					field.selectmenu('refresh', true);
				}
				if (!field.is(':visible')){
				    jqxField = $('#div_date_' + formName + '_' + key)
					if (jqxField.length){
						jqxField.val(dataRow[key]);
						continue;
					}
					var jqxField = $('#div_combo_' + formName + '_' + key)
					if (jqxField.length) {
							var lookupFormat = field.attr('data-psg-format');
							var preloadCode = key;
							var preloadName = key.replace('_code','_name');
							var preloadZip = key.replace('_code', '_zip');
							var formatCode = "[" + key + "]";
							var formatName = formatCode.replace("_code","_name");
							var formatZip = formatCode.replace("_code","_zip");
							var initialValue = lookupFormat;
							initialValue = initialValue.replace(formatCode, dataRow[preloadCode]);
							initialValue = initialValue.replace(formatName, dataRow[preloadName]);
							initialValue = initialValue.replace(formatZip, dataRow[preloadZip]);
							jqxField.val(initialValue);
							continue;
					}						
				}
			}
		}
	}
}

function ParseFields(page,searchTerm,canEdit) {
	if ( typeof canEdit == 'undefinded' )
		canEdit = false;

	var options = psg.configXml;
	var $xml = $(options)
	var formString='';
	var scriptString = '';
	var isPhoneGap = app.isPhoneGap;
	$xml.find(searchTerm).each( function() {
		var item = $(this);

		if ( canEdit && item.attr("CANEDIT") == '0' )
			return;

		var itemType = item.attr("TYPE");
		var itemName = item.attr("NAME");
		var itemLabel = item.attr("LABEL");
		var fieldSize = item.attr("SIZE");
		var fieldSizeInt = 0;
		if (!psg.isNothing(fieldSize) && parseInt(fieldSize) != NaN) {
			fieldSizeInt = parseInt(fieldSize);
			if (fieldSizeInt > 10) {
				fieldSizeInt = 0;
			} else {
				fieldSizeInt = fieldSizeInt + 0.5;
			}
		}
		
		
		var placeholder = item.attr("FIELD_PLACEHOLDER");
		var required = item.attr("REQUIRED");
		var validationMessage = item.attr("VALIDATION_MESSAGE");
		var validationExpression = item.text();

		
		if (required == "1") {
			required = "required";
		}else{
			required = "";
		}
		
		if (itemType == 'hidden'){
			formString +='<input name="' + itemName + '"  type="hidden" value="' + item.attr("VALUE") + '" >';
			return;
		} 
		if (itemType == 'hiddenq'){
			formString +='<input name="' + itemName + '"  type="hidden" value="1" >';
			return;
		} 
		if (itemType == 'hiddend'){
			formString +='<input name="' + itemName + '" type="hidden" value="' + moment().format('MM/DD/YYYY') + '" >';
			return;
		} 
		if (itemType == 'addressblock') {
			formString += ExpandAddressBlock(page);
			return; //continue;
		}
		else {
			//formString += '<div class="ui-field-contain">';
			if (itemType != 'note') {
				formString +='<div class="ui-margin-top-1x"><label for="' + itemName + '">' + itemLabel + '</label>';
			}						
		}
		itemId =  page + '_' + itemName;
		switch(itemType){
			case 'note':
				//TODO: Do we need to consider encoding for notes or other field labels?
				formString += undecorateCheckboxes(itemLabel);
				break;
			case 'text2':
			case 'text':
				var scanEnabled = item.attr('ENABLESCAN');
				if (isPhoneGap && scanEnabled == '1') {
					formString += '<div class="ui-input-text ui-corner-all ui-body-inherit ui-shadow-inset ui-input-with-icon-container">';
					formString += '<input data-enhanced="true" name="' + itemName + '" id="' + itemId + '" placeholder="' + placeholder;
					formString += '" data-wrapper-class="controlgroup-textinput ui-btn" type="text" ';
					if (fieldSizeInt > 0) {
						formString += ' style="width:' + fieldSize + 'em;" ';
					}
					if (required) {
						formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
					}
					if (validationExpression){
						formString += ' data-rule-regex="true" data-psg-validation="' +  validationExpression + '" data-msg-regex="' + validationMessage + '" ';
					}
					formString += '>';
					//formString += '<button id="scan_' + itemId + '" value="Scan" class="ui-btn ui-btn-a ui-icon-eye ui-btn-icon-notext cancel">Scan</button>';
					formString += '<a href="#" id="scan_' + itemId + '" class="fa fa-qrcode ui-menu-icon fa-lg fa-fw" style="margin:-14px .3125em 0;margin-right:5px;position:absolute;top:65%;right:0;"></a>';
					formString += '</div>';
					scriptString += '<script>app.initScanField("' + itemId + '");</scr' + 'ipt>';
				} else {
				    formString += '<div class="ui-input-text ui-corner-all ui-body-inherit ui-shadow-inset"';
					if (fieldSizeInt) {
					    formString += ' style="width:' + fieldSizeInt + 'em;" ';
						
					}
					formString += '>';
					formString += '<input data-enhanced="true" name="' + itemName + '" id="' + itemId + '" placeholder="' + placeholder + '" type="text"'; 
					if (required) {
						formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
					}
					if (validationExpression){
						formString += ' data-rule-regex="true" data-psg-validation="' +  validationExpression + '" data-msg-regex="' + validationMessage + '" ';
					}
					formString += '></div>';
				}
				break;
			//we store the actual values in a field with display:none
			case 'lookup':
			case 'lookup2':
			case 'modellookup':
			case 'modellookup2':
				var lookupFields = item.attr("LOOKUP_FIELDS");
				var lookupFormat = item.attr("LOOKUP_FORMAT");
				formString += '<div id="div_combo_' + itemId + '"></div><div id="toolTip_' + itemId + '"></div><input style="display:none;" data-role="none" type="text" id="' + itemId +'" name="' + itemName + '" ';
				if (required) {
					formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
				}
				formString += '>';
				scriptString += '<script>InitLookup("' + page + '","' + itemId + '","' + itemName + '","' + lookupFields + '","' + lookupFormat + '","' + placeholder + '");</scr' + 'ipt>';
				break;
			//we store the actual value in field with display:none
			case 'date':
			case 'date2':
				formString += '<input style="display:none;" type="text" data-role="none" id="' + itemId + '" name="' + itemName + '" ';
				if (required) {
					formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
				}				
				formString += '><div id="div_date_' + itemId + '"></div>';
				scriptString += '<script>InitDate("' + itemId + '");</scr' + 'ipt>';
				break;
			case 'select':
				formString += '<select id="' + itemId + '" name="' + itemName + '" ';
				if (required) {
					formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
				}
				formString += '><option value="">Select One</option>';
				item.find('OPTION').each( function (index, value) {
					var option = $(this);
					formString += '<option value="' + option.attr("VALUE") + '">' + option.attr("TEXT") + '</option>';
				});
				formString += '</select>';
				break;
			case 'checkbox':
				//TODO: Need checkbox xml example
				break;
			case 'textarea':
				formString += '<textarea id="' + itemId +'" name="' + itemName +'" placeholder="' + placeholder + '" ';
				formString += 'onBlur="checkLen(this);" ';
				if (required) {
					formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
				}
				if (validationExpression){
						formString += ' data-rule-regex="true" data-psg-validation="' +  validationExpression + '" ';
				}
				formString += '></textarea>';					
				break;
			case 'document':
			case 'picture':
			    if (isPhoneGap){
					formString += '<input style="display:none;" data-role="none" name="' + itemName + '" id="' + itemId + '"  \
									type="text" ';
					if (required) {
						formString += ' data-rule-required="true" data-msg-required="' + itemLabel + ' is required." ';
					}
					formString += '> \
						<img id="img_' + itemId + '" style="width:250px;display:none" class="psg_picture_image">\
						<button id="picture_' + itemId + '" class="ui-btn ui-btn-a ui-icon-camera ui-btn-icon-right cancel ui-shadow ui-corner-all"  >Attach / Change Photo</button>';
						scriptString += '<script>app.initPictureField("' + itemId + '");</scr' + 'ipt>';
				}else{
					formString += '<input type="file" accept="image/*" capture="camera" name="' + itemName + '" id="' + itemId + '" placeholder="' + placeholder + '">';
				//TODO: implement html5 media capture with fileAPI
				}
				break;
		}
		formString += '</div>';
	});
	
	var fields = { html: formString, script: scriptString };
	return fields;
}

function undecorateCheckboxes(formString) {
	return formString.replace('type="checkbox"', 'type="checkbox" data-role="none"');
}

function InitLookup (page, itemId, itemName, itemLookupFields, itemLookupFormat, itemPlaceholder){
	var fieldId = itemId;
	var fieldName = itemName;
	var guid = encodeURIComponent(psg.programGuid);	
	var fields = itemLookupFields;
	if (psg.isNothing(fields) || fields === "undefined") {
		fields = "3";
	}
	var placeholder = itemPlaceholder;
	var formatCode = "[" + fieldName + "]";
	var formatName = formatCode.replace("_code","_name");
	var formatZip = formatCode.replace("_code","_zip");
	var format = itemLookupFormat;
	if (psg.isNothing(format) || format === "undefined"){
		format = formatCode + " " + formatName;
	}
	var controlName = $("#div_combo_" + fieldId);
	var hdControlName = $("#" + fieldId);
	var toolTip = $("#toolTip_" + fieldId);
	var promotionId = psg.getSessionItem('promotion_id');
	hdControlName.attr('data-psg-format',format);
	var source = {
		type: "GET",
		datatype: "json",
		datafields: [{name: 'Code'}, {name: 'Name'}, {name: 'ZipCode'}],
		url: app.getHost() +  "/json/JsonService.ashx",
		data: {
			action: page + "." + fieldName.replace("_", "") + "s" + ".get",
			programGuid: guid,
			fields: fields,
			promotion_id: promotionId
		}
	};
	var dataAdapter = new $.jqx.dataAdapter(source,
	{
		autoBind: false,
		contentType: "application/json; charset=utf-8",
		formatData: function (data) {
			if (controlName.jqxComboBox('searchString') != undefined) {
				data.filter = controlName.jqxComboBox('searchString');
				return data;
			}
		},
		beforeLoadComplete: function (data) {
			return $.map(data, function (item) {
				var name = format.replace(formatCode, item.Code);
				name = name.replace(formatName, item.Name);
				name = name.replace(formatZip, item.ZipCode);
				return {
					label: name,
					value: item.Code,
				}
			});
		},
		loadComplete: function () {
			if (dataAdapter.records.length == 0) {
				toolTip.jqxTooltip('open'); 
			}
		},
		loadError: function (xhr, status, error) {
			alert("Error: " + xhr.statusText);
		}
	});
	
	controlName.jqxComboBox(
	{ 
		minLength: 2, 
		placeHolder: placeholder, 
		height: 30, 
		width: 280,
		scrollBarSize: 10,
		source: dataAdapter,
		remoteAutoComplete: true,
		remoteAutoCompleteDelay: 500,
		valueMember: "value",
		displayMember: "label",
		searchMode: "containsignorecase",
		search: function (searchString) {
			dataAdapter.dataBind();
		}
	});
	
	toolTip.jqxTooltip({ 
		content: 'No Results', 
		position: 'right',
		autoHide: true,
		trigger: 'click',
		autoHideDelay: 2500
	});

	controlName.find("input:eq(0)").on('click', function () {
		$(this).select();
	}); 

	var values;
	controlName.on('select', function (event) {
		if (!event) return;
		if (!event.args) return;
		if (!event.args.item.value) return;
		values = event.args.item.value;
		hdControlName.val(values);
	});
}

function InitDate (fieldName) {
	//TODO: Supports placeholder?
	var dt = $('#div_date_' + fieldName);
	dt.jqxDateTimeInput({
		formatString: 'MM/dd/yyyy',
		titleHeight: 35,
		dropDownWidth: 240,
		dropDownHeight: 240, 
		buttonSize: 24,
		width: '115px', 
		height: '30px',
		value: null
	});

	dt.on('valuechanged', function (event) {
		if (event == null) return;
		if (event.args == null) return;
		if (event.args.date == null) return;
		var d = event.args.date;
		var hf = $('#'+fieldName);
		hf.val(d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()); 
	});
}
			