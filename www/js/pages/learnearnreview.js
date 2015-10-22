
function page_learn_earn_review_show(){
	//alert('test');
      // var surveyId = sessionStorage.getItem('psg-learnearn-id');
      // var data = JSON.stringify({ surveyId: surveyId });
      // getJson("SURVEY.LIST.DETAIL", HandleSurveyDetailList, data);
}


// function HandleSurveyDetailList(data) {
//      
//       var listString = '';
//     
//       listString += '<li data-psg-divider="' + data.SurveyTitle + '"> \
//       <div class="ui-no-ellipse psg-learnearn-li-section"><p>'+ data.CompletedMessage +'</p></div>\
//             <div class="ui-no-ellipse ui-text-small"><strong>Results: </strong>' + data.Score + '</div>\
//             <div class="ui-no-ellipse ui-text-small"><strong>Completed: </strong>' + data.dateCompleted + '</div>\
//       <div class=""> <button id="backLrnErn" class="ui-btn ui-btn-a ui-shadow ui-corner-all">Back to Learn & Earn</button> </div> \
//      </li>';
// 
//       var leanEarnInstrc = $('.psg-learnearn-txt-content');
//       leanEarnInstrc.html(contentString);
//       
//       var ul = $('#psg-listview-learndetail');
//       ul.html(listString);
//       ul.listview({
//             autodividers: true,
//             dividerTheme: "a",
//             autodividersSelector: function (li) {
//                   var out = li.attr("data-psg-divider");
//                   return out;
//             }
//       });
// 
//       ul.listview('refresh');
//       
//       $('#backLrnErn').on("click", function() {
//             $.mobile.changePage('learnearnmain.html'); 
//       });
//       
//   
// }
