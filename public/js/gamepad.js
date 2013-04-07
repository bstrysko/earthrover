/*
 * gamepad.js
 * Written by Brent Strysko
 * EarthRover Project
 *
 * Contains wrapper code used to get data from the connected gameped(Xbox 360 controller).
 * The ondata function stub should be overwritten by the controlling logic.
 * Only works with Chrome for the moment.
 */
//TODO: add Firefox support

/*
 * Holds the gamepads data since the last poll.
 */
var Gamepad = {
	detected: false,
	data:
	{
		joystick: 
		{
			0: {
				X: null,
			        Y: null,
			},
			1: {
				X: null,
				Y: null,
			},
		},
	}
};

/*
 * Initializes gamepad polling.  The data will not be valid until the user
 * presses a button. 
 */
Gamepad.init = function()
{
	var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

	if(!gamepadSupportAvailable) 
	{
		return false;
	}
	else
	{
		window.setInterval(this.update,100);
		return true;
	}
}

/*
 * Polling function.
 */
Gamepad.update = function()
{
	var gamepad = navigator.webkitGetGamepads()[0];

	/*
	 * Only check for data is the gamepad is visible
	 * to the API.
	 */
	if(gamepad)
	{
		if(!Gamepad.detected)
		{
			alert("Gamepad.update");
			Gamepad.detected = true;
			Gamepad.onDetect();
		}

		Gamepad.data.joystick[0].X = gamepad.axes[0];
		Gamepad.data.joystick[0].Y = gamepad.axes[1];
		Gamepad.data.joystick[1].X = gamepad.axes[2];
		Gamepad.data.joystick[1].Y = gamepad.axes[3];

		Gamepad.onUpdate(Gamepad.data);
	}
}

/*
 * Returns true if a gamepad was detected.
 * Has its own function so input.js and other 
 * files need not depend on internal representation
 * of Gamepad.
 */
Gamepad.detected = function()
{
	return Gamepad.detected;
}

/*
 * Function stub and should be overwritten by controlling logic.
 * Called when the first gamepad is first detected.
 */
Gamepad.onDetect = function(){}

/*
 * Function stub and should be overwritten by controlling logic.  
 * Called after every poll.
 */
Gamepad.onUpdate = function(data){};
