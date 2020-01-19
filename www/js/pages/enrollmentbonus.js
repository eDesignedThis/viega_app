function page_enrollment_bonus_show(){
	// TODO
	// handle other types of games, not just winwheel
	handleEnrollmentBonus();
}
var ww;

// Handles the response from the JSON service.
function handleEnrollmentBonus() {
	var searchTermGame = 'GAMES > GAME[GAME_TYPE_ID="1"][PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]'; // winwheel	only
	var $xml = $(psg.configXml);
	if ($xml.find(searchTermGame).length == 0){
		WriteError('Games are not setup correctly.');
		return;				
	}					
	
	var getXmlFields = ParseXmlFieldsFrConfiguration();
	if(psg.isNothing(getXmlFields.gamesWWId)){
		WriteError('Games are not setup correctly.');
		return;
	}	
	$('#page_enrollment_bonus_content').trigger('create');
	$("#popupGames").hide();
	$("#popupErrors").hide();
	$('#divHome').hide();
	$("#btnConfirm").click(function () {
		
		$("#popupGames").jqxWindow('close');
		$('#divHome').show();
		$('#ww_instructions_button').hide();
	});	
	
	$('#frmWinWheel').validate({
		submitHandler : submitWinwheelForm
	});
	function submitWinwheelForm() {
		ww.startSpin();
	}
	$("#myDrawingCanvas").click(function () {
		ww.startSpin();
	});		

	
	

	BuildStyle(getXmlFields);
	var prizeArray = BuildPrizes();
	DrawWinWheel(prizeArray,getXmlFields);
	
}

function ParseXmlFieldsFrConfiguration(){
	
	var xmlFields = new Array();
	var searchTermGame = 'GAMES > GAME[GAME_TYPE_ID="1"][PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"]'; // winwheel	only
	var $xml = $(psg.configXml);
	if ($xml.find(searchTermGame).length == 0){
		return null;				
	}					
	
	var searchTermMessage = searchTermGame + ' > MESSAGE';		
	var messageWW = $xml.find(searchTermMessage).text();
	
	$xml.find(searchTermGame).each( function() {
		var item = $(this);
	
		if(item.attr("PARTICIPANT_TYPE_ID") == psg.participantTypeId){
			xmlFields.gamesWWpaxtype = $xml.find(searchTermGame).attr('PARTICIPANT_TYPE_ID'); 
			xmlFields.gamesWWId = $xml.find(searchTermGame).attr("GAME_ID");
			xmlFields.gamesWWmarketerId = $xml.find(searchTermGame).attr("MARKETER_ID");
			xmlFields.gamesWWwidth = $xml.find(searchTermGame).attr("WIDTH_MOBILE");
			xmlFields.gamesWWpointerAngle = $xml.find(searchTermGame).attr("POINTER_ANGLE");	
			xmlFields.gamesWWheight = $xml.find(searchTermGame).attr("HEIGHT_MOBILE");
			xmlFields.gamesWWcontainerWidth = $xml.find(searchTermGame).attr("CONTAINER_WIDTH_MOBILE");
			xmlFields.gamesWWcontainerHeight = $xml.find(searchTermGame).attr("CONTAINER_HEIGHT_MOBILE");
			xmlFields.gamesWWhomeUrl = $xml.find(searchTermGame).attr("HOME_URL");	
			xmlFields.gamesWWbackgroundUrl = $xml.find(searchTermGame).attr("BACKGROUND_IMAGE_URL_MOBILE");	
			xmlFields.gamesWWimageUrl = $xml.find(searchTermGame).attr("WINWHEEL_IMAGE_URL_MOBILE");
			xmlFields.gamesWWmessage = messageWW;
		}
	});

	return xmlFields;
}
function BuildStyle(xmlFields){
	var 	styleHead = '<style>p.noCanvasMsg{color: white;}';
			styleHead += '.instructions{vertical-align: middle;display:table-cell;}';	
			styleHead += '.instructionsContainer{margin: 25px auto;display: table;text-align:center;}';	
			styleHead += '.winWheelContainer{position: relative; margin: 20px auto 0 auto;display: table;text-align:center;width: ' + xmlFields.gamesWWcontainerWidth + 'px; height: ' + xmlFields.gamesWWcontainerHeight + 'px;background-repeat: no-repeat;background-image: url("' + app.getHost() + '/' + xmlFields.gamesWWbackgroundUrl + '"); background-position: center;}.winWheelCenter{width:140px;height:140px;position:absolute;top: 50%;left:50%;transform: translate(-50%, -50%);-webkit-transform: translate(-50%, -50%);-ms-transform: translate(-50%, -50%);z-index:999;}';
			styleHead += '.winWheelDiv{vertical-align: middle;width: ' + xmlFields.gamesWWwidth + '; display:table-cell; height: ' + xmlFields.gamesWWheight + '; z-index:888;}</style>';	
	
	$("head").append(styleHead);
	
}
function BuildPrizes() {
	if ( typeof canEdit == 'undefined' ){
		canEdit = false;
	}
	if ( typeof suffix == 'undefined') {
		suffix = '';
	}

	var searchTermPrize = '';
	if (psg.participantTypeId == null) {
		WriteError('No prizes found');
		return;
	}
	searchTermPrize = 'GAMES > GAME[PARTICIPANT_TYPE_ID="' + psg.participantTypeId + '"] > PRIZE';	
	var $xml = $(psg.configXml);
	var isPhoneGap = app.isPhoneGap;
	var prizes = [];
	
	
	$xml.find(searchTermPrize).each( function() {
		var item = $(this);
		prizes.push({
			name: item.attr("PRIZENAME"),
			amount: item.attr("PRIZEAMOUNT"),
			startAngle: item.attr("STARTANGLE"),
			prizeId: item.attr("GAMEPRIZEID"),
			endAngle: item.attr("ENDANGLE")
		})	
	});
	
	return prizes;
}
function DrawWinWheel(prizes,xmlFields){
		var prizesJSON = JSON.stringify(prizes);
		//fieldString += '<div class="pax-image"><img src="' + app.getHost() + '/catalog/profiles/' + pax.AvatarUrl + '" /></div>';
		var imageURLLocation = app.getHost() + '/' + xmlFields.gamesWWimageUrl; //'/images/winwheel_' + xmlFields.gamesWWpaxtype + '_mobile.png';
				options = 
				{
				"imageUrl" : imageURLLocation, 
				"power" : "2", 
				"canvasId": "myDrawingCanvas",
				"buttonId": "btnSpin", 
				"gameId":  xmlFields.gamesWWId,
				"message":  xmlFields.gamesWWmessage,
				"prizes": prizesJSON,
				"pointerAngle": xmlFields.gamesWWpointerAngle,
				/*firstName" : '<%=FirstName%>',
				"lastName"  : '<%=LastName%>'
				*/
				}
		ww = new WinWheel(options); // winwheel_mobile.js
}
