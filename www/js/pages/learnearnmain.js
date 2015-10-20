function page_learn_earn_main_show(){
	// Add your JSON here
	getJson("SURVEY.LIST.GET",HandleSurveyAvailableList);
}

function HandleSurveyAvailableList (data) {	
 		/// Message on the learn and Earn main page
 		var contentString = $('#psg-content-learnearn');
 		contentString.html('test');
 		
 		var listString = '';
 		$.each(data, function (index, value) {
				
 			  listString += '<li data-psg-divider="' + value.SurveyTypeID  + '"> \
 				<a href="#" data-psg-learnearn-id="' + SurveyID + '" class="link-order"> \
 					<div class="ui-no-ellipse ui-text-small"><strong>Order ' + SurveyTitle + '</strong></div> \
 					<div class="ui-text-small"> \
 					<div class="ui-float-left">' + moment(value.EndDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</div> \
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
 		$('.link-order').on("click", function () {
 				sessionStorage.setItem('psg-learnearn-id', $(this).attr('data-psg-order-id'));
 				$.mobile.changePage( 'learnearndetail.html');
 			});
 	  });
 	
        
 }

 //// Add any additional functions here