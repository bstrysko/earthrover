var express = require('express');

function WebServer(port,routes){
  var app = express();

  app.use(app.router);
  app.use(express.static(__dirname + "/public"));

  for(var route in routes) {
    app.get(route,routes[route]);
  }

  app.listen(port);
}

module.exports = WebServer;
