var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function (socket) {
	socket.on('pseudo', function(clientName) {
		io.emit('org msg', clientName + " connected");
	})
    socket.on('sender name', function(senderName) {
        io.emit('sender name', senderName);
    });
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});



http.listen(8080, function () {
    console.log('listening on *: 8080');
});
