function page_points_awarded_show(){
	getJson("PARTICIPANT.GETAWARDPOINTS",HandleGetPointsAwarded);
}

function HandleGetPointsAwarded (data) {
	var listString = '';
	// running a loop
	$.each(data, function (index, value) {
		listString += '<li data-psg-divider="' + moment(value.TransactionDate,'YYY-MM-DD').format('MMMM YYYY') + '">'+
			'<div class="ui-no-ellipse ui-text-small"><strong>' + value.TransactionDescription + '</strong></div>' +
			'<div class="ui-grid-a"> ' +
				'<div class="ui-block-a ui-text-small">' + moment(value.TransactionDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</div>' +
				'<div class="ui-block-b ui-text-small ui-text-right">' + addCommas(value.Amount) + '</div> '+
			'</div>' +
					'</li>';
	});

	var ul = $('#psg-listview-pointsawarded');
	//appending to the div
	ul.html(listString);
	// refreshing the list to apply styles
	ul.listview({
		autodividers: true,
		dividerTheme: "a" ,
		autodividersSelector: function (li) {
			var out = li.attr("data-psg-divider");
			return out;
		}
	});
	ul.listview('refresh');
}