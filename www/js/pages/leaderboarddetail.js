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
		if (psg.isNothing(data.Snapshot.Columns) || data.Snapshot.Columns.length == 0) {
			listString += buildLeaderboardStandardList(data);
		}
		else {
			listString += buildLeaderboardCustomList(data);
		}
	}
	
	return listString;
}

// If no columns are provided, this builds a decent/standard leaderboard
// that includes: Rank, Avatar, Full Name, and Score.
function buildLeaderboardStandardList(data) {
	if (psg.isNothing(data)) return '';
	if (psg.isNothing(data.Snapshot)) return '';
	if (psg.isNothing(data.Snapshot.Rows)) return '';
	if (data.Snapshot.Rows.length == 0) return '';
	
	var listString = '';
	$.each(data.Snapshot.Rows, function (index, pax) {
		listString += '<li class="leaderboard-list-item"><div class="pax-rank">' + pax.Ranking + '.</div>'
		if (!psg.isNothing(pax.AvatarUrl)) {
			listString += '<div class="pax-image"><img src="' + app.getHost() + '/catalog/profiles/' + pax.AvatarUrl + '" /></div>';
		} else {
		   listString += '<div class="pax-image"><i class="fa fa-user fa-2x"></i></div>'; 
		}
		listString += '<div class="name-score-holder">';
		if (psg.isNothing(pax.DrilldownOrgId) || pax.DrilldownOrgId == 0) {
			listString += '<div class="pax-fullName ui-text-small"><strong>' + pax.FullName + '</strong></div>';
		} else {
			listString += '<div class="pax-fullName ui-text-small"><a href="#" class="leaderboard_drilldown_link" drilldown="' + row.DrilldownOrgId.toString() + '"><strong>' + pax.FullName + '</strong></a></div>';
		}
		listString += '<div class="pax-score"><strong>' + pax.Score + '</strong></div>';
		listString += '</div></li>';
	});
	
	return listString;
}

// When columns are setup in the back office, this builds the leaderboard
// using those columns.
function buildLeaderboardCustomList(data) {
	if (psg.isNothing(data)) return '';
	if (psg.isNothing(data.Snapshot)) return '';
	if (psg.isNothing(data.Snapshot.Rows)) return '';
	if (data.Snapshot.Rows.length == 0) return '';
	
	// Since the page expects a listview, we need to create a single list item.
	var listString = '<li>';

	// Use a JQM table to format the leaderboard in a responsive way.
	listString += '<table data-role="table" id="psg-leaderboard-table" data-mode="reflow" class="ui-responsive">';
	
	// Draw column headers.
	listString += '<thead><tr>';
	$.each(data.Snapshot.Columns, function (index, col) {
		listString += '<th data-priority="' + (index + 1).toString() + '">' + col.HeaderHtml + '</th>';
	});
	listString += '</tr></thead>';
	
	
	// Iterate each participant row.
	listString += '<tbody>';
	$.each(data.Snapshot.Rows, function (index, pax) {
		listString += '<tr class="leaderboard-list-item">';
		
		// Iterate each column definition.
		$.each(data.Snapshot.Columns, function (index, col) {
			listString += '<td>';
			listString += drawLeaderboardField(pax, col);
			listString += '</td>';
		});
		
		listString += '</tr>';
	});
	listString += '</tbody>';
	
	// Close the table.
	listString += '</table>';
	
	// Close the list item.
	listString += '</li>';
	
	return listString;
}

// When columns are setup in the back office, this builds the leaderboard
// using those columns.
function buildLeaderboardCustomList2(data) {
	if (psg.isNothing(data)) return '';
	if (psg.isNothing(data.Snapshot)) return '';
	if (psg.isNothing(data.Snapshot.Rows)) return '';
	if (data.Snapshot.Rows.length == 0) return '';
	
	var listString = '';
	
	// Iterate each participant row.
	$.each(data.Snapshot.Rows, function (index, pax) {
		listString += '<li class="leaderboard-list-item">';
		
		// Iterate each column definition.
		var gridColumns = ["a","b","c","d","e"];
		$.each(data.Snapshot.Columns, function (index, col) {
			// JQM Mobile only support 5 columns using ui-grid.  So, we
			// must create multiple grids if there are more columns.
			// Note: index is zero-based, but we need it to be one-based
			// for the calculations to work.
			var gridColIndex = (index) % 5;
			if (gridColIndex == 0) {
				if (index > 0) {
					// End previous grid
					listString += '</div>';
				}
				
				// Start new grid
				listString += '<div class="ui-grid-b">';
			}
			
			listString += '<div class="ui-block-' + gridColumns[gridColIndex] + '">';
			listString += drawLeaderboardField(pax, col);
			listString += '</div>';
		});
		
		// End last grid.
		listString += '</div>';
		
		listString += '</li>';
	});
	
	return listString;
}

function drawLeaderboardField(pax, col) {
	if (psg.isNothing(pax)) return '';
	if (psg.isNothing(col)) return '';
	
	var fieldString = '';
	
	switch (col.Field.toUpperCase()) {
		case "AVATAR":
			if (!psg.isNothing(pax.AvatarUrl)) {
				fieldString += '<div class="pax-image"><img src="' + app.getHost() + '/catalog/profiles/' + pax.AvatarUrl + '" /></div>';
			}
			break;

		case "RANKING":
			if (!psg.isNothing(pax.Ranking)) {
				fieldString += '<div class="pax-rank">' + pax.Ranking.toString(); + '</div>' // may need to apply formatting in future.
			}
			break;

		case "SCORE":
			if (!psg.isNothing(pax.Score)) {
				fieldString += '<div class="ui-text-right">' + pax.Score.toString() + '</div>'; // may need to apply formatting in future.
			}
			break;
		
		case "FIRSTNAME":
		case "FULLNAME":
		case "LASTNAME":
			if (!psg.isNothing(pax[col.Field])) {
				if (psg.isNothing(pax.DrilldownOrgId) || pax.DrilldownOrgId == 0) {
					fieldString += pax[col.Field].toString();
				} else {
					fieldString += '<a href="#" class="leaderboard_drilldown_link" drilldown="';
					fieldString += pax.DrilldownOrgId.toString();
					fieldString += '"><b>' + pax[col.Field].toString() + '</b></a>';
				}
			}
			break;
			
		default:
			if (!psg.isNothing(pax[col.Field])) {
				fieldString += pax[col.Field].toString();
			}
			break;
	}
	
	return fieldString;
}

// Attaches click events to the list items.
function attachLeaderboardDetailEvents() {
	// Drill-down event.
	$('.leaderboard_drilldown_link').on('click', function (e) {
		var org = $(this).attr('drilldown');
		var leaderboardId = sessionStorage.getItem('psg-leaderboard-id');
		var data = JSON.stringify({ leaderboardId: leaderboardId, drillDownId: org });
		getJson("LEADERBOARD.DETAIL.GET", handleLeaderboardDetail, data);
	});
	
	// Drill-up event.
	$('.leaderboard_drillup_link').on('click', function (e) {
		var org = $(this).attr('drillup');
		var leaderboardId = sessionStorage.getItem('psg-leaderboard-id');
		var data = JSON.stringify({ leaderboardId: leaderboardId, drillDownId: org });
		getJson("LEADERBOARD.DETAIL.GET", handleLeaderboardDetail, data);
	});
}
