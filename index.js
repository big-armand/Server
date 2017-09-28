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

var jsonTodo = null;

app.ioTodo = io.of('/todo');

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
	var todoList = fs.readFileSync('todo.json', 'utf-8');
	if (todoList != null) {
		jsonTodo = JSON.parse(todoList);
		jsonTodo.forEach(function (item) {
			io.of('/todo').to(socket.id).emit('addOneTodo', item);
		});
	}


	var tobuyList = fs.readFileSync('tobuy.json', 'utf-8'),
		jsonTobuy = JSON.parse(tobuyList);
	jsonTobuy.forEach(function (item) {
		io.of('/todo').to(socket.id).emit('addOneTobuy', item);
	});

	socket.on('addTodo', function (item) {
		var todoList = fs.readFileSync('todo.json', 'utf-8');
		if (todoList != null) {
			jsonTodo = JSON.parse(todoList);
			jsonTodo.push(item);
			todoList = JSON.stringify(jsonTodo);
			fs.writeFile('todo.json', todoList, 'utf8', function (err) {
				if (err) throw err;
			});
			io.of('/todo').emit('addOneTodo', item);
		}
	});

	socket.on('changedTodo', function () {
		io.of('/todo').emit('changedTodo');
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

	.get('/todo/suppr/:id', function (req, res) {
		if (req.params.id != "") {
			jsonTodo = fs.readFileSync('todo.json', 'utf-8');
			if (jsonTodo != null) {
				var arrayTodo = JSON.parse(jsonTodo);
				arrayTodo.splice(req.params.id, 1);
				jsonTodo = JSON.stringify(arrayTodo);
				fs.writeFile('todo.json', jsonTodo, 'utf8', function (err) {
					if (err) throw err;
				});
			}
		}
		req.app.ioTodo.emit('changeTodo', req.params.id);
		res.redirect("/todo");
	})

	/* redirige vers l'accueil si la page demandée n'est pas trouvée */
	.use(function (req, res, next) {
		res.redirect('/');
	});

server.listen(8080);
