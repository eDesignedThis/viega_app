function page_logout_show() {
	getJson('LOGOUT', handleLogoutCallback);
	function handleLogoutCallback() {
		$.mobile.pageContainer.pagecontainer('change', 'login.html', { transition: 'slide', reverse: true } );
	}
}

	
