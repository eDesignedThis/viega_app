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
	
	EnableSurveyPaging(data);
    
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
        // With success, must update points in mobile cache.
        getJson("POINTS.SUMMARY", HandleSurveyPointsUpdate);
	}
	else {
		WriteError(data.Error);
	}
}

function HandleSurveyPointsUpdate(data) {
    if (typeof data !== null) {
        UpdatePointAccount(data);
    }
    $.mobile.pageContainer.pagecontainer('change', 'learnearncomplete.html', { transition: 'slide', changeHash: false } );
}

function BuildLearnEarnQuestions(data, reviewOnly) {
	var listString = '';
	if (psg.isNothing(reviewOnly)) reviewOnly = false;
	
	var pagingEnabled = !psg.isNothing(data.Survey.PagingEnabled) && data.Survey.PagingEnabled == "PagePerQuestion" ? true : false;
	
	$.each(data.Questions, function (index, question) {
		var displaySetting = pagingEnabled && index > 0 ? 'style="display:none;"' : '';
		listString += '<li id="psg-question-' + question.QuestionId.toString() + '" data-psg-divider="' + data.Survey.Title + '" ' + displaySetting + ' >';
		listString += '<input type="hidden" id="question_type_QN' + question.QuestionId.toString() + '" name="question_type_QN' + question.QuestionId.toString() + '" value="' + question.QuestionType.toString() + '" />';
		
		if (!psg.isNothing(question.Header)) {
			listString += '<div class="ui-no-ellipse psg-learn-earn-question-header">' + question.Header + '</div>';
		}
		
		listString += '<div class="psg-learn-earn-question"><span class="psg-learn-earn-question-number">' + question.Order.toString() + '</span><span class="psg-learn-earn-question-text ui-no-ellipse">' + question.Text + '</span></div>';
		
		// 1 means multi-choice
		// 3 means stacked multi-choice
		// 4 means short answer
		listString += '<div class="psg-learn-earn-answers ui-no-ellipse">';
		if (question.QuestionType == 1 || question.QuestionType == 3) { // treat 1 and 3 as stacked
			var disabledText = reviewOnly ? ' disabled ' : '';
			var checkedText = '';
			var correctMessage = '';
			listString += '<fieldset data-role="controlgroup">';
			$.each(question.Answers, function (index, answer) {
				checkedText = reviewOnly && answer.AnswerId == question.ParticipantAnswerId ? ' checked ' : '';
				correctMessage = reviewOnly && answer.IsCorrectAnswerReview === true ? '<span class="psg-learn-earn-correct-answer-message">Correct Answer</span>' : '';
				//listString += '<div class="psg-learn-earn-answer-stacked">';
				if (question.Required == 1 && index == 0) {
					listString += '<label><input type="radio"' + disabledText + checkedText + 'data-rule-required="true" class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId.toString() + '" value="' + answer.AnswerId.toString() + '" ><span class="psg-learn-earn-answer-text">' + correctMessage + answer.Text + '</span></label>';
				}
				else {
					listString += '<label><input type="radio"' + disabledText + checkedText + 'class="psg-learn-earn-answer-radio" name="answer_id_QN' + question.QuestionId.toString() + '" value="' + answer.AnswerId.toString() + '" ><span class="psg-learn-earn-answer-text">' + correctMessage + answer.Text + '</span></label>';
				}
				//listString += '</div>';
			});
			listString += '</fieldset>';
		}
		else if (question.QuestionType == 4) {
			if (reviewOnly) {
				listString += '<div class="ui-no-ellipse" class="psg-learn-earn-answer-textbox">' + question.ParticipantLongAnswer + '</div>';
			}
			else {
				listString += '<input type="text"';
				if (question.Required == 1) {
					listString += ' data-rule-required="true"';
				}
				listString += ' class="psg-learn-earn-answer-textbox" name="long_answer_QN' + question.QuestionId.toString() + '"></input>';
			}
		}
		else {
			if (reviewOnly) {
				listString += '<div class="ui-no-ellipse" class="psg-learn-earn-answer-textbox">' + question.ParticipantLongAnswer + '</div>';
			}
			else {
				listString += '<textarea';
				if (question.Required == 1) {
					listString += ' data-rule-required="true"';
				}
				listString += ' class="psg-learn-earn-answer-textarea" name="long_answer_QN' + question.QuestionId.toString() + '"></textarea>';
			}
		}
		listString += '</div>';
		
		listString += '</li>';
	});
	
	return listString;
}

function EnableSurveyPaging(data) {
	if (psg.isNothing(data)) return;
	if (psg.isNothing(data.Survey)) return;
	if (psg.isNothing(data.Survey.PagingEnabled)) return;
	
	switch (data.Survey.PagingEnabled) {
		case "PagePerQuestion":
			SetupSurveyPagePerQuestion(data);
			break;
		
		//
		// future paging options go here.
		//
	}
}

function SetupSurveyPagePerQuestion(data) {
	var pagingHtml = '<div class="psg_survey_progress_bar" style="margin-left:auto; margin-right:auto;"></div>';
	pagingHtml += '<button class="ui-btn ui-btn-a ui-shadow ui-corner-all psg_survey_paging_previous psg-survey-paging-button" type="button" style="display:none;" psg_paging_value="-1" >Previous</button>';
	pagingHtml += '<button class="ui-btn ui-btn-a ui-shadow ui-corner-all psg_survey_paging_next psg-survey-paging-button" type="button" psg_paging_value="+1" >Next</button>';
	
	var submitButton = $('#learnearn_submit');
	submitButton.before(pagingHtml);
	submitButton.hide();
	
	var progressIncrement = 100 / data.Questions.length;
	$('.psg_survey_progress_bar').jqxProgressBar({ width: "80%", height: 20, showText: true, value: Math.floor(progressIncrement) });
	
	var currentPage = 1;
	$('.psg-survey-paging-button').on('click', function () {
		var pagingValue = $(this).attr('psg_paging_value');
		switch (pagingValue) {
			case "-1":
				currentPage--;
				break;
				
			case "+1":
				currentPage++;
				break;
		}

		if (currentPage <= 1) {
			currentPage = 1;
			$('.psg_survey_paging_previous').hide();
		}
		if (currentPage >= data.Questions.length) {
			currentPage = data.Questions.length;
			$('.psg_survey_paging_next').hide();
			$('#learnearn_submit').show();
		}
		if (currentPage > 1) {
			$('.psg_survey_paging_previous').show();
		}
		if (currentPage < data.Questions.length) {
			$('.psg_survey_paging_next').show();
			$('#learnearn_submit').hide();
		}
		
		$.each(data.Questions, function (index, question) {
			var page = index + 1;
			if (page == currentPage) {
				$('#psg-question-' + question.QuestionId.toString()).show();
			}
			else {
				$('#psg-question-' + question.QuestionId.toString()).hide();
			}
		});
		
		$('.psg_survey_progress_bar').jqxProgressBar({ width: "80%", height: 20, showText: true, value: Math.floor(progressIncrement * currentPage) });
	});
}


