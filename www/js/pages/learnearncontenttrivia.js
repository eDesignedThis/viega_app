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

		if (data.Error != '')
		{
			$('#lblError').html(data.Error);
			return false;		
		}		
		
		if (data != null) {
			index = data.Count;
			
			if(index >= 0){
				
				var listString = '';
				
				listString += '<li data-psg-divider="' + data.DetailList.SurveyTitle + '">\
								<div class="ui-no-ellipse">'; // Open the div for trivia question number, question, and submit
								
				if(data.DetailList.QuestionHeader != null){
					listString += '<p class="trivia_header psg-lrnErn-txt" id="lblQuestionHeader">' + data.DetailList.QuestionHeader + '</p>';
					}		
					
				if(data.DetailList.QuestionOrder != null){
					listString += '<p class="trivia_question_number psg-lrnErn-txt" id="lblSurveyNumber">Trivia Question #' + data.DetailList.QuestionOrder + '</p>';
					}				
				
				if(data.DetailList.QuestionText != null){
					listString += '<div class="trivia_question ui-no-ellipse">\
										<p class="psg-lrnErn-txt" id="lblSurveyQuestion">' + data.DetailList.QuestionText + '</p>\
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
								</div>';
								
				listString += '<div id="trivia_cb_message" class="">\
									<p class="psg-lrnErn-txt">Come back tomorrow for another daily trivia question.</p>\
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
			

				if(data.DetailList.QuestionId != null){questionId = data.DetailList.QuestionId};
				if(data.DetailList.QuestionType != null){questionType = data.DetailList.QuestionType};
				// Refresh Points
				getJson("POINTS.SUMMARY", HandleGetTriviaRefreshPoints);

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
				$('#lblError').html("Selection Required");
				return false;
			}
			//surveyId: surveyId, counter: index, type: 'New',
			var data = JSON.stringify({ surveyId: surveyId, counter: index, questionId: questionId,questionType: questionType,answer: answer, type: 'New' });
			getJson("SURVEY.TRIVIA.SUBMIT",HandleSurveyTrivia,data);  

		});
		ClearFields();
		HideShowControls(data);
		
	}	
	function HandleGetTriviaRefreshPoints(data) {
		if (typeof data !== null) {
					UpdatePointAccount(data); 
		}
	}	
		
	function HideShowControls(data)
	{
		
		var nextShow = false;
		var previousShow = false;
		var submitShow = false;

		if (index > 0 ) 
		{
			if( data.DetailList.HistoryId > 0)
			{
				$('#cmdNext').show();
				nextShow = true;
			}
		}
		if (index >= 0 && index < data.TotalCount - 1)
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
			if( data.DetailList.HistoryId == 0)
			{
				$('#cmdSubmit').show();
				submitShow = true;
			}
		}
		else
		{
			$('#cmdSubmit').hide();
			submitShow = false;
		}
		
		if (submitShow == false && index < 1)
		{			
			$('#trivia_cb_message').show();					
		}
		
		if (index >= 0 ) 
		{
			if( data.DetailList.HistoryId > 0)
			{							
				for(var i=0;i < data.DetailList.Answers.length;i++)
				{
					if (data.DetailList.Answers[i].AnswerId == data.DetailList.Answers[i].AnswerIDRecorded
						&& data.DetailList.Answers[i].IsCorrectAnswer != 1)
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
			if (data.DetailList.QuestionId == data.DetailList.LastQuestionId) {
				$('#lblError').append('You have reached the last question.');
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
		$('#trivia_cb_message').hide();
		$('#cmdSubmit').hide();				
	}	


