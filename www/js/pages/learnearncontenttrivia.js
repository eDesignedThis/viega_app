	var index = 0;
	var questionId = 0;
	var questionType = '';
	var surveyId = 0;
	function page_learn_earn_content_trivia_show(){
		surveyId = sessionStorage.getItem('psg-learnearn-id'); 
		var data = JSON.stringify({ surveyId: surveyId, counter: index, type: 'New', });  
		getJson("SURVEY.TRIVIA.GET",HandleSurveyTrivia,data); 
		return false;
		
	}	
	
	
	function HandleSurveyTrivia (data) {
		var questionId = '';
		var	questionType = '';	

		if (data != null) {
			index = data.Count;
			
			if(index >= 0){
				
				var listString = '';
				
				listString += '<li data-psg-divider="' + data.DetailList[index].SurveyTitle + '">\
								<div class="ui-no-ellipse">'; // Open the div for trivia question number, question, and submit
								
				if(data.DetailList[index].QuestionHeader != null){
					listString += '<p class="trivia_header psg-lrnErn-txt" id="lblQuestionHeader">' + data.DetailList[index].QuestionHeader + '</p>';
					}		
					
				if(data.DetailList[index].QuestionOrder != null){
					listString += '<p class="trivia_question_number psg-lrnErn-txt" id="lblSurveyNumber">Trivia Question #' + data.DetailList[index].QuestionOrder + '</p>';
					}				
				
				if(data.DetailList[index].QuestionText != null){
					listString += '<div class="trivia_question ui-no-ellipse">\
										<p class="psg-lrnErn-txt" id="lblSurveyQuestion">' + data.DetailList[index].QuestionText + '</p>\
									</div>'; 
				}
					listString += '<p class="error psg-lrnErn-txt" id="lblError"></p>';
					
				if(data.Markup != null){
					listString += '<div class="trivia_answer_container ui-no-ellipse">\
										<p id="lblSurveyAnswers">' + data.Markup + '</p>\
									</div>'; 
				}	
				
				listString += '<div class="trivia_button_container ui-no-ellipse ui-grid-a">\
									<div class="ui-block-a"><div class="ui-center"><p id="lblCorrect" class="trivia_correct_text"></p><p id="lblWrong" class="trivia_wrong_text"></p></div></div>\
									<div class="ui-block-b"><div class="ui-center"><button data-mini="true" id="cmdSubmit" class="trivia_submit_button ui-btn ui-btn-a ui-shadow ui-corner-all" value="Submit" type="submit" >Submit</button></div></div>\
								</div>\
							</li></div>'; // Close the div for trivia question number, question, and submit			
				
				////// Pager section
				
				listString += '<li>\
									<div id="pnlPager">\
										<div class="trivia_pager_container ui-grid-a">\
											<div class="ui-block-a"><div class="ui-center"><a  href="#" id="cmdPrevious" class="trivia_pager_page_link trivia_pager_previous_page_link linkBtn ui-btn ui-btn-a ui-shadow ui-corner-all ui-mini">Prev</a></div></div>\
											<div class="ui-block-b"><div class="ui-center"><a href="#" id="cmdNext" class="trivia_pager_page_link trivia_pager_next_page_link linkBtn ui-btn ui-btn-a ui-shadow ui-corner-all ui-mini">Next</a></div></div>\
										</div>\
									</div>\
								</li>';
			
				// if(data.DetailList[index].QuestionId != null){questionId = data.DetailList[index].QuestionId};
				// if(data.DetailList[index].QuestionType != null){questionType = data.DetailList[index].QuestionType};
				// if(data.DetailList[index].SurveyTitle != null){$('#lblSurveyTitle').text(data.DetailList[index].SurveyTitle)};
				// if(data.DetailList[index].QuestionHeader != null){$('#lblQuestionHeader').text(data.DetailList[index].QuestionHeader)};
				// if(data.DetailList[index].QuestionOrder != null){$('#lblSurveyNumber').text('Trivia Question #' + data.DetailList[index].QuestionOrder)};
				// if(data.DetailList[index].QuestionText != null){$('#lblSurveyQuestion').text(data.DetailList[index].QuestionText)};
				// if(data.Markup != null){$('#lblSurveyAnswers').html(data.Markup)};
				
			}
			else
			{
				index = 0;
				$('#pnlPager').show();
				$('#cmdPrevious').show();								
			}			
		}
		
		var ul = $('#psg-listview-learntrivia');
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
		
		$('#cmdNext').click(function () {
			GetData('next');
		});
		$('#cmdPrevious').click(function() {
			GetData('previous');
			
		});
		
		$('#cmdSubmit').click(function () {
			var answer = $("[name=q" + questionId + "]:checked").val();
			var error = "No Data";
			if (answer==undefined){
				$('#lblError').html("Section Required");
				return false;
			}
			
			var data = JSON.stringify({ surveyId: surveyId, counter: index, questionId: questionId,questionType: questionType,answer: answer, type: 'New' });
			getJson("SURVEY.TRIVIA.SUBMIT",HandleSurveyTrivia,data);  					
							
			if (data != null) {
				index = data.Count;
			}
		});
		
		ClearFields();
		HideShowControls(data);
		
	}	
	
	
		
	function HideShowControls(data)
	{
		
		var nextShow = false;
		var previousShow = false;
		if (data.DetailList.length == 0)
		{
			var id="divTrivia";
			$('#' + id).hide();
			return;
		}

		if (index > 0 ) 
		{
			if( data.DetailList[index].HistoryId > 0)
			{
				$('#cmdNext').show();
				nextShow = true;
			}
		}
		if (index >= 0 && index < data.DetailList.length - 1)
		{
			$('#cmdPrevious').show();
			previousShow = true;
		}
		if (nextShow || previousShow)
		{			
			$('#pnlPager').show();					
		}	

		if (index >= 0 ) 
		{
			if( data.DetailList[index].HistoryId == 0)
			{
				$('#cmdSubmit').show();
			}
		}
		else
		{
			$('#cmdSubmit').hide();
		}
		if (index >= 0 ) 
		{
			if( data.DetailList[index].HistoryId > 0)
			{							
				for(var i=0;i < data.DetailList[index].Answers.length;i++)
				{
					if (data.DetailList[index].Answers[i].AnswerId == data.DetailList[index].Answers[i].AnswerIDRecorded
						&& data.DetailList[index].Answers[i].IsCorrectAnswer != 1)
						{
							$('#lblCorrect').hide();
							$('#lblWrong').show();
							$('#lblWrong').text('Incorrect');
							break;				
						}
						else
						{
							$('#lblWrong').hide();
							$('#lblCorrect').show();
							$('#lblCorrect').text('Correct'); 
						}			
				}
			}
		}			
	}
	function GetData(type)
	{
		var data = JSON.stringify({type: type,surveyId: surveyId,counter: index}); 
		getJson("SURVEY.TRIVIA.GET",HandleSurveyTrivia,data);  		
	}
	function ClearFields()
	{
		$('#lblError').html('');
		$('#cmdNext').hide();
		$('#cmdPrevious').hide();
		$('#pnlPager').hide();
		$('#lblCorrect').hide();
		$('#lblWrong').hide();
		$('#cmdSubmit').hide();				
	}	


