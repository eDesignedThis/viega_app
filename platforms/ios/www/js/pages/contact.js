function page_contact_show(){
        $('#contact_subject_container').show();
        $('#contact_question_container').show();
        $('#contact_submit').show();
        $('#contact_result').text('');
        $('#contact_subject').change( function () {
            var other_subject_container = $('#contact_other_subject_container');
			var other_subject = $('#contact_other_subject');
            if ($(this).find(":selected").val() == "Other") {
                other_subject_container.show();
                other_subject.addClass('required');
            } else {
                other_subject_container.hide();
                other_subject.removeClass('required');
            }
        });

    $('#form_contact').validate({ submitHandler: submitContactForm});
    
    
$(document).bind('pagecreate', 'page_contact',function() {
    $(this).find('a[data-rel="back"]').click(function(event) {
        event.stopPropagation();
        if ($.mobile.urlHistory.stack.length == 1) {
            $.mobile.changePage($(this).attr('href'));
        } else {
            $.mobile.back()
        }
        return false
    })
});
    
    
    
    
}

 function submitContactForm() {
      var data = JSON.stringify({ subject: $('#contact_subject').val(), other: $('#contact_other_subject').val(), question: $('#contact_question').val() });
      getJson("SHOPPING.SHOPPINGCARTITEMS", HandleContactSubmit, data);
    }

    function HandleContactSubmit(data) {
        if (data.Result == null || data.Result == "success") {
            var result = $('#contact_result');
            result.show();
            $('#contact_subject_container').hide();
            $('#contact_other_subject_container').hide();
            $('#contact_other_subject_container').val('');
            $('#contact_question_container').hide();
            $('#contact_question_container').val('');
            $('#contact_submit').hide();
            result.text("Email Sucessfully Sent");
        } else {
            WriteError(data.Result);
        }
    }