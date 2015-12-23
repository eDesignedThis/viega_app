function page_order_detail_show(){
					var oId = sessionStorage.getItem('psg-order-id');
					var data = JSON.stringify({ orderId: oId });
					getJson("ORDER.ORDERDETAIL", HandleGetOrderDetail,data);
}
function HandleGetOrderDetail(data) {
	if (data.Result == null || data.Result == "success") {
		//Basic Info
		if (data.Order != null) {
			$('#psg-order-detail-order-number').text('Order ' + data.Order.OrderNumber);
			$('#psg-order-detail-order-date').text('Date Ordered ' + data.Order.DateOrdered);
		}
		//Address Info
		if (data.Address != null) {
			var addressString = '<strong>' + data.Order.ShipToName + '</strong><br/> ' +
				psg.StringUtil.Concatenate('<br/>',
					data.Address.StreetAddress1,
					data.Address.StreetAddress2,
					psg.StringUtil.Concatenate(' ',
						psg.StringUtil.Concatenate(', ', data.Address.CityName, data.Address.StateCode),
						data.Address.PostalCode));
			$('#order_detail_shipping').html(addressString);
		}
		//Line Items
		var shippedString = '';
		var shippedCount = 0;
		var notShippedString = '';
		var notShippedCount = 0;
		var transactionCount = 0;
		
		var shipments = new Object();

		$.each(data.Order.OrderLineItemsMobile, function (index, value) {
			var shipmentId = value.Shipment.ShipmentID;
			var lineItemSeq = value.LineItemSequence;
			var shipmentIdInfo = '';
			if (value.LineItemStatusId == 9) {
				return;  //continue
			}

			if (shipments[shipmentId] == null) {
				var shipped = false; 
				if (IsMinDate(value.Shipment.ShipmentDate)) {
					var estimatedShipDate = (IsMinDate(value.Shipment.EstimatedShipDate)) ? 'None' : moment(value.Shipment.EstimatedShipDate,'YYYY-MM-DD').format('MM-DD-YYYY');
					shipmentIdInfo += '<li data-role="list-divider">Estimated Ship Date: ' + estimatedShipDate + '</li>';
				} else {
                    
                    if(value.Shipment.ShipmentDate =='0001-01-01T00:00:00'){
                        shipmentIdInfo += '<li data-role="list-divider">Shipped: -- </li>';
                    }else{
                        shipmentIdInfo += '<li data-role="list-divider">Shipped: ' + moment(value.Shipment.ShipmentDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</li>';
                    }
                    
					if (!psg.isNothing(value.Shipment.CarrierName)) {
						shipmentIdInfo += '<li class="ui-text-small"><p>Shipped Via: ' + value.Shipment.CarrierName;
						if (!psg.isNothing(value.Shipment.TrackingNumber)) {
							shipmentIdInfo += ' Tracking : ' + value.Shipment.TrackingNumber;
						}
						if (!psg.isNothing(value.Shipment.TrackingURL) && value.Shipment.TrackingURL.indexOf('http') > -1) {
							shipmentIdInfo += ' <a class="ui-tracking-number" target="_blank" rel="external" title="Click to open shipment tracking" href="' + value.Shipment.TrackingURL + '">Track Package</a>';
						}
						shipmentIdInfo += '</p></li>'
					}
					shipped = true;
				}

				var newShipmentObject = new Object();
				var newRowsObject = new Object();
				newShipmentObject.ShipmentInfo = shipmentIdInfo;
				newShipmentObject.Shipped = shipped;
				newShipmentObject.Rows = newRowsObject;
				shipments[shipmentId] = newShipmentObject;
			}
			shipments[shipmentId].Rows[lineItemSeq] = GetTableRow(value);
			if (shipments[shipmentId].Shipped) {
				shippedCount++;
			}
			else {
				notShippedCount++;
			}
		});

		$.each(shipments, function (index, value) {
			if (value.Shipped) {
				shippedString += value.ShipmentInfo + '<li class="ui-text-small">' + GetTable(value.Rows, index) + '</li>';
			} else {
				notShippedString += value.ShipmentInfo + '<li class="ui-text-small">' + GetTable(value.Rows, index) + '</li>';
			}
		});

		if (psg.isNothing(data.Transactions) || data.Transactions.length < 2) {
			$('#order_detail_trans_container').hide();
		} else {
		    $('#order_detail_transaction_count').text(data.Transactions.length);
			var transTable = '<table class="ui-text-small ui-responsive ui-table ui-table-columntoggle" data-role="table" data-mode="columntoggle"><thead><tr><th>Date</th> \
							  <th>Description</th><th>Amount</th></tr></thead><tbody>';
			$.each(data.Transactions, function (index, value) {
				transTable += '<tr> \
						<td width="30%" class="ui-text-right">' + moment(value.TransactionDate,'YYYY-MM-DD').format('MM-DD-YYYY') + '</td> \
						<td style="white-space:normal;">' + value.TransactionDescription + '</td> \
						<td class="ui-text-right ptsRght">' + addCommas(value.RedeemedPoints) + '</td> \
					</tr>';
			});
			transTable += '</tbody></table>';
			$('#order_detail_trans').html(transTable);
		}


		if (shippedString == '') shippedString = '<li>No Items Shipped</li>';
		if (notShippedString == '') notShippedString = '<li>All Items Shipped</li>';
		var shippedUL = $('#psg-listview-orderitems-shipped');
		//appending to the div
		shippedUL.html(shippedString);
		$('#order_detail_shipped_count').text(shippedCount);
		// refreshing the list to apply styles
		shippedUL.listview('refresh');
		
		var notShippedUL = $('#psg-listview-orderitems-not-shipped');
		//appending to the div
		notShippedUL.html(notShippedString);
		$('#order_detail_not_shipped_count').text(notShippedCount);
		// refreshing the list to apply styles
		notShippedUL.listview('refresh');
		//$('[data-role="table"]').table().table('refresh');
		//$('#page_order_detail').trigger('create');
		
		if (shippedCount == 0) {
		    $('#order_detail_item_shipped_col').hide();
		}
		else if (shippedCount > 0 && notShippedCount == 0) {
			$('#order_detail_item_shipped_col').collapsible('expand');
		}
		
		if (notShippedCount == 0) {
			$('#order_detail_item_not_shipped_col').hide();
		} else if (notShippedCount > 0 && shippedCount == 0) {
			$('#order_detail_item_not_shipped_col').collapsible('expand');
		}
		
		if (app.isPhoneGap) {
				$('#psg-listview-orderitems-shipped').on('click', 'a', function(e) {
					e.preventDefault();
					window.open($(this).attr('href'), '_system');
				});
		}
		
	} else {
		WriteError(data.Result);
	}
}


function GetTableRow(lineItem) {
	var rowString = '<tr> \
						<td class="ui-text-right">' + lineItem.Quantity + '</td> \
						<td style="white-space:normal;">' + lineItem.ItemDescription + '</td> \
						<td class="ui-text-right ptsRght">' + addCommas(lineItem.ExtendedPoints) + '</td> \
					</tr>';
	return rowString;

}

function GetTable(tablerows, index) {
	var tableString = '<table id="table_' + index + '" class="ui-responsive ui-table ui-table-columntoggle" data-role="table" data-mode="columntoggle" > \
				<thead><tr> \
					<th>Qty</th> \
					<th>Item</th> \
					<th>Total</th> \
				</tr></thead> \
				<tbody>';
	$.each(tablerows, function (index, value) {
		tableString += value;
	});
	tableString += '</tbody> \
			</table>';

	return tableString;
}