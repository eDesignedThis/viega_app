function page_learn_earn_review_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.REVIEW", HandleSurveyReview, data);
}

function HandleSurveyReview(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyReview(data);
	}
	else {
		WriteError(data.Error);
	}
}

function DrawSurveyReview(data) {
	var surveyForm = BuildLearnEarnQuestions(data, true);
	
	var ul = $('#psg-listview-learnreview');
	ul.html(surveyForm);
	ul.listview({
		autodividers: true,
		dividerTheme: "a" ,
		autodividersSelector: function (li) {
			var out = li.attr("data-psg-divider");
			return out;
		}
	});
	
	ul.listview('refresh');
}
