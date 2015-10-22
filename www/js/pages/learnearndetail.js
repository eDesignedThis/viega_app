function page_learn_earn_detail_show() {

      var surveyId = sessionStorage.getItem('psg-learnearn-id');
      //alert(surveyId);
      var data = JSON.stringify({ surveyId: surveyId });
      getJson("SURVEY.LIST.DETAIL", HandleSurveyDetailList, data);
}


function HandleSurveyDetailList(data) {
   	debugger;  
      var listString = '';
    
      listString += '<li data-psg-divider="' + data.SurveyTitle + '"> \
      <div class="ui-no-ellipse psg-learnearn-li-section"><p>'+ data.SurveyInstructions +'</p></div>\
            <div class="ui-no-ellipse ui-text-small"><strong>Type: </strong>' + data.SurveyTypeText + '</div>\
            <div class="ui-no-ellipse ui-text-small"><strong>Questions: </strong>' + data.questionCount + '</div>\
            <div class="ui-no-ellipse ui-text-small psg-learnearn-li-section"><strong>Award: </strong>' + data.SurveyAward + '</div>\
      <div class=""> <button id="" class="ui-btn ui-btn-a ui-shadow ui-corner-all" type="submit" >Start Now</button> </div> \
     </li>';

      var leanEarnInstrc = $('.psg-learnearn-txt-content');
      leanEarnInstrc.html(contentString);
      
      var ul = $('#psg-listview-learndetail');
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

};
  




 