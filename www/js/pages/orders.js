function page_orders_show() {
			 
	  getJson("ORDER.ORDERS", function(data) {

		var listString = '';
		$.each(data, function (index, value) {
			  listString += '<li data-psg-divider="' + moment(value.DateOrdered,'MM-DD-YYYY').format('MMMM YYYY') + '"> \
				<a href="#" data-psg-order-id="' + value.OrderID + '" class="link-order"> \
					<div class="ui-no-ellipse ui-text-small"><strong>Order ' + value.OrderNumber + '</strong></div> \
					<div class="ui-text-small"> \
					<div class="ui-float-left">' + value.DateOrdered + '</div> \
					<div class="ui-float-right">' + value.TotalPointsFormatted + ' points</div> \
				</div> \
				</a> \
				</li>';
		});

		var ul = $('#psg-listview-orders');
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
				sessionStorage.setItem('psg-order-id', $(this).attr('data-psg-order-id'));
				$.mobile.changePage( 'orderdetail.html');
			});
	  });
}