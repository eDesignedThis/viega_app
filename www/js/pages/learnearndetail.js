function page_learn_earn_detail_show(){
		
	// Add your JSON here 
	getJson("", function(data) {
		
		var listString = '';
		$.each(data, function (index, value) {
			  listString += '<li data-psg-divider="' + learn and earn title+ '"> \
					<div>' + the detail info about THIS learn and earn here + '</div> \
					<div>\
						<span>' + learn and earn Type here + '</span>\
						<span>' + Number OF Questions Here + '</span>\
						<span>' + Learn and Earn ward ammount here + '</span>\
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
	
       

	
       
}

 