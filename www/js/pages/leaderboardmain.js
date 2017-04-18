 function page_leaderboard_main_show(){
	getJson("LEADERBOARD.LIST.GET", handleLeaderboardList);
}

// Handles the response from the JSON service.
function handleLeaderboardList(data) {
	if (psg.isNothing(data) || psg.isNothing(data.Result)) {
		WriteError("No leaderboards are available at the moment.<br><br>Please try again, later.");
		return;
	}
	if (data.Result != "success") {
		WriteError(data.Error ? data.Error : data.Result);
		return;
	}
	
	// If only one leaderboard, auto-select it.
	if (!psg.isNothing(data.List) && data.List.length == 1) {
		openLeaderboardDetail(data.List[0].LeaderboardId, false);
	}
	else {
		renderLeaderboardList(data);
		attachLeaderboardListEvents();
	}
}

// Updates the screen with the provided data.
function renderLeaderboardList(data) {
	var listString = buildLeaderboardList(data);
	var ul = $('#psg-listview-leaderboard');
	ul.html(listString);
	ul.listview({
		autodividers: false
	});
	ul.listview('refresh');
}

// Builds the leaderboard list HTML from the provided data.
function buildLeaderboardList(data) {
	if (psg.isNothing(data)) return '';
	if (psg.isNothing(data.List)) return '';
	
	var listString = '';
	
	$.each(data.List, function (index, leaderboard) {
		listString += '<li> \
			<a href="#" data-psg-leaderboard-id="' + leaderboard.LeaderboardId + '" class="link-leaderboard"> \
				<div class="ui-no-ellipse">' + leaderboard.Name + '</div> \
			</a></li>';
	});
	
	return listString;
}

// Attaches click events to the list items.
function attachLeaderboardListEvents() {
	$('.link-leaderboard').on("click", onLeaderboardClick);
}

// Responds to click event on leaderboard list item.
function onLeaderboardClick() {
	openLeaderboardDetail($(this).attr('data-psg-leaderboard-id'), true);
}

function openLeaderboardDetail(leaderboardId, changeHash) {
	sessionStorage.setItem('psg-leaderboard-id', leaderboardId);
	$.mobile.pageContainer.pagecontainer('change', 'leaderboarddetail.html', { transition: 'slide', changeHash: changeHash } );
}
