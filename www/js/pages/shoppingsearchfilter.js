function page_shopping_search_filter_show() {
	// option to go up department tree
	var parentDepartment = psgShopping.Department.Parent.get();
	var currentDepartment = psgShopping.Department.Current.get();
	if (psg.isNothing(currentDepartment)) {
		currentDepartment = { Code: '', Name: 'Catalog' };
	}
	if (!psg.isNothing(currentDepartment) 
		&& psg.isNothing(parentDepartment) 
		&& psgShopping.Search.Mode.isSet()
		&& currentDepartment.Code != '') {
		parentDepartment = { Code: '', Name: 'Catalog' };
	}

	var list = '<li data-role="list-divider" data-theme="a" data-inset="false">'+
		'Narrow by Department'+
		'</li>';
	var indents = ['', 'ui-indent-1x', 'ui-indent-2x'];
	var indentIndex = 0;
	if (!psg.isNothing(parentDepartment)) {
		list += '<li data-icon="arrow-u">' +
			'<a href="#" class="psg_shopping_search_dept_filter" ' +
				'psg-filter-value="' + parentDepartment.Code + '">' +
				'<span class="dept_catalog_category_name">' + parentDepartment.Name + '</span>' +
			'</a></li>';
		indentIndex++;
	}

	list += '<li><span class="dept_catalog_category_name ';
	list += indents[indentIndex];
	list += '">';
	list += currentDepartment.Name;
	list += '</span></a></li>';
	indentIndex++;
	
	var indent = indents[indentIndex];
	var isSearchMode = psgShopping.Search.Mode.isSet();
	var departments = psgShopping.Search.DepartmentCounts.get();
	for (var i in departments) {
		var dept = departments[i];
		list +=
			'<li class="ui-depart-indent">' +
				'<a href="#" class="psg_shopping_search_dept_filter" ' +
					'psg-filter-value="'+dept.CatalogCategoryCode+'">' +
					'<span class="dept_catalog_category_name ' + indent + '">' + dept.CatalogCategoryName + '</span>'; 
		if (isSearchMode) {			
			list +=	'<span class="ui-li-count">' + dept.ItemCountString + '</span>';
		}
		list +=	'</a>'+
			'</li>';
	}
	
	$("#search_filter_departments_container").show();
	$("#search_filter_departments").html(list);
	$("#search_filter_departments").listview('refresh');

	$(".psg_shopping_search_dept_filter").on('click', function () {
		var selected = $(this);
		var code = selected.attr('psg-filter-value');
		var name = selected.find(".dept_catalog_category_name").html();
		psgShopping.Department.Current.set({ Code: code, Name: name });
		psgShopping.Search.Trigger.set();
		$('#page_shopping_search_filter').dialog('close');
	});

	var shoppingOrder = psgShopping.Department.SortOrder.get();
	if ( shoppingOrder == null ) shoppingOrder = 0;

	list = '<li data-role="list-divider" data-theme="a">Sort By</li>';

	// if the current department is empty (a search in All departments) the sort feature does not work
	// so let the user know they have to pick a department first.
	if ( currentDepartment.Code == '' )
	{
		list += '<li class="psg-shopping-department-indent">Choose a department above to view sort options.</li>';
	}
	else {
		$.each(['Bestselling', 'Points: Low to High', 'Points: High to Low'], function (index, item) {
			list +=
				'<li class="psg-shopping-department-indent" ' + (index == shoppingOrder ? 'data-icon="check"' : '') + '>' +
				'<a href="#" class="psg_shopping_search_dept_sort" psg-sort-value="' + index + '">' + item + '</a></li>';
		});
	}

	$("#shopping_search_filter_sort").html(list);
	$("#shopping_search_filter_sort").listview('refresh');
	$(".psg_shopping_search_dept_sort").on('click', function () {
		var sort = $(this).attr('psg-sort-value');
		psgShopping.Department.SortOrder.set(sort);
		psgShopping.Search.Trigger.set();
		$('#page_shopping_search_filter').dialog('close');
	});

	$("[name=search_filter_qualifies_radio]").off('click');
	$("[name=search_filter_qualifies_radio]").on('click', function () {
		psg.setSessionItem('shoppingSearchLimit', $(this).attr('value'));
		psgShopping.Search.Trigger.set();
		$('#page_shopping_search_filter').dialog('close');
	});

	$("[name=search_filter_qualifies_radion]").val(psg.getSessionItem('shoppingSearchLimit'));
}

