function page_learn_earn_detail_show(){

   getJson("SURVEY.LIST.DETAIL",HandleSurveyDetailList);    

	var learnEarnId = sessionStorage.getItem('psg-learnearn-id');
	
	getJson("", Handle,data);
	
	
}


function HandleSurveyAllList (data) {
   
   var listString = '';
   $.each(data, function (index, value) {
      listString += '<li data-psg-divider="' + value.SurveyTitle  + '"> \
      <div>' + value.SurveyInstructions + '</div> \
      <div>\
       <span>' + value.SurveyTypeText + '</span>\
       <span>' + value.NumberOfQuestions + '</span>\
       <span>' + value.SurveyAward + '</span>\
      </div>\
      <div> <a href="" data-role="button" >Start Now</a> </div> \
     </li>';
   });
 
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
   
    });
  




 