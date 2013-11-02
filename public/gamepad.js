var Gamepad = {
  callback : null,
  data: {
    joystick: {
      0: {
	X: null,
        Y: null,
	C: false,
      },
      1: {
	X: null,
	Y: null,
	C: false,
      },
    },
    button : {
      A : false,
      B : false,
      X : false,
      Y : false,
      L_SH : false,
      R_SH : false,
      L_TR : false,
      R_TR : false,
      START : false,
      BACK : false,
      D_UP : false,
      D_DOWN : false,
      D_LEFT : false,
      D_RIGHT : false,
      HOME : false,
    }
  }
};

Gamepad.init = function(callback) {
  Gamepad.callback = callback;

  var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

  if(!gamepadSupportAvailable) {
    return false;
  } else {
    window.setInterval(this.update,500);
    return true;
  }
}

Gamepad.update = function() {
  var gamepad = navigator.webkitGetGamepads()[1];

  var axes = gamepad.axes;
  var buttons = gamepad.buttons;

  Gamepad.data.joystick[0].X = axes[0];
  Gamepad.data.joystick[0].Y = axes[1];
  Gamepad.data.joystick[0].C = buttons[10] ? true : false;
  Gamepad.data.joystick[1].X = axes[2];
  Gamepad.data.joystick[1].Y = axes[3];
  Gamepad.data.joystick[1].C = buttons[11] ? true : false;

  Gamepad.data.button['A'] = buttons[0] ? true : false;
  Gamepad.data.button['B'] = buttons[1] ? true : false;
  Gamepad.data.button['X'] = buttons[2] ? true : false;
  Gamepad.data.button['Y'] = buttons[3] ? true : false;
  Gamepad.data.button['L_SH'] = buttons[4] ? true : false;
  Gamepad.data.button['R_SH'] = buttons[5] ? true : false;
  Gamepad.data.button['L_TR'] = buttons[6] ? true : false;
  Gamepad.data.button['R_TR'] = buttons[7] ? true : false;
  Gamepad.data.button['BACK'] = buttons[8] ? true : false;
  Gamepad.data.button['START'] = buttons[9] ? true : false;
  Gamepad.data.button['D_UP'] = buttons[12] ? true : false;
  Gamepad.data.button['D_DOWN'] = buttons[13] ? true : false;
  Gamepad.data.button['D_LEFT'] = buttons[14] ? true : false;
  Gamepad.data.button['D_RIGHT'] = buttons[15] ? true : false;
  Gamepad.data.button['HOME'] = buttons[16] ? true : false;

  if(Gamepad.callback != null){
    Gamepad.callback(Gamepad.data);
  }
}
