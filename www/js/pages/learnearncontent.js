function page_learn_earn_content_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	var data = JSON.stringify({ surveyId: surveyId });
	getJson("SURVEY.START", HandleSurveyContent, data);
}

function HandleSurveyContent(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		DrawSurveyContent(data);
	}
	else {
		WriteError(data.Error);
	}
}

function DrawSurveyContent(data) {
	var surveyForm = BuildLearnEarnQuestions(data, false);
	
	var ul = $('#psg-listview-learncontent');
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
    
	$('#learnearn_submit').prop('disabled', false);

	$('#frmLearnEarn').validate({ submitHandler: SubmitSurvey });
}

function SubmitSurvey(){
	$('#learnearn_submit').prop('disabled', true);
	
	var data = {};
	var form = $('#frmLearnEarn');
	form.serializeArray().map(function(x){data[x.name] = x.value;});

	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	data["surveyId"] = surveyId;

	getJson("SURVEY.SUBMIT", HandleSurveyResult, data);
}

function HandleSurveyResult(data) {
	if (psg.isNothing(data)) return;
	if (data.Result == "success") {
		$.mobile.pageContainer.pagecontainer('change', 'learnearnreview.html', { transition: 'slide', changeHash: false } );
	}
	else {
		WriteError(data.Error);
	}
}

function BuildLearnEarnQuestions(data, readOnly) {
	var listString = '';
	
	$.each(data.Questions, function (index, question) {
		listString += '<li data-psg-divider="' + data.Survey.Title + '">';
		listString += '<input type="hidden" id="question_type_QN' + question.QuestionId + '" name="question_type_QN' + question.QuestionId + '" value="' + question.QuestionType + '" />';
		
		if (!psg.isNothing(question.Header)) {
			listString += '<div class="ui-no-ellipse psg-learn-earn-question-header">' + question.Header + '</div>';
		}
		
		listString += '<div class="psg-learn-earn-question"><span class="psg-learn-earn-question-number">' + question.Order + '</span><span class="psg-learn-earn-question-text ui-no-ellipse">' + question.Text + '</span></div>';
		
		// 1 means multi-choice
		// 3 means stacked multi-choice
		// 4 means short answer
		listString += '<div class="psg-learn-earn-answers ui-no-ellipse">';
		if (question.QuestionType == 1 || question.QuestionType == 3) { // treat 1 and 3 as stacked
				listString += '<fieldset data-role="controlgroup">';
			$.each(question.Answers, function (index, answer) {
				//listString += '<div class="psg-learn-earn-answer-stacked">';
				if (question.Required == 1 && index == 0) {
					listString += '<label><input type="radio" data-rule-required="true" class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId + '" value="' + answer.AnswerId + '" ><span class="psg-learn-earn-answer-text">' + answer.Text + '</span></label>';
				}
				else {
					listString += '<label><input type="radio" class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId + '" value="' + answer.AnswerId + '" ><span class="psg-learn-earn-answer-text">' + answer.Text + '</span></label>';
				}
				//listString += '</div>';
			});
			listString += '</fieldset>';
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
	
	return listString;
}

