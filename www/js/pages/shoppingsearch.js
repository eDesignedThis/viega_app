// method invoked when shoppingsearch.html becomes the active page
function page_shopping_search_show() {
	var term = psgShopping.Search.Term.get();
	if (psg.isNothing(term)) {
		$('#psg_search_keyword').val('');
	}

	// if you hit the search button this is what you will be searching
	var department = psgShopping.Department.Current.get();
	$("#shoppingsearch_search_department").html("Search " + (psg.isNothing(department) ? 'Catalog' : department.Name));

	if (psg.isNothing(department) || department.Code == '') {
		$("#shoppingsearch_browse_department").hide();
	}
	else {
		$("#shoppingsearch_browse_department").show();
		$("#shoppingsearch_browse_department").html(
			"<strong>Items from: " + department.Name + "</strong>"
		);
	}

	if (psgShopping.Search.Trigger.isSet()) {
		psgShopping.Search.Trigger.reset();
		psgShopping.Search.go();
	}

	//$("#btn_search_scan").hide();
    if (app.isPhoneGap){
	
		$("#icon_search_scan").show();
		$("#icon_search_scan2").off('click').click(shoppingSearchScan);
		
		$("#psg_search_keyword").focus(function() {
				
			$("#qpointsContainer .panelRight").hide();
			$(".focusScan").show();
			
			
				
		});
		
		$("#psg_search_keyword").blur(function() {
				
			$("#qpointsContainer .panelRight").show(function(){
				
				if ($("#psg_search_keyword").val().length == 0) {
					
					$(".focusScan").hide();
				}
				
				});
		
			
		});
		      
		$("#psg_search_keyword").keyup(function(){
			
			if ($(this).val().length > 0) {
					      
			$(".focusScan").hide();
				
			} else {
				
				//$(".focusScan").show();
			}
		
		});
		
		
		
	}
	
	
	

	
	$('#psg_search_keyword').off('keypress').on('keypress', onKeyPress);
	function onKeyPress ( e ) {
		if (e.which == 13) {
			e.preventDefault();
			psgShopping.Search.go();
		}
	}
	
	$("#icon_search_scan").off('click').click( shoppingSearchScan )
}

var psgShopping = {
	Department: {
		Current: {
			get: function () {
				return JSON.parse(psg.getSessionItem('shopping.department.current'));
			},
			reset: function () {
				psg.removeSessionItem('shopping.department.lineage');
				psg.removeSessionItem('shopping.department.current');
			},
			set: function ( department ) {
				// Going to the top?
				if (psg.isNothing(department) || department.Code == '') {
					psg.removeSessionItem('shopping.department.lineage');
					psg.removeSessionItem('shopping.department.current');
					return;
				}

				var current = psgShopping.Department.Current.get();
				var lineage = JSON.parse(psg.getSessionItem('shopping.department.lineage'));
				
				// Are we going up or down the department tree?
				if (!psg.isNothing(lineage) && lineage.Code != '') {
					var matching = $.grep(lineage, function ( parent, index ) {
						return (!psg.isNothing(parent) && parent.Code == department.Code);
					});
					if (psg.isNothing(matching)) {
						// Not in lineage, so going down tree.
						lineage[lineage.length] = current;
					}
					else {
						// Going up, reduce lineage.
						lineage.length = lineage.indexOf(matching[0]);
					}
				}
				else {
					// No lineage, so going down tree.
					if (!psg.isNothing(current)) {
						lineage = [ current ];
					}
				}
				
				psg.setSessionItem('shopping.department.current', JSON.stringify(department));
				psg.setSessionItem('shopping.department.lineage', JSON.stringify(lineage));
			}
		},
		Parent: {
			get: function () {
				var lineage = JSON.parse(psg.getSessionItem('shopping.department.lineage'));
				if (psg.isNothing(lineage)) {
					return null;
				}
				return lineage[lineage.length - 1];
			}
		},
		SortOrder: {
			get: function () {
				return defaultToZero(psg.getSessionItem('shopping.department.sortorder'));
				function defaultToZero( value ) {
					if (psg.isNothing(value)) { return 0; }
					return value;
				}
			},
			set: function ( value ) {
				psg.setSessionItem('shopping.department.sortorder', value);
			}
		}
	},
	Departments: {
		get: function () {
			return JSON.parse(psg.getSessionItem('shopping.departments'));
		},
		set: function ( departments ) {
			psg.setSessionItem('shopping.departments', JSON.stringify(departments));
		},
		isTop: function ( department ) {
			top = psgShopping.Departments.get();
			if (psg.isNothing(top)) { return false; }
			return (top.indexOf(department) > -1);
		}
	},
	Search: {
		DepartmentCounts: {
			get: function () {
				return JSON.parse(psg.getSessionItem('shopping.search.departmentcounts'));
			},
			set: function ( counts ) {
				psg.setSessionItem('shopping.search.departmentcounts', JSON.stringify(counts));
			}
		},
		go: function () {
			var department = psgShopping.Department.Current.get();
			var searchTerm = $('#psg_search_keyword').val();

			if (psg.isNothing(department) && searchTerm == '') {
				//ShowAlert("You must provide a search term.", "Search");
				//alert("You must provide a search term.");
				$('#psg_search_keyword').focus().attr("placeholder", "Enter search term");
				return;
			}
			if (searchTerm == '') {
				psgShopping.Search.Mode.reset(); // turn-off search mode.
			}
			else {
				psgShopping.Search.Mode.set(); // turn-on search mode.
			}
			psgShopping.Search.Term.set(searchTerm);

			var shoppingOrder = psgShopping.Department.SortOrder.get();

			var maxPoints = psg.getSessionItem('shoppingSearchLimit') == 'yes' ?
				psg.getSessionItem('balance_number') : 0;
			if ( maxPoints == null ) maxPoints = 0;

			// clear the list and show the wait spinner
			$("#psg_listview_search").html("");

			// start the load
			var data = JSON.stringify({
				categoryCode: psg.isNothing(department) ? '' : department.Code,
				keywords: searchTerm,
				pageIndex: 0, sort: Number(shoppingOrder), minPoints: 0, maxPoints: Number(maxPoints)
			});
			//sort 0=Best Selling, 1=Low to High, 2=High to Low
			//For browsing vs searching: Leave keyword blank. A categoryCode is required.
			//For "Search All" leave categoryCode blank.
			// You should never have categoryCode and keyword both blank
			getJson("SHOPPING.SEARCH", HandleGetSearch, data, null, 20000);
		},
		Mode: {
			reset: function () {
				psg.removeSessionItem('shopping.search.mode');
			},
			set: function () {
				psg.setSessionItem('shopping.search.mode', true);
			},
			isSet: function () {
				return !psg.isNothing(psg.getSessionItem('shopping.search.mode'));
			}
		},
		PageIndex: {
			get: function () {
				return defaultToZero(psg.getSessionItem('shopping.search.pageindex'));
				function defaultToZero( value ) {
					if (psg.isNothing(value)) { return 0; }
					return value;
				}
			},
			set: function ( value ) {
				psg.setSessionItem('shopping.search.pageindex', value);
			}
		},
		Term: {
			get: function () {
				return psg.getSessionItem('shopping.search.term');
			},
			set: function ( value ) {
				if (psg.isNothing(value)) {
					psg.removeSessionItem('shopping.search.term');
				}
				else {
					psg.setSessionItem('shopping.search.term', value);
				}
			}
		},
		Trigger: {
			reset: function () {
				psg.removeSessionItem('shopping.search.trigger');
			},
			set: function () {
				psg.setSessionItem('shopping.search.trigger', true);
			},
			isSet: function () {
				return !psg.isNothing(psg.getSessionItem('shopping.search.trigger'));
			}
		}
	}
}

function shoppingSearchScan() {
	clickedSearchScan = false;
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			if ( !result.cancelled ) {
				$('#psg_search_keyword').val(result.text);
				psgShopping.Search.go();
			}
			$("#btn_search_scan").hide();
		},
		function (error) {
			navigator.notification.alert('Unable to read bar code.', function(){}, 'Scan Failed', 'OK');
			$("#btn_search_scan").hide();
		}
	);
}

function HandleGetSearch(data) {
	$('#psg_search_keyword').removeAttr("placeholder");
	if (data.Result == null || data.Result == "success") {
		var searchDepartment = psgShopping.Department.Current.get();
		var searchTerm = $('#psg_search_keyword').val();
		var displayCounts = psgShopping.Search.Mode.isSet();
		var first = (data.ItemsCollection.PageIndex*20)+1;
		var last = data.ItemsCollection.CatalogItems.length + first - 1;
		var listString = //'<li data-theme="a">Search Results</li>'
			"<li data-theme='a'>" +
			"	<table cellspacing='0' width='100%'>"+
			"		<tr>" +
			"			<td><strong>" +
						( displayCounts ?
							data.ItemsCollection.TotalItemCount + " Items</strong> (" +
							first+" to " + last + ")" : "Items</strong>" ) +
			"			</td>"+
			"			<td style='text-align:right;'>" +
			"				<a href='shoppingsearchfilter.html' class='linkBtn ui-btn ui-btn-a ui-shadow ui-corner-all ui-mini' data-transition='slidedown' data-rel='dialog'>Filter &amp; Sort</a>" +
			"			</td>" +
			"		</tr>" +
			"	</table>" +
			"</li>";

		if (data.ItemsCollection.TotalItemCount == 0) {
			listString += '<li><i class="fa fa-lg fa-frown-o fa-fw"></i>&nbsp;No items are available.</li>';
		}
		else {
			$.each(data.ItemsCollection.CatalogItems, function (index, value) {
				listString = GetCatalogItemListItem(value,listString);
			});
		}

		var nb = 0;
		var buttons = "";
		if ( data.ItemsCollection.PageIndex > 0 ) {
			buttons += "<button data-mini='true' id='psg_shopping_search_less_button' data-theme='a' class='noCenter ui-btn ui-btn-a ui-corner-all ui-icon-carat-l ui-btn-icon-left'>Back</button>";
			++nb;
		}
		buttons += "</td><td align='center'>";
		if ( data.ItemsCollection.PageIndex+1 < data.ItemsCollection.PageCount ) {
			buttons += "<button data-mini='true' id='psg_shopping_search_more_button' data-theme='a' class='noCenter ui-btn ui-btn-a ui-corner-all ui-icon-carat-r ui-btn-icon-right'>More</button>";
			++nb;
		}
		if ( nb > 0 ) {
			listString += "<li data-theme='a'><table width='100%'><col width='50%'><col width='50%'><tr><td align='center'>" +
			buttons + "</td></tr></table></li>";
		}

		var ul = $('#psg_listview_search');

		psgShopping.Search.DepartmentCounts.set(data.ItemsCollection.DepartmentCounts);
		psgShopping.Search.PageIndex.set(data.ItemsCollection.PageIndex);

		ul.html(listString);
		ul.listview('refresh');
		ul.find('.link-detail').on("click", function () {
			psg.setSessionItem('psg-item-key', $(this).attr('data-psg-item-key'));
			$.mobile.pageContainer.pagecontainer('change', 'itemdetail.html', { transition: 'slide' });
		});

		$('#psg_shopping_search_more_button').on('click', function() { shoppingSearchGetMore(1); });
		$('#psg_shopping_search_less_button').on('click', function() { shoppingSearchGetMore(-1); });

		WriteError(data.Result);
	}
}

// get the next chunk of items to display
function shoppingSearchGetMore(direction) {
	$("#psg_listview_search").html("");

	var maxPoints = psg.getSessionItem('shoppingSearchLimit') == 'yes' ?
		psg.getSessionItem('balance_number') : 0;
	if ( maxPoints == null ) maxPoints = 0;

	var dept = psgShopping.Department.Current.get();
	var data =  JSON.stringify({
		categoryCode: psg.isNothing(dept) ? '' : dept.Code,
		keywords: psgShopping.Search.Term.get(),
		pageIndex: Number(psgShopping.Search.PageIndex.get()) + direction,
		sort: Number(psgShopping.Department.SortOrder.get()),
		minPoints: 0, 
		maxPoints: Number(maxPoints) 
	});
	//sort 0=Best Selling, 1=Low to High, 2=High to Low
	//For browsing vs searching: Leave keyword blank. A categoryCode is required.
	//For "Search All" leave categoryCode blank.
	// You should never have categoryCode and keyword both blank
	getJson("SHOPPING.SEARCH", HandleGetSearch, data, null, 20000);
}
