function page_card_awards_show(){
	getJson("PARTICIPANT.GETCARDAWARDS",HandleGetCardAwards);
}

function HandleGetCardAwards (data) {
	var listString = '';
	// running a loop
	$.each(data, function (index, value) {
		listString += '<li data-psg-divider="' + moment(value.TransactionDate,'YYYY-MM-DD').format('MMMM YYYY') + '">'+
			'<div class="ui-no-ellipse ui-text-small"><strong>' + value.TransactionDescription + '</strong></div>' +
			'<div class="ui-grid-b"> ' +
				'<div class="ui-block-a ui-text-small">' + moment(value.TransactionDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</div>' +
				'<div class="ui-block-b ui-text-small ui-text-right">' + accounting.formatMoney(value.Amount) + '</div> '+
				'<div class="ui-block-c ui-text-small ui-text-right">' + moment(value.TransactionDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</div> '+
			'</div>' +
					'</li>';
	});

	var ul = $('#psg-listview-cardawards');
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