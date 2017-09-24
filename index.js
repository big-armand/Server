var express = require('express'),
	session = require('cookie-session'),
	bodyParser = require('body-parser'),
	urlencodedParser = bodyParser.urlencoded({
		extended: false
	}),

	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	ent = require('ent'),
	fs = require('fs');

var json = {
	marque: 'Lamborgini',
	modele: 'Gallardo'
};

io.of('/chat').on("connection", function (socket) {
	socket.on('pseudo', function (clientName) {
		io.of('/chat').emit('org msg', clientName + " connected");
	})
	socket.on('sender name', function (senderName) {
		io.of('/chat').emit('sender name', senderName);
	});
	socket.on('chat message', function (msg) {
		io.of('/chat').emit('chat message', msg);
	});
});

io.of('/todo').on("connection", function (socket) {
	var todoList = fs.readFileSync('todo.json', 'utf-8'),
		jsonTodo = JSON.parse(todoList);
	jsonTodo.forEach(function (item) {
		io.of('/todo').to(socket.id).emit('addOneTodo', item);
	});

	var tobuyList = fs.readFileSync('tobuy.json', 'utf-8'),
		jsonTobuy = JSON.parse(tobuyList);
	jsonTobuy.forEach(function (item) {
		io.of('/todo').to(socket.id).emit('addOneTobuy', item);
	});

	socket.on('addTodo', function (item) {
		jsonTodo.push(item);
		todoList = JSON.stringify(jsonTodo);
		fs.writeFile('todo.json', todoList, 'utf8', function (err) {
			if (err) throw err;
		});
		io.of('/todo').emit('addOne', item);
	});

});

app.use(express.static(__dirname + '/chat'))
	.use(express.static(__dirname + '/todoList'))
	.use(session({
		secret: 'topsecret'
	}))

	/*affiche l'accueil*/
	.get('/', function (req, res) {
		res.sendFile(__dirname + '/index.html');
	})

	/*affiche le chat*/
	.get('/chat', function (req, res) {
		res.sendFile(__dirname + '/chat/chat.html');
	})

	/* affiche la todolist */
	.get('/todo', function (req, res) {
		res.sendFile(__dirname + '/todoList/todo.html');
	})

	/* redirige vers l'accueil si la page demandée n'est pas trouvée */
	.use(function (req, res, next) {
		res.redirect('/');
	});

server.listen(8080);
