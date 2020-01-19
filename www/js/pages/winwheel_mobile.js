var message;
function WinWheel(options) {

    var prizes = JSON.parse(options.prizes);
    var power = parseInt(options.power);  // Set when the power is selected. 1 for low, 2 for med, 3 for high.
    var wheelImageName = options.imageUrl;  // File name of the image for the wheel.
    var canvasId = options.canvasId; //"myDrawingCanvas";   // Id of the canvas element on the page the wheel is to be rendered on.
    var buttonId = options.buttonId;
    var pointerAngle = parseInt(options.pointerAngle);  	 	 // The angle / location around the wheel where the pointer indicaing the prize is located. Can be any value you like, 0 is top (12 oclock) 180 is bottom (6 o'clock) etc.
    var gameId = parseInt(options.gameId);
    var message = options.message;
    //var firstName = options.firstName;
    //var lastName = options.lastName;
    //message = message.replace('[FirstName]', firstName).replace('[LastName]', lastName);
    //TODO: Pointer color

    var spinButtonImgOn = "spin_on.png"; 	// Name / path to the images for the spin button.
    var spinButtonImgOff = "spin_off.png";
    var theSpeed = 20; 		 // Controls how often the spin function is called (is miliseconds value for animation timer).
    var doPrizeDetection = true; 	 // Set to true if you want the code to detect the prize the user has won when the spinning has stopped. Prizes need to be specified in the prizes array.
    var determinedGetUrl = "";

    // This is set in the startSpin function to a random value within a range so that the last speed of the rotation of the wheel
    // does not always happen at the same point before the prize the user will win. See comments in doSpin where this variable is located.
    var randomLastThreshold = 150;

    //Prize Array structure
    //{"name" : "Prize 1", "Id": 333 "startAngle" : 0,   "endAngle" : 44};  // Note how prize end angle is 1 less than start angle of next prize so no overlap.

    var surface; 	   // Set to the drawing canvas object in the begin function.
    var wheel; 		   // The image of the face of the wheel is loaded in to an image object assigned to this var.
    var angle = 0;  // Populated with angle figured out by the threshold code in the spin function. You don't need to set this here.
    var targetAngle = 0;  // Set before spinning of the wheel begins by startSpin function depending on spinMode.
    var currentAngle = 0;  // Used during the spin to keep track of current angle.
    var wheelState = 'reset';
    var determinedValue = 0;

	



    var init = begin();


    this.startSpin = function () {
       getJson("GAMES.AWARD&gameid=" + gameId, handleWinWheelSpin);
	}   

    
function handleWinWheelSpin(data) {
	if (psg.isNothing(data) || psg.isNothing(data.Result)) {
		WriteError("No win wheels are available at the moment.<br><br>Please try again, later.");
		return;
	}
	if (data.Result != "success") {
		WriteError(data.Error ? data.Error : data.Result);
		return;
	}	
	if (data != null && data.Result == "success") {
			var prizeId = data.Prize.PrizeID;
			if (data.RemainingTokens < 1) {
				$('#ww_instructions_button').hide();
				$('#divHome').show();
			}
			$.each(prizes, function (index, prize) {
				if (prize.prizeId == prizeId) {
					determinedValue = index;
					return false;
				}
				//debugger;

			});
		} else {
			var error = "No Data";
			if (data != null) {
				error = data.Result;
			}
			$("#winwheel_error").prepend(error + '<br>');
			$("#popupErrors").jqxWindow({ okButton: $('#errorMessageOk'), width: "auto", height: "auto", isModal: true, showCloseButton: true, });
			$("#popupErrors").show();

        }
		
        if (determinedValue == null)
            return;
  

		var randomStopAngle = Math.random();
		var stopAngleStart = parseInt(prizes[determinedValue]['startAngle']);
        stopAngle = Math.floor(stopAngleStart + (randomStopAngle * (parseInt(prizes[determinedValue]['endAngle']) - stopAngleStart)));

        // ------------------------------------------
        // If stopAngle defined then we have the information we need to work out final things such as the targetAngle and then kick off the spinning of the wheel.
        // Only do this if the wheel is in fresh state (not curently spinning or has stopped after a spin) and the power has been selected.
        if ((typeof (stopAngle) !== 'undefined') && (wheelState == 'reset') && (power)) {
            // Ok. So we have the stopAngle, but in order to make the prize at that location pointed to by the pointer that indicates the prize we
            // need to adjust the value taking in to account the location of the pointer.
            // This is the location of pointer, minus the stopAngle. 360 is added to ensure that value is not negative.
            stopAngle = (360 + pointerAngle) - stopAngle;

            // Now that is sorted we have to set the targetAngle of the wheel. Once the spinning is started it will keep going until the targetAngle is met.
            // This value needs to be based on the power and have the stopAngle added to it. Basically more power the larger the targetAngle needs to be.
            targetAngle = (360 * (power * 6) + stopAngle);

            // Also set the randomLastThreshold to a value between 90 and 180 so that user cannot always tell what prize they will win before the wheel
            // stops, which is the case if the last threshold is always the same as the user can see the wheel slow to 1 degree of rotation the same 
            // distance before it stops each time. See further comments in doSpin function where this is used.
            randomLastThreshold = Math.floor(90 + (Math.random() * 90));

            // Set Spin button image back to disabled one, since can't click again until the wheel is reset.
            $("#" + buttonId).attr("disabled", true);

            // Now kick off the spinning of the wheel by calling the doSpin function.
            wheelState = 'spinning';
            doSpin();
        }
}

    function begin() {
        // Get our Canvas element
        surface = document.getElementById(canvasId);

        // If canvas is supported then load the image.
        if (surface.getContext) {
            wheel = new Image();
            wheel.onload = initialDraw; 	// Once the image is loaded from file this function is called to draw the image in its starting position.
            wheel.src = wheelImageName;
        }
    }


    function initialDraw(e) {
        var surfaceContext = surface.getContext('2d');
        //surfaceContext.translate(surface.width / 2, surface.height / 2);

        // rotate 45 degrees clockwise
        //surfaceContext.rotate(41 * Math.PI / 180);
        //surfaceContext.translate(-surface.width / 2, -surface.height / 2);
        surfaceContext.drawImage(wheel, 0, 0);

    }

    function DegToRad(d) {
        return d * 0.0174532925199432957;
    }

    // ==================================================================================================================================================
    // This function actually rotates the image making it appear to spin, a timer calls it repeatedly to do the animation.
    // The wheel rotates until the currentAngle meets the targetAngle, slowing down at certain thresholds to give a nice effect.
    // ==================================================================================================================================================
    function doSpin() {
        // Grab the context of the canvas.
        var surfaceContext = surface.getContext('2d');

        // Save the current context - we need this so we can restore it later.
        surfaceContext.save();

        // Translate to the center point of our image.
        surfaceContext.translate(wheel.width * 0.5, wheel.height * 0.5);

        // Perform the rotation by the angle specified in the global variable (will be 0 the first time).
        surfaceContext.rotate(DegToRad(currentAngle));

        // Translate back to the top left of our image.
        surfaceContext.translate(-wheel.width * 0.5, -wheel.height * 0.5);

        // Finally we draw the rotated image on the canvas.
        surfaceContext.drawImage(wheel, 0, 0);

        // And restore the context ready for the next loop.
        surfaceContext.restore();

        // ------------------------------------------
        // Add angle worked out below by thresholds to the current angle as we increment the currentAngle up until the targetAngle is met.
        currentAngle += angle;

        // ------------------------------------------
        // If the currentAngle is less than targetAngle then we need to rotate some more, so figure out what the angle the wheel is to be rotated 
        // by next time this function is called, then set timer to call this function again in a few milliseconds.
        if (currentAngle < targetAngle) {
            // We can control how fast the wheel spins by setting how much is it to be rotated by each time this function is called.
            // In order to do a slowdown effect, we start with a high value when the currentAngle is further away from the target
            // and as it is with certian thresholds / ranges of the targetAngle reduce the angle rotated by - hence the slowdown effect.

            // The 360 * (power * 6) in the startSpin function will give the following...
            // HIGH power = 360 * (3 * 6) which is 6480
            // MED power = 360 * (2 * 6) which equals 4320
            // LOW power = 360 * (1 * 6) equals 2160.

            // Work out how much is remaining between the current angle and the target angle.
            var angleRemaining = (targetAngle - currentAngle);

            // Now use the angle remaining to set the angle rotated by each loop, reducing the amount of angle rotated by as
            // as the currentAngle gets closer to the targetangle.
            if (angleRemaining > 6480)
                angle = 55;
            else if (angleRemaining > 5000)		// NOTE: you can adjust as desired to alter the slowdown, making the stopping more gradual or more sudden.
                angle = 45; 					// If you alter the forumla used to work out the targetAngle you may need to alter these.
            else if (angleRemaining > 4000)
                angle = 30;
            else if (angleRemaining > 2500)
                angle = 25;
            else if (angleRemaining > 1800)
                angle = 15;
            else if (angleRemaining > 900)
                angle = 11.25;
            else if (angleRemaining > 400)
                angle = 7.5;
            else if (angleRemaining > 220)					// You might want to randomize the lower threhold numbers here to be between a range
                angle = 3.80; 							// otherwise if always within last 150 when the speed is set to 1 degree the user can
            else if (angleRemaining > randomLastThreshold)	// tell what prize they will win before the wheel stops after playing the wheel a few times.
                angle = 1.90; 							// This variable is set in the startSpin function. Up to you if you want to randomise the others.
            else
                angle = 1; 	// Last angle should be 1 so no risk of the wheel overshooting target if using preDetermined spin mode 
            // (only a problem if pre-Determined location is near edge of a segment).

            // Set timer to call this function again using the miliseconds defined in the speed global variable.
            // This effectivley gets creates the animation / game loop.

            // IMPORTANT NOTE: 
            // Since creating this wheel some time ago I have learned than in order to do javascript animation which is not affected by the speed at which 
            // a device can exectute javascript, a "frames per second" approach with the javscript function requestAnimationFrame() should be used. 
            // I have not had time to learn about and impliment it here, so you might want to look in to it if this method of animation is not 
            // smooth enough for you.
            spinTimer = setTimeout(function () { doSpin(); }, theSpeed);
        }
        else {
            // currentAngle must be the same as the targetAngle so we have reached the end of the spinning.

            // Update this to indicate the wheel has finished spinning.
            // Not really used for anything in this example code, but you might find keeping track of the wheel state in a game you create 
            // is handy as you can check the state and do different things depending on it (reset, spinning, won, lost etc).
            wheelState = 'stopped';

            // If to do prize dection then work out the prize pointed to.
            if ((doPrizeDetection) && (prizes)) {
                // Get how many times the wheel has rotated past 360 degrees.
                var times360 = Math.floor(currentAngle / 360);

                // From this compute the angle of where the wheel has stopped - this is the angle of where the line between 
                // segment 8 and segment 1 is because this is the 360 degree / 0 degree (12 o'clock) boundary when then wheel first loads.
                var rawAngle = (currentAngle - (360 * times360));

                // The value above is still not quite what we need to work out the prize.
                // The angle relative to the location of the pointer needs to be figured out.
                var relativeAngle = Math.floor(pointerAngle - rawAngle);

                if (relativeAngle < 0)
                    relativeAngle = 360 - Math.abs(relativeAngle);

                // Now we can work out the prize won by seeing what prize segment startAngle and endAngle the relativeAngle is between.
                for (x = 0; x < (prizes.length) ; x++) {
                    if ((relativeAngle >= prizes[x]['startAngle']) && (relativeAngle <= prizes[x]['endAngle'])) {
                        // Do something with the knowlege. For this example the user is just alerted, but you could play a sound,
                        // change the innerHTML of a div to indicate the prize etc - up to you.
                        //alert("You won " + prizes[x]['name'] + "!\nClick 'Play Again' to have another go.");

                        //message = $("<div />").html(message).text().replace('[PrizeName]', prizes[x]['name']).replace('[Amount]', prizes[x]['amount']);
						$("#popupMessage").html('');
						var messageConfirm = $("<div />").html(message).text() + '<br /><span style="font-weight:bold">Prize name: </span>' + 
									prizes[x]['name'] + '<br /><span style="font-weight:bold">Prize amount: </span>' + prizes[x]['amount'] ;
						//message = message + '<br />' + messageConfirm;
						messageConfirm = $("<div />",{id: 'popupMessage'}).html(messageConfirm);
						
                        $("#contentMessage").prepend(messageConfirm);

                        setTimeout(
						function () {
						    $("#popupGames").show();
						}, 2000);

                        $("#popupGames").jqxWindow({ width: "auto", height: "auto", maxWidth: "300px", maxHeight: "300px", isModal: true, showCloseButton: true, position: 'center' });
                        break;
                    }
                }
            }

            // ADD YOUR OWN CODE HERE.
            // If no prize detection then up to you to do whatever you want when the spinning has stopped.
			getJson("POINTS.SUMMARY", HandleUpdatePointsGames);



		}			
    }
	function HandleUpdatePointsGames(data) {
		if (typeof data !== null) {
					UpdatePointAccount(data);
		}		
	}

}



