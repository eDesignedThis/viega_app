	var index = 0;
	var questionId = 0;
	var questionType = '';
	function page_learn_earn_content_trivia_show(){
		var surveyId = sessionStorage.getItem('psg-learnearn-id'); // @@@ need from main page
		//alert(surveyId);
		var data = JSON.stringify({ surveyId: surveyId, counter: index, type: 'New', });  
		getJson("SURVEY.TRIVIA.GET",HandleSurveyTrivia,data);  	
		
		
	}	
	function HandleSurveyTrivia (data) {
		var questionId = '';
		var	questionType = '';	
		debugger;
		//Hide Buttons
		$('#cmdNext').hide();
		$('#cmdPrevious').hide();
		$('#pnlPager').hide();
		$('#lblCorrect').hide();
		$('#lblWrong').hide();
		$('#cmdSubmit').hide();		

		if (data != null) {
			index = data.Count;
			HideShowControls(data);
			if(index >= 0){
				if(data.DetailList[index].QuestionId != null){questionId = data.DetailList[index].QuestionId};
				if(data.DetailList[index].QuestionType != null){questionType = data.DetailList[index].QuestionType};
				if(data.DetailList[index].SurveyTitle != null){$('#lblSurveyTitle').text(data.DetailList[index].SurveyTitle)};
				if(data.DetailList[index].QuestionHeader != null){$('#lblQuestionHeader').text(data.DetailList[index].QuestionHeader)};
				if(data.DetailList[index].QuestionOrder != null){$('#lblSurveyNumber').text('Trivia Question #' + data.DetailList[index].QuestionOrder)};
				if(data.DetailList[index].QuestionText != null){$('#lblSurveyQuestion').text(data.DetailList[index].QuestionText)};
				if(data.Markup != null){$('#lblSurveyAnswers').html(data.Markup)};
			}
		}
	}		
	function HideShowControls(data)
	{
		
		var nextShow = false;
		var previousShow = false;
		if (data.DetailList.length == 0)
		{
			var id="divTrivia_<%=this.ClientID %>";
			$('#' + id).hide();
			return;
		}

		if (index >= 0 ) 
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
							$('#lblWrong').text('<%= WrongAnswerMessage %>');				
						}
						else
						{
							$('#lblWrong').hide();
							$('#lblCorrect').show();
							$('#lblCorrect').text('<%= CorrectAnswerMessage %>'); 
						}			
				}
			}
		}			
	}
	$('#cmdNext').click(function () {
		GetData('next');
		return false;
	});
	$('#cmdPrevious').click(function () {
		GetData('previous');
		return false;
	});
	$('#cmdSubmit').click(function () {
		
		//var questionId = $('#txtQuestionId').val();
		//var questionType = $('#txtQuestionType').val();
		var surveyId = '<%= SurveyID %>';
		var answer = $("[name=q" + questionId + "]:checked").val();
		var error = "No Data";
		if (answer==undefined){
			$('#lblError').html("Section Required");
			return false;
		}
		var surveyId = sessionStorage.getItem('psg-learnearn-id'); // @@@ need from main page
		var data = JSON.stringify({ surveyId: surveyId, counter: index, questionId: questionId,questionType: questionType,answer: answer, type: 'New' });
		getJson("SURVEY.TRIVIA.SUBMIT",HandleSurveyTrivia,data);  					
						
		if (data != null) {
			index = data.Count;
		}
    });
	function GetData(type)
	{
		var surveyId = sessionStorage.getItem('psg-learnearn-id'); // @@@ need from main page
		var data = JSON.stringify({type: type,surveyId: surveyId,counter: index}); 
		getJson("SURVEY.TRIVIA.GET",HandleSurveyTrivia,data);  		
	}


	
		// Add your JSON here 
// 		getJson("", function(data) {
// 		
// 		var listString = '';
// 		$.each(data, function (index, value) {
// 			  listString += '<li data-psg-divider="' + learn and earn title+ '"> \
// 					<div>' + trivia question Number here + '</div> \
// 					<div>\
// 						<span>' + trivia question goes here + '</span>\
// 					</div>\
// 					<div>'+ trivia button container here +'</div> \
// 					<div>'+ trivia pager container here +'</div> \
// 				</li>';
// 		});
// 
// 		var ul = $('#psg-listview-learntrivia');
// 		ul.html(listString);
// 		ul.listview({
// 			  autodividers: true,
// 			  dividerTheme: "a" ,
// 			  autodividersSelector: function (li) {
// 				  var out = li.attr("data-psg-divider");
// 				  return out;
// 			  }
// 		});
// 		
// 		ul.listview('refresh');
// 		
// 	  });
	
       
//}

 