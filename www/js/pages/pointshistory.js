function page_points_history_show(){	
	
	if (psg.payoutType != 1) {
	var awarded = (psg.getSessionItem('awarded') == null) ? 'Unknown' : psg.getSessionItem('awarded');
	var redeemed = (psg.getSessionItem('redeemed') == null) ? 'Unknown' : psg.getSessionItem('redeemed');
    var balance = (psg.getSessionItem('balance') == null) ? 'Unknown' : psg.getSessionItem('balance');	
	$('#ph_awarded').text(awarded);
	$('#ph_redeemed').text(redeemed);
	$('#ph_remaining').text(balance);
	} else {
		$("#pointhistory_summary").hide()
	}
	
	var menuString = psg.historyMenu;
	var menu = $('#points_history_menu_ul');
	menu.html(menuString);
	menu.listview('refresh');
	
}
