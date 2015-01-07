function page_password_reset_show(){
     
     $('#frmReset').validate({ submitHandler: submitResetForm});
} 
 
function submitResetForm() { 
    var guid = psg.programGuid; 
    var data = JSON.stringify({ program_guid: guid, email: $('#reset_email').val(), security_code: $('#reset_security_code').val() }); 
    getJson("ENROLLMENT.PASSWORD.RESET", ResetCallback, data); 
} 

function ResetCallback(data){
    if ( data.Result == 'success')
    {
        WriteError("If you provided a registered email address, then instructions to reset your password have been sent. Please check your email.");
        $('#do_reset').hide();
        $('#reset_close').show();

    }else{
        WriteError(data.Result);
    }		
}
