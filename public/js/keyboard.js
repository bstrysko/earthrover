/*
 * keyboard.js
 * Written by Brent Strysko
 *
 * Detects when keys are pressed and released and keeps track of them in a
 * global object.  Calls onupdate after a press or release occurs.
 */

var Keyboard = {
	keys: {},
}

/*
 * Binds the logic to the key-press and key-release events.
 */
Keyboard.init = function()
{
	$(document).keydown(function(e){
		if(!Keyboard.keys[e.keyCode])
		{
			Keyboard.keys[e.keyCode] = true;
				console.log("keyboard.js:Keypressed");
			Keyboard.onUpdate(e.keyCode);
		}
	});

	$(document).keyup(function(e){
		Keyboard.keys[e.keyCode] = false;
			console.log("keyboard.js:Keyreleased");
		Keyboard.onUpdate(e.keyCode);
	});

	return true;
}

/*
 * Function stub that should be replaced by controlling logic.
 * Called whenever key is pressed or released.  Controlling logic
 * should check Keyboard.keys[key] to see what the new value is.
 */
Keyboard.onUpdate = function(key){}
