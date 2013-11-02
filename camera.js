var Camelot = require('camelot');

var Camera = {
  camelot : null,
  frame : null,
  errorHandlers : [],
  frameHandlers : [],
};

Camera.init = function(device, freq){
  device = device || "/dev/video0";
  freq = freq || 1;

  Camera.camelot = new Camelot( {
    'verbose': false,
    'device' : '/dev/video0',
    'resolution' : '176x144',
    'title' : '',
    'greyscale' : true,
  //  'rotate' : '180',
  //  'flip' : 'v'
  });

  Camera.camelot.on('frame', function (image) {
    console.log("Frame received");

    Camera.frame = image;

    for(var i in Camera.frameHandlers){
      Camera.frameHandlers[i](image);
    }
  });

  Camera.camelot.on('error', function (err) {
    for(var i in Camera.errorHandlers){
      Camera.errorHandlers[i](err);
    }
  });

  Camera.camelot.grab({
    'frequency' : freq,
  });

}

Camera.registerFrameHandler = function(f){
  Camera.frameHandlers.push(f);
}

Camera.registerErrorHandler = function(e){
  Camera.errorHandlers.push(e);
}

Camera.getFrame = function(){
  return Camera.frame;
}

module.exports = Camera;
