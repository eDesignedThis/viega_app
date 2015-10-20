function page_learn_earn_detail_show(){
	var surveyId = sessionStorage.getItem('psg-learnearn-id');
	alert(surveyId);
	var data = JSON.stringify({surveyId: surveyId}); 
	getJson("SURVEY.LIST.DETAIL",HandleSurveyDetailList,data);  
}


function HandleSurveyDetailList (data) {
   
   var listString = '';
   
      listString += '<li data-psg-divider="' + data.SurveyTitle  + '"> \
      <div>' + data.SurveyInstructions + '</div> \
      <div>\
       <span>' + data.SurveyTypeText + '</span>\
       <span>' + data.questionCount + '</span>\
       <span>' + data.SurveyAward + '</span>\
      </div>\
      <div> <a href="" data-role="button" >Start Now</a> </div> \
     </li>';

 
   var ul = $('#psg-listview-learndetail');
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
   
};
  




 