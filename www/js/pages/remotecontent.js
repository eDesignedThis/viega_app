function page_remote_content_show() {
	var section_name = psg.getSessionItem('remote_section_name');
	var cache = psg.getCache(section_name,24);
	if (!cache.expired){
		LoadRemoteContent(cache.data);
	}else{
	    var canFail = false;
	    if (cache.data != null){
			canFail=true;
		}
		//TODO: Tell getJson it can fail silently if something is in cache
		var data = JSON.stringify({ SectionName: section_name });
		getJson('REMOTE.CONTENT',HandleRemoteContentCallback,data);	
	}
}

function HandleRemoteContentCallback(data){
	if (data.Result == null || data.Result == "success") {
		LoadRemoteContent(data);
		var section_name = psg.getSessionItem('remote_section_name');
		psg.setCache(section_name,data);
	} else {
		WriteError(data.Result);
	}
}

function LoadRemoteContent(data)
{
	$('#remote_content_title').text(data.Title);
	$('#remote_content_div').html(data.Content);
	$('#remote_content_main').trigger('create');
}