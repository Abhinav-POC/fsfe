const express = require('express');
const server = require('http').createServer();

const app = express();

app.get('/', function(req,res){
    res.sendFile('index.html', {root: __dirname});

});

server.on('request', app)

server.listen(3000, function(){
    console.log('server started on port 3000');
});


/** BEGIN - websockets */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({
    server: server
});

// Websockets has a concept of different states
wss.on('connection', function connection(ws){
   const numClients = wss.clients.size;
   console.log('Client connected', numClients);
   wss.broadcast(`Current visitor: ${numClients}`)

   if(ws.readyState === ws.OPEN){
    ws.send('Welcome to my server');
   }

   ws.on('close', function close(){
    console.log('Clienr has disconnected');
   });
})

wss.broadcast = function broadcast(data){
    wss.clients.forEach(function each(client){
        client.send(data);
    });
}