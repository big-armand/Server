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


/* On utilise les sessions */
app.use(express.static(__dirname + '/chat'))
	.use(express.static(__dirname + '/todoList'))
	.use(session({
		secret: 'topsecret'
	}))


	/* S'il n'y a pas de todolist dans la session,
	on en crée une vide sous forme d'array avant la suite */
	/*.use(function (req, res, next) {
	if (typeof (req.session.todolist) == 'undefined') {req.session.todolist = [];}
	next();
	})*/

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

	/* redirige l'accueil si la page demandée n'est pas trouvée */
	.use(function (req, res, next) {
		res.redirect('/');
	})

	.listen(8080);

io.on('connection', function (socket) {
	socket.on('pseudo', function (clientName) {
		io.emit('org msg', clientName + " connected");
	})
	socket.on('sender name', function (senderName) {
		io.emit('sender name', senderName);
	});
	socket.on('chat message', function (msg) {
		io.emit('chat message', msg);
	});
});
