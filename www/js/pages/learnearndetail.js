function page_learn_earn_detail_show(){
   getJson("SURVEY.LIST.DETAIL",HandleSurveyDetailList);    
}

function HandleSurveyAllList (data) {
   
   var listString = '';
   $.each(data, function (index, value) {
      listString += '<li data-psg-divider="' + value.SurveyTitle  + '"> \
      <div>' + the detail info about THIS learn and earn here + '</div> \
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
  




 