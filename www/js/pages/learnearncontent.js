function page_learn_earn_content_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.START", HandleSurveyDetailList, data);
}

function HandleSurveyContent(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyContent(data);
	}
	else {
		WriteError(data.Result);
	}
}

function DrawSurveyContent(data) {
	var surveyForm = BuildLearnEarnQuestions(data, false);
	
	var ul = $('#psg-listview-learncontent');
	ul.html(surveyForm.html);
	ul.listview({
		autodividers: true,
		dividerTheme: "a" ,
		autodividersSelector: function (li) {
			var out = li.attr("data-psg-divider");
			return out;
		}
	});
	
	ul.listview('refresh');
    
	$('#frmLearnEarn').validate({ submitHandler: SubmitSurvey });
}

function SubmitSurvey(){
	var data = {};
	var form = $('#frmLearnEarn');
	form.serializeArray().map(function(x){data[x.name] = x.value;});
	getJson("SURVEY.SUBMIT", HandleSurveyResult, data);
}

function HandleSurveyResult(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		$.mobile.pageContainer.pagecontainer('change', 'learnearncomplete.html', { transition: 'slide', changeHash: false } );
	}
	else {
		WriteError(data.Result);
	}
}

function BuildLearnEarnQuestions(data, readOnly) {
	var listString = '';
	
	$.each(data.Questions, function (index, question) {
		listString += '<li data-psg-divider="' + data.Survey.Title + '">';
		listString += '<input type="hidden" id="question_type_QN' + question.QuestionId + '" name="question_type_QN' + question.QuestionId + '" value="' + question.QuestionType + '" />';
		
		if (!psg.isNothing(question.Header)) {
			listString += '<div class="psg-learn-earn-question-header">' + question.Header + '</div>';
		}
		
		listString += '<div class="psg-learn-earn-question"><span class="psg-learn-earn-question-number">' + question.Order + '</span><span class="psg-learn-earn-question-text">' + question.Text + '</span></div>';
		
		// 1 means multi-choice
		// 3 means stacked multi-choice
		// 4 means short answer
		listString += '<div class="psg-learn-earn-answers">';
		if (question.QuestionType == 1 || question.QuestionType == 3) { // treat 1 and 3 as stacked
			$.each(question.Answers, function (index, answer) {
				listString += '<div class="psg-learn-earn-answer-stacked">';
				if (question.Required == 1 && index == 0) {
					listString += '<input type="radio" data-rule-required="true" class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId + '" value="' + answer.AnswerId + '" ><span class="psg-learn-earn-answer-text">' + answer.Text + '</span>';
				}
				else {
					listString += '<input type="radio" class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId + '" value="' + answer.AnswerId + '" ><span class="psg-learn-earn-answer-text">' + answer.Text + '</span>';
				}
				listString += '</div>';
			});
		}
		else if (question.QuestionType == 4) {
			listString += '<input type="text"';
			if (question.Required == 1) {
				listString += ' data-rule-required="true"';
			}
			listString += ' class="psg-learn-earn-answer-textbox" name="long_answer_QN' + question.QuestionId + '"></input>';
		}
		else {
			listString += '<textarea';
			if (question.Required == 1) {
				listString += ' data-rule-required="true"';
			}
			listString += ' class="psg-learn-earn-answer-textarea" name="long_answer_QN' + question.QuestionId + '"></textarea>';
		}
		listString += '</div>';
		
		listString += '</li>';
	});
}

