function page_learn_earn_detail_show() {
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.LIST.DETAIL", HandleSurveyDetail, data);
}

// Handle errors from ajax.
function HandleSurveyDetail(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyDetail(data.Survey);
	}
	else {
		WriteError(data.Error);
	}
}

// Update UI elements and apply event handlers.
function DrawSurveyDetail(data) {
	var detail = BuildSurveyDetail(data);
	
	var ul = $('#psg-listview-learndetail');
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
function BuildSurveyDetail(data) {
	var listString = '';

	listString += '<li data-psg-divider="' + data.Title + '"> \
		<div class="ui-no-ellipse">' + data.Instructions + '</div>\
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
	listString += '<tr><td class="ui-form-label">Questions</td><td class="ui-form-field">' + data.QuestionCount + '</td></tr>';
	if (data.AwardPoints > 0) {
		listString += '<tr><td class="ui-form-label">Award</td><td class="ui-form-field">' + data.AwardAmountText;
		if (data.SurveyTypeId == 1) {
			listString += ' for score of ' + data.PassingGrade + '%';
			if (data.PassingGrade != "100") {
				listString += ' or more';
			}
		}
		else {
			listString += ' for completing';
		}
		listString += '</td></tr>';
	}
	listString += '</table></div>';
	listString += '</li>';
	
	// Build action button.   <button id="contact_submit"class="ui-btn ui-btn-a ui-shadow ui-corner-all" type="submit" >Submit</button>
	if (!data.PrerequisitesMet) {
		listString += '<li><a href="learnearnmain.html" class="psg-learn-earn-detail-link" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Back</a></li>';
	}
	else if (!data.HasTaken && data.CanTake) {
		listString += '<li><a href="learnearncontent.html" class="psg-learn-earn-detail-link" data-transition="slide">Start Now</a></li>';
	}
	else if (data.HasTaken && data.Attempts <= data.Retakes && data.Score < data.PassingGrade && data.CanTake) {
		if (data.Attempts > 0) {
			listString += '<li><a href="learnearncontent.html" class="psg-learn-earn-detail-link" data-transition="slide">Retake Now</a></li>';
		}
		else {
			listString += '<li><a href="learnearncontent.html" class="psg-learn-earn-detail-link" data-transition="slide">Start Now</a></li>';
		}
	}
	else if (data.HasTaken || data.Attempts > data.Retakes) {
		if (psg.isNothing(data.Results)) {
			listString += '<li><div class="ui-no-ellipse ui-text-small psg-learnearn-li-section"><p>Completed</p></div></li>';
		} else {
			listString += '<li><div class="ui-no-ellipse ui-text-small psg-learnearn-li-section"><p>Completed: ' + data.Results + '</p></div></li>';
		}
		listString += '<li><a href="learnearnmain.html" class="psg-learn-earn-detail-link" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Back</a></li>';
	}
	
	// Return as object so additional info can be returned in future.
	return { html: listString };
}