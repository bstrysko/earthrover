var child_process = require('child_process');
var exec = child_process.exec;

var Motor = {
  dev : '/dev/pi-blaster',
  LEFT_FORWARD : 1, 
  LEFT_BACKWARD : 4,
  RIGHT_FORWARD : 2,
  RIGHT_BACKWARD : 5, 
};

function setPWM(channel, freq){
  exec("echo '"+channel+"="+freq+"' > " + Motor.dev,
    function(error,stdout,stderror){}
  )
}

function setLeftForward(freq){
  setPWM(Motor.LEFT_FORWARD,freq);
}

function setLeftBackward(freq){
  setPWM(Motor.LEFT_BACKWARD,freq);
}

function setRightForward(freq){
  setPWM(Motor.RIGHT_FORWARD,freq);
}

function setRightBackward(freq){
  setPWM(Motor.RIGHT_BACKWARD,freq);
}

function boundCheck(v){
  if(v > 1.0){
    v = 1.0;
  } else if(v < -1.0){
    v = -1.0;
  }

  return v;
}

Motor.setLeft = function(v){
  v = boundCheck(v);

  if(v > 0){
    setLeftForward(v);
    setLeftBackward(0);
  } else if(v < 0) {
    setLeftForward(0);
    setLeftBackward(-v);
  } else {
    setLeftForward(0);
    setLeftBackward(0);
  }
}

Motor.setRight = function(v){
  v = boundCheck(v);

  if(v > 0){
    setRightForward(v);
    setRightBackward(0);
  } else if(v < 0) {
    setRightForward(0);
    setRightBackward(-v);
  } else {
    setRightForward(0);
    setRightBackward(0);
  }
}



module.exports = Motor;
