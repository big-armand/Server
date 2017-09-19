const io = require('socket.io-client');
$(function () {
	var socket = io('http://localhost:8080');
	var clientName = '';
	while (clientName == '' || clientName == null) {
		clientName = prompt("Entrez votre nom");
	}
	socket.emit("pseudo", clientName);
	$('form').submit(function () {
		if (!($('#m').val() === "")) {
			socket.emit('sender name', clientName);
			socket.emit('chat message', $('#m').val());
			$('#m').val('');
		}
		return false;
	});
	socket.on('sender name', function (senderName) {
		$('#messages').append($('<dt>').text(senderName));
	});
	socket.on('chat message', function (msg) {
		$('#messages').append($('<dd>').text(msg));
		window.scrollTo(0, document.body.scrollHeight);
	});
	socket.on('org msg', function (msg) {
		$('#org').addClass("alert alert-dark").text(msg);
		setTimeout(function () {
			$('#org').empty().removeClass("alert alert-dark");
		}, 3000);
	});

});
