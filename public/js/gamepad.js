var Gamepad = {
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

Gamepad.init = function()
{
  // As of writing, it seems impossible to detect Gamepad API support
  // in Firefox, hence we need to hardcode it in the third clause. 
  // (The preceding two clauses are for Chrome.)
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

Gamepad.update = function()
{
  var gamepad = navigator.webkitGetGamepads()[0];

  Gamepad.data.joystick[0].X = gamepad.axes[0];
  Gamepad.data.joystick[0].Y = gamepad.axes[1];
  Gamepad.data.joystick[1].X = gamepad.axes[2];
  Gamepad.data.joystick[1].Y = gamepad.axes[3];

  Gamepad.ondata(Gamepad.data);
}

Gamepad.ondata = function(data){};