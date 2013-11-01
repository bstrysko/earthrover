var WebServer = require('./webserver');
var WebSocketServer = require('./websocketserver');

var Camera = require('./camera');
var Motor = require('./motor');

Camera.init();

var routes = {
  '/api' : function(req, res){
    res.send('Welcome to Earthrover API');
  },
  '/api/motors' : function(req, res){
    res.send(Motor.getStatus());
  },
  '/api/camera' : function(req, res){
    res.header("Content-Type", "image/png");
    res.send(Camera.getFrame());
  },
}
var webServer = new WebServer(80,routes);

var webSocketServer = new WebSocketServer(8080,function(data){
  var type = data['type'];
  var args = data['args'];

  if((typeof(type) !== 'undefined') && 
      typeof(args) !== 'undefined'){
    switch(type){
      case 'drive':{
	var left = args['left'] || 0.0;
	var right = args['right'] || 0.0;

	Motor.setLeft(left);
	Motor.setRight(right);
      }
    }
  }
});

Camera.registerFrameHandler(function(frame){
  console.log("Frame received");
  //webSocketServer.send(frame);
});

