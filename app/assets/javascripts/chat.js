var dispatcher;
var room;
var currentRoomId;

// Reg expressions used
var IMAGEREGEXP = /(www\.)?\S+?\.[\w]{2,4}\/\S+\.(gif|jpg|jpeg|jpe|png|bmp|webm)/gi;


// James REGEX(soundcloub, spotify??)
var SOUNDCLOUDREGEX = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/gi;

$(document).ready(function() {
	// if someone is on the chat view
	if ($('#chat-page').length > 0){
		// connect to websocket
		dispatcher = new WebSocketRails('localhost:3000/websocket');
 	 	
 	 	// bind to websocket global events
 	 	dispatcher.bind('connected', clientConnected);
 	 	dispatcher.bind('room_created', roomCreated);
 	 	dispatcher.bind('room_failed', roomFailed);

 	 	// bind to events
 	 	$('#create_room_button').on('click', createRoom);
 	 	$('#join_room_button').on('click', joinHandler);
 	 	$('#send_button').on('click', evalText);

	}
});

// Functions bound to events from page

var evalText = function () {
	var text = $('#chat_text').val();
	//
	///
	// DO LOGIC AND SEND TO YOUR EVENTS
	////////

	// create arrays
	var imageLinks = text.match(IMAGEREGEXP);
	

	// see if text has regexp's
	if (imageLinks) {
		$.each(imageLinks, sendImage);
		sendText(text);	
	} else {
		sendText(text);	
	}

};
var joinHandler = function () {
	var roomid = $('#room_name').val();
	joinRoom(roomid);
};

// Functions that send to the server

var sendImage = function(i, imgLink) {
	var message = {
		url: imgLink, 
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_image', message);
};

var sendText = function (text) {
	var message = {
		id: userId,
		roomid: currentRoomId,
		msg: text
	};
	dispatcher.trigger('send_text', message);
};
var createRoom = function () {
	var roomName = $('#room_name').val();
	var message = {
		name: roomName
	};
	dispatcher.trigger('new_room', message);
};

var joinRoom = function (room_id) {
	if (room) {
		// stop listening to previous events and leave the room
		room.unsubscribe;
		// functions to stop listening to
		room.unbind('user_joined');
		room.unbind('user_left');
		room.unbind('new_text');
		room.unbind('new_image');

		dispatcher.unbind('new_image');
		dispatcher.unbind('new_text');
		// room.unbind('function_name', functionNameOnJs);
		// dispatcher.unbind('function_name', functionNameOnJs);

		// ADD BETWEEN HERE 
		// AND HERE

		// send a message to people in the PREVIOUS room that someone has LEFT
		var leavemessage = {
			name: userName,
			roomid: currentRoomId 
		};
		dispatcher.trigger('left_room', leavemessage);
	}

	// join the room
	room = dispatcher.subscribe(room_id);
	console.log('joined room ' + room_id);
	currentRoomId = room_id;
	$('#chat-view').empty();

	// listen to room events
	room.bind('user_joined', userJoinedRoom);
	room.bind('user_left', userLeftRoom);
	room.bind('new_text', displayText);
	room.bind('new_image', displayImg);

	dispatcher.bind('new_image', displayImg);
	dispatcher.bind('new_text', displayText);

	// room.bind('function_name', functionNameOnJs);
	// dispatcher.bind('function_name', functionNameOnJs);

	// AND BETWEEN HERE
	// AND HERE


	// message to send to server
	var message = {
		id: userId,
		room_joined: room_id
	};

	// tell server we have joined
	dispatcher.trigger('join_room', message);

};

// Functions called from server

var clientConnected = function() {
	console.log('Client connected to websocket');
};

var roomCreated = function (message) {
	console.log(message.name + ' room created');
	console.log(message.id);
	joinRoom(message.id);
};

var roomFailed = function (message) {
	console.log('Room failed to be created');
};

var userJoinedRoom = function (message) {
	var name = message.name;
	console.log(name + ' has entered the room');
};

var userLeftRoom = function (message) {
	var name = message.name;
	console.log(name + ' has left the room');
}

var displayText = function (message) {
	var source = $('#text_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').prepend(displayHTML(message));
};

var displayImg = function(message) {
	var source = $('#image_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').prepend(displayHTML(message));
};