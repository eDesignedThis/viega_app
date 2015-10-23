function page_learn_earn_detail_show() {
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.LIST.DETAIL", HandleSurveyDetailList, data);
}

function HandleSurveyDetailList(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyDetail(data.Survey);
	}
	else {
		WriteError(data.Result);
	}
}

function DrawSurveyDetail(data) {
	var listString = '';

	listString += '<li data-psg-divider="' + data.SurveyTitle + '"> \
		<div class="ui-no-ellipse ui-text-small"><p>' + data.SurveyInstructions + '</p></div>\
	</li>\
	<li>\
		<div class="ui-no-ellipse ui-text-small"><p>' + data.SummaryText + '</p></div>\
	</li>';
		
	if (!data.hasTaken && data.CanTake) {
		listString += '<li><div class=""><button class="ui-btn ui-btn-a ui-shadow ui-corner-all" type="submit" >Start Now</button></div></li>';
	}
	else if (data.hasTaken && data.attempts <= data.Retakes && data.Score < data.SurveyPassingGrade && data.CanTake) {
		if (data.attempts > 0) {
			listString += '<li><a href="learnearncontent.html" data-transition="slide">Retake Now</a></li>';
		}
		else {
			listString += '<li><a href="learnearncontent.html" data-transition="slide">Start Now</a></li>';
		}
	}
	else if (data.hasTaken || data.attempts > data.Retakes) {
		if (psg.isNothing(data.results)) {
			listString += '<li><div class="ui-no-ellipse ui-text-small psg-learnearn-li-section"><p>Completed</p></div></li>';
		} else {
			listString += '<li><div class="ui-no-ellipse ui-text-small psg-learnearn-li-section"><p>Completed: ' + data.results + '</p></div></li>';
		}
		listString += '<li><a href="learnearnmain.html" data-transition="slide" data-direction="reverse" data-icon="arrow-l">Back</a></li>';
	}
      
	var ul = $('#psg-listview-learndetail');
	ul.html(listString);
	ul.listview({
		autodividers: true,
		dividerTheme: "a",
		autodividersSelector: function (li) {
			var out = li.attr("data-psg-divider");
			return out;
		}
	});

	ul.listview('refresh');
};
  




 