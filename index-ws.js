const express = require('express');
const server = require('http').createServer();

const app = express();

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });

});

server.on('request', app)

server.listen(3000, function () {
    console.log('server started on port 3000');
});

process.on('SIGINT', () => {
    console.log('sig int');
    wss.clients.forEach(function each(client){
        client.close()
    })
    server.close(() => {
        shutDownDB();
    })
})


/** BEGIN - websockets */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({
    server: server
});

// Websockets has a concept of different states
wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('Client connected', numClients);
    wss.broadcast(`Current visitor: ${numClients}`)

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server');
    }

    db.run(`INSERT INTO visitors(count, time) VALUES (${numClients}, datetime('now'))`)

    ws.on('close', function close() {
        console.log('Clienr has disconnected');
    });
})

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}

/** end websockets */
/** begin database  */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:')

// Serialize command just ensures the database is setup before we run any queries
db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (error, row) => {
        console.log(row);
    })
}

function shutDownDB() {
    getCounts();
    console.log('Shutting down DB');
    db.close();
}