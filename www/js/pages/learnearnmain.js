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
 		$.each(data, function (index, value) {
				
 			  listString += '<li data-psg-divider="' + value.SurveyTypeText  + '"> \
 				<a href="#" data-psg-learnearn-id="' + value.SurveyID + '" class="link-learnearn"> \
 					<div class="ui-no-ellipse"><strong> ' + value.SurveyTitle + '</strong></div> \
					<div class="ui-text-small"> \
 						<div class="ui-float-left"><strong> ' + value.SurveyCategory + '</strong>: ' + moment(value.EndDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</div> \
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
			 
 				sessionStorage.setItem('psg-learnearn-id', $(this).attr('data-psg-learnearn-id'));
				 /// check if survey/quiz or trivia and if survey/quiz is completed or available
				 var learnEarnSelected = $(this).closest('li').attr('data-psg-divider');
				 var learnEarnCatgry = $(this).find('div.ui-float-left strong').html();
	
				 if(learnEarnSelected == 'Trivia'){
					 $.mobile.changePage('learnearncontenttrivia.html');
				 } else if((learnEarnSelected == 'Quiz') || (learnEarnSelected == 'Survey')){
					 
					 if(learnEarnCatgry == 'Available'){
						 $.mobile.changePage('learnearndetail.html');
					 }else{
						 $.mobile.changePage('learnearnreview.html');
					 }
					 
				 }
 				
 			});
 	 
 	
        
 }