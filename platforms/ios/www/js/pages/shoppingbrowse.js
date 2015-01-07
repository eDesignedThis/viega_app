function page_shopping_browse_show() {
	if (psg.isNothing(psg.getSessionItem('shopping.departments'))) {
		getJson("SHOPPING.DEPARTMENTS", handleBrowseDepartmentCallback);
	} else {
		bindBrowseDepartments();
	}

	function handleBrowseDepartmentCallback(data){
		if (data.Result == null || data.Result == "success") {
			psgShopping.Departments.set(data.TopCategories);
			bindBrowseDepartments();
		} else {
			WriteError(data.Result);
		}
	}

	function bindBrowseDepartments() {
		var departments = psgShopping.Departments.get();

		var list = "";
		$.each(departments, function (index, department) {
			list +=
				'<li >' +
				'	<a href="#" class="psg_shopping_browse_dept_filter" ' +
				'				psg-filter-value="' + department.Code + '"> ' +
						department.Name +
				'	</a> ' +
				'</li> ';
		});

		$("#psg_shopping_browse_filter_items").html(list);
		$("#psg_shopping_browse_filter_items").listview('refresh');

		$(".psg_shopping_browse_dept_filter").click(function() {
			var filter = $(this).attr('psg-filter-value');
			var matching = $.grep(departments, function ( department, index ) {
				return (department.Code == filter);
			});
			if (psg.isNothing(matching)) {
				return; // no matching department.
			}
			psg.setSessionItem('shoppingSearchInit',"true");
			psgShopping.Search.Mode.reset();
			psgShopping.Department.Current.reset(); // restarts us at top of tree.
			psgShopping.Department.Current.set(matching[0]);
			psgShopping.Search.Term.set(null); // makes browse mode.
			psgShopping.Search.Trigger.set(); // instructs search page to refresh.
			$.mobile.pageContainer.pagecontainer('change', 'shoppingsearch.html');
		});
	}
}
