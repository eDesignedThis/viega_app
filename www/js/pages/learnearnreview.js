function page_learn_earn_review_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.LIST.DETAIL", HandleSurveyReview, data);
}

// Handle errors from ajax.
function HandleSurveyReview(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyReview(data.Survey);
	}
	else {
		WriteError(data.Error);
	}
}

// Update UI elements and apply event handlers.
function DrawSurveyReview(data) {
	var detail = BuildSurveyReview(data);
	
	var ul = $('#psg-listview-learnreview');
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
function BuildSurveyReview(data) {
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
		<p class="ui-no-ellipse psg-lrnErn-txt">Thank you for taking the time to complete this ';
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
	listString += '<div class="ui-no-ellipse"><table>';
	listString += '<tr><td class="ui-form-label">Type</td><td class="ui-form-field">';
	if (data.SurveyTypeId == 1) {
		listString += 'Quiz</td></tr>';
	}
	else {
		listString += 'Survey</td></tr>';
	}
	if (!psg.isNothing(data.Results)) {
		listString += '<tr><td class="ui-form-label">Results</td><td class="ui-form-field">' + data.Results + '</td></tr>';
	}
	listString += '<tr><td class="ui-form-label">Completed</td><td class="ui-form-field">' + moment(data.DateFinished).format('MM-DD-YYYY'); + '</td></tr>';
	listString += '</table></div>';
	listString += '</li>';
	
	// Build action button.
	listString += '<li><a href="learnearnmain.html" class="psg-learn-earn-review-link" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Back</a></li>';
	
	// Return as object so additional info can be returned in future.
	return { html: listString };
}
