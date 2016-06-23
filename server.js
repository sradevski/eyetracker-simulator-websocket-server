'use strict';
var WebSocketServer = require('ws').Server,
  sleep = require('sleep'),
  isTrackerOn,
  screenWidth = 1280,
  screenHeight = 1920,
  clients = [],
  port = parseInt(process.argv[2], 10) || 8887,
  emitFrequencyMs = parseInt(process.argv[3], 10) || 30,
  wss = new WebSocketServer({
    port: port
  });

console.log('The server has started on port: ' + port);

wss.on('connection', function (ws) {
  clients.push(ws);
  console.log('a client connected');

  ws.on('close', function (code, message) {
    clients.splice(clients.indexOf(ws), 1);
    console.log('a client disconnected');
  });

  ws.on('message', function (message) {
    handleEyeNavMessage(message);
    console.log('a client sent message: "' + message + '"');
  });
});

function handleEyeNavMessage(message) {
  switch (message) {
  case 'startTracker':
    startTracker();
    break;
  case 'stopTracker':
    isTrackerOn = false;
    break;
  }
}

function startTracker() {
  isTrackerOn = true;
  var intervalEmitter = setInterval(function () {
    broadcast({
      state: 1,
      timestamp: Date.now(),
      x: ~~(Math.random() * screenWidth),
      y: ~~(Math.random() * screenHeight)
    });

    if (!isTrackerOn) {
      clearInterval(intervalEmitter);
    }
  }, emitFrequencyMs);
}

function broadcast(jsonObject) {
  clients.forEach(function (elem) {
    elem.send(JSON.stringify(jsonObject));
  });
}