 function page_leaderboard_detail_show(){
	var leaderboardId = sessionStorage.getItem('psg-leaderboard-id');
	var data = JSON.stringify({ leaderboardId: leaderboardId });
	getJson("LEADERBOARD.DETAIL.GET", handleLeaderboardDetail, data);
}

// Handles the response from the JSON service.
function handleLeaderboardDetail(data) {
	if (psg.isNothing(data) || psg.isNothing(data.Result)) {
		WriteError("This leaderboard is not available at the moment.<br><br>Please try again, later.");
		return;
	}
	if (data.Result != "success") {
		WriteError(data.Error ? data.Error : data.Result);
		return;
	}
	renderLeaderboardDetail(data);
	attachLeaderboardDetailEvents();
}

// Updates the screen with the provided data.
function renderLeaderboardDetail(data) {
	if (!psg.isNothing(data.Leaderboard) && !psg.isNothing(data.Snapshot)) {
		// Set the table header.
		if (!psg.isNothing(data.Snapshot.TitleHtml)) {
			$('.psg-leaderboard-detail-title').html(data.Snapshot.TitleHtml);
		}
		else {
			$('.psg-leaderboard-detail-title').html('<h3>' + data.Leaderboard.Name + '</h3>');
		}
		// Set the table footer.
		if (!psg.isNothing(data.Snapshot.FooterHtml)) {
			$('.psg-leaderboard-detail-footer').html(data.Snapshot.FooterHtml);
		}
		else {
			$('.psg-leaderboard-detail-footer').html('');
		}
	}
	
	// TODO: Set period buttons
	
	var listString = buildLeaderboardPaxList(data);
	var ul = $('#psg-listview-leaderboard-detail');
	ul.html(listString);
	ul.listview();
	ul.listview('refresh');
}

// Builds the leaderboard pax list from the provided data.
function buildLeaderboardPaxList(data) {
	if (psg.isNothing(data)) return '';
	if (psg.isNothing(data.Snapshot)) return '';
	
	var listString = '';
	
	if (psg.isNothing(data.Snapshot.Rows) || data.Snapshot.Rows.length == 0) {
		listString += '<li class="leaderboard-list-item"><div class="ui-no-ellipse"><p>No one has qualified, yet. Be the first!</p></div></li>';
	}
	else {
		$.each(data.Snapshot.Rows, function (index, pax) {
			listString += '<li class="leaderboard-list-item"><div class="pax-rank">' + pax.Ranking + '.</div>'
			if (!psg.isNothing(pax.AvatarUrl)) {
				listString += '<div class="pax-image"><img src="' + app.getHost() + '/catalog/profiles/' + pax.AvatarUrl + '" /></div>';
			} else {
               listString += '<div class="pax-image"><i class="fa fa-user fa-2x"></i></div>'; 
            }
			listString += '<div class="name-score-holder"> \
				<div class="pax-fullName ui-text-small"><strong>' + pax.FullName + '</strong></div> \
				<div class="pax-score"><strong>' + pax.Score + '</strong></div> \
			</div></li>';
		});
	}
	
	return listString;
}

// Attaches click events to the list items.
function attachLeaderboardListEvents() {
	// no events currently.
}
