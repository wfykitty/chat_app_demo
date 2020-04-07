
$(function(){
   	//make connection
	var socket = io.connect('http://localhost:5000')

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var connected = $("#connected")
	var disconnected = $("#disconnected")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	var room1Bth = $("#room1")
	var room2Bth = $("#room2")
	const eventLogButton = $("#event_log");


	//room channel 
	room1Bth.click(() => {
		socket.emit('room1Bth', {message : "joined the room1 sucessfully"});
		console.log("user joined the room1");
		;
	});
	room2Bth.click(() => {
		socket.emit('room2Bth', {message : "joined the room2 sucessfully"});
		console.log("user joined the room2");
	});



///////////
////event log 

	eventLogButton.click(() => {
		socket.emit('eventLog');
		console.log("event hapening");
	})
	

	//Emit message
	send_message.click(function(){
		console.log('Clicked');
		socket.emit('new_message', {message : message.val(),
	 })
	})
	//Emit connection and disconnection
	connected.click(function(){
		socket.emit('connected', {message : "connected sucessafully"})
	})
	disconnected.click(function(){
		socket.emit('disconnected', {message : "disconnected"})
	})
 
	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})
	//Listen on connection and disconnection
	socket.on("connected", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + "has connected to the room" )
	})
	socket.on("disconnected", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + "has disconnected to the room" )
	})
	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})
	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})
	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});

 