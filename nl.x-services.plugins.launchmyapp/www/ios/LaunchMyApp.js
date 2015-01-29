"use strict";

/*
 Q: Why an empty file?
 A: iOS doesn't need plumbing to get the plugin to work, so..
 - Including no file would mean the import in index.html would differ per platform.
 - Also, using one version and adding a userAgent check for Android feels wrong.
 - And if you're not using PhoneGap Build, you could paste your handleOpenUrl JS function here.
 */


function handleOpenURL(url) {
    
    setTimeout(function() {
        
        console.log("received url: " + url);
           
        var receivedUrl = url.split('//');
        
        console.log(receivedUrl);
        
        var appLink = receivedUrl[1];
        
        console.log(appLink);
        
            switch (appLink) {
                
                case "checkoutaddress.html":
                case "checkoutconfirm.html":
                case "claimdetail.html":
                case "claimhistory.html":
                case "claims.html":
                case "claimsconfirmation.html":
                case "claimslanding.html":
                case "contact.html":
                case "editcheckoutaddress.html":
                case "enrollment.html":
                case "enrollmentconfirmation.html":
                case "home.html":
                case "invitation.html":
                case "ispuselect.html":
                case "itemdetail.html":
                case "itemoptions.html":
                case "login.html":
                case "orderdetail.html":
                case "orders.html":
                case "passwordreset.html":
                case "pointsawarded.html":
                case "pointsfedeemed.html":
                case "pointshistory.html":
                case "promotioninfo.html":
                case "quickpoints.html":
                case "receipt.html":
                case "remotecontent.html":
                case "settings.html":
                case "shoppingbrowse.html":
                case "shoppingcart.html":
                case "shoppingmain.html":
                case "shoppingonsale.html":
                case "shoppingrecitems.html":
                case "shoppingsearch.html":
                case "shoppingsearchfilter.html":
                case "spec.html":
                case "start.html":
                case "timeout.html":
                case "whatsnew.html":
                case "wishlist.html":
                    
                $.mobile.pageContainer.pagecontainer('change', appLink); 
                
                break;
            
                default: 
                $.mobile.pageContainer.pagecontainer('change', 'login.html');
            
            
            }
           
    }, 0);
    
    
    
}



