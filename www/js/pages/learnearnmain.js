 function page_learn_earn_main_show(){
	// Add your JSON here
	getJson("SURVEY.LIST.GET",HandleSurveyAllList);
}


function HandleSurveyAllList (data) {	
	
 		/// Message on the learn and Earn main page
		//var contentString = '';
		//contentString += '<p>' + data.SurveyInstructions + '</p>';
		//var learnEarnWelcome = $('.psg-learnearn-txt-content');
      	//learnEarnWelcome.html(contentString);
		 
 		var listString = '';
 		var endDate = '';

		$.each(data, function (index, value) {
			debugger;
			if (value.SurveyCategory=='Available Until:')
			{
				endDate = moment(value.EndDate,'YYYY-MM-DD').format('MM-DD-YYYY')
			}
			else
			{
				endDate = '';	
			}	
 			  listString += '<li data-psg-divider="' + value.SurveyTypeText  + '"> \
 				<a href="#" data-psg-learnearn-id="' + value.SurveyID + '" class="link-learnearn"> \
 					<div class="ui-no-ellipse"><strong>' + value.SurveyTitle + '</strong></div> \
					<div class="ui-text-small"> \
 						<div class="ui-float-left"><strong>' + value.SurveyCategory + '</strong>' + endDate + '</div> \
 					</div> \
 				</a> \
 				</li>';
 		});
 
 		var ul = $('#psg-listview-learnearn');
 		ul.html(listString);
 		ul.listview({
 			  autodividers: true,
 			  dividerTheme: "a" ,
 			  autodividersSelector: function (li) {
 				  var out = li.attr("data-psg-divider");
 				  return out;
 			  }
 		});
 		ul.listview('refresh');
		 
 		$('.link-learnearn').on("click", function() {
			debugger;
 				sessionStorage.setItem('psg-learnearn-id', $(this).attr('data-psg-learnearn-id'));
				 /// check if survey/quiz or trivia and if survey/quiz is completed or available
				 var learnEarnSelected = $(this).closest('li').attr('data-psg-divider');
				 var learnEarnCatgry = $(this).find('div.ui-float-left strong').html();
				 
				 console.log(learnEarnSelected);
				  console.log(learnEarnCatgry);
				 
	
				 if(learnEarnSelected == 'Trivia'){
					 $.mobile.changePage('learnearncontenttrivia.html');
				 } else{
					 console.log("This is not Trivia");
					 if(learnEarnCatgry == 'Completed'){
						 console.log("Check the category again here: " + learnEarnCatgry);
						 console.log("The staus is available");
						 $.mobile.changePage('learnearnreview.html');
					 }else {
						 console.log("Check the category again here: " + learnEarnCatgry);
						console.log("The staus is available");
						$.mobile.changePage('learnearndetail.html');
						 
					 }
					 
				 }
 				
 			});
 	 
 	
        
 }