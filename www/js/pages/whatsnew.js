function page_whatsnew_show (){
//TODO: Cache these. Load from cache when offline
		getJson("MOBILE.ANNOUNCEMENTS",
				function (data) {
					var setString = '';
					$.each(data, function (index, value) {
						setString += ' <div data-role="collapsible"> \
					<h3>' + value.AlternateTitle + '</h3>' + value.Details + '</div>';
					});

					if (setString == '') {
						setString = '<p>No current announcements.</p>';
					}

					var div = $('#psg_collapsible_set_whats_new');
					div.html(setString);
					$('#psg_collapsible_set_whats_new').collapsibleset('refresh');
				});
}