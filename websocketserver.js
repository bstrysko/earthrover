var ws = require('ws');
var WSServer =  ws.Server;

function WebSocketServer(port, callback){
  port = port || 8080;

  this.wss = new WSServer({port: port});
    
  this.wss.broadcast = function(data){
    for(var i in this.clients){
      this.clients[i].send(data);
    }
  }

  this.wss.on('connection', function(ws){
    ws.on('message', function(message){
      try {
	message = JSON.parse(message);
      } catch(e) {
	return;
      }
  
      callback(message);
    });
  });
}

WebSocketServer.prototype.send = function(o){
  this.wss.broadcast(JSON.stringify(o));
}

module.exports = WebSocketServer;
