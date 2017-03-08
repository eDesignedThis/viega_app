function page_learn_earn_complete_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.LIST.DETAIL", HandleSurveyComplete, data);
}

// Handle errors from ajax.
function HandleSurveyComplete(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyComplete(data.Survey);
	}
	else {
		WriteError(data.Error);
	}
}

// Update UI elements and apply event handlers.
function DrawSurveyComplete(data) {
	var detail = BuildSurveyComplete(data);
	
	var ul = $('#psg-listview-learncomplete');
	ul.html(detail.html);
	ul.listview({
		autodividers: true,
		dividerTheme: "a",
		autodividersSelector: function (li) {
			var out = li.attr("data-psg-divider");
			return out;
		}
	});

	ul.listview('refresh');
}

// Build the UI string from the data.
function BuildSurveyComplete(data) {
	var listString = '';
	
	var instructions = data.MobileInstructions;
	if (psg.isNothing(instructions)) {
		instructions = data.Instructions;
	}

	listString += '<li data-psg-divider="' + data.Title + '">';
	if (!psg.isNothing(instructions)) {
		listString += '<div class="ui-no-ellipse">' + instructions + '</div></li><li>';
	}
	listString += '<div class="ui-no-ellipse"> \
		<h2>Thank You</h2> \
		<p class="ui-no-ellipse psg-lrnErn-txt">Thank you for completing the ';
	if (data.SurveyTypeId == 1) {
		listString += 'quiz.';
	}
	else {
		listString += 'survey.';
	}
	listString += '</p> \
		</div>\
	</li>';
	
	// Build summary string.
	listString += '<li>';
	
	
	if (data.SurveyTypeId == 1) {
		listString += '<div class="ui-no-ellipse"><table>';
		if(data.PassingGrade > 0){listString += '<tr><td>In order to pass the quiz, you need to score a ' +  data.PassingGrade + '% or higher.</td></tr>'}
		listString += '<br />'
		listString += '<tr><td><b>Your Quiz Results:</b></td></tr>'
		listString += '<tr><td><b>Grade: </b>' + data.Grade + '</td></tr>'
		listString += '<tr><td><b>Score: </b>' + data.Score + ' %</td></tr>'
		listString += '<br />'
		if((data.Retakes > 0 && data.Attempts) > 0 && data.Grade == 'Fail'){listString += '<tr><td>You have ' + (data.Retakes - data.Attempts) + ' retakes available.</td></tr>'}

	}
	else {
		listString += '<div class="ui-no-ellipse"><table><tr><td>';
		listString += '<tr><td class="ui-form-label">Type</td><td class="ui-form-field">';
		listString += 'Survey</td></tr>';
		if (!psg.isNothing(data.Results)) {
			listString += '<tr><td class="ui-form-label">Results</td><td class="ui-form-field">' + data.Results + '</td></tr>';
		}
		
	}
	listString += '<tr><td class="ui-form-label">Completed</td><td class="ui-form-field">' + moment(data.DateFinished).format('MM-DD-YYYY'); + '</td></tr>';	
	listString += '</table></div>';
	listString += '</li>';
	if (data.SurveyTypeId == 1) {	
		if((data.Retakes > 0 && data.Attempts) > 0 && data.Grade == 'Fail') {
			if(data.Retakes - data.Attempts > 0){
				listString += '<li><a href="learnearncontent.html" class="psg-learn-earn-detail-link" data-transition="slide">Retake Now</a></li>';
			}
		}
	}
	// Build action button.
	listString += '<li><a href="learnearnmain.html" class="psg-learn-earn-complete-link" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Back</a></li>';
	
	// Return as object so additional info can be returned in future.
	return { html: listString };
}
