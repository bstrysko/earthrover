/*
 * input.js
 * Written by Brent Strysko
 *
 * Allows only either the keyboard or gamepad(if supported by the browser
 * and connected) to control the system.
 */

var Input = {
	gamepadControl: false,
};

Input.init = function()
{
	Keyboard.init();

	if(!Gamepad.init())
	{
		alert("Gamepad API not supported");
		console.log("Gamepad API not supported");	
	}
}

/*
 * If gamepadControl is true the gamepad is the controlling
 * input otherwise the keyboard is.
 */
Input.setGamepadControl = function(gamepadControl)
{
	if(!gamepadControl)
	{
		console.log("Keyboard now in control");
		Input.gamepadControl = false;
	}
	else if(Gamepad.detected)
	{
		console.log("Gamepad now in control");
		Input.gamepadControl = true;
	}
	else
	{
		console.log("Gamepad would now be in control if it was detected");
	}
}

/*
 * Wrapper function.
 */
Gamepad.onGamepadDetect = function()
{
	alert("Gamepad.onGamepadDetect");
	Input.onDetect();
}

/*
 * Function stub that should be updated by controlling logic.
 * Called when a gamepad is first detected.
 */
Input.onGamepadDetect = function(){}

/*
 * Function stub that should be updated by controlling logic.
 * Called when the controlling input has new data.
 */
Input.onUpdate = function(data){}

/*
 * Only care about keyboard data if it is the controlling input.
 */
Keyboard.onUpdate = function(key)
{
	if(!Input.gamepadControl)
	{
		Input.onUpdate(key);	
	}
}

/*
 * Only care about gamepad data if it is the controlling input.
 */
Gamepad.onUpdate = function(data)
{
	if(Input.gamepadControl)
	{
		Input.onUpdate(data);
	}
}
