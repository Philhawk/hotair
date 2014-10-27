var dispatcher;
var room;
var currentRoomId;

// Reg expressions used

var EMBEDREGEXP = /(https?:\/\/|www)\S+/g;

$(document).ready(function() {
	// if someone is on the chat view
	if ($('#chat-page').length > 0){
		// connect to websocket
		dispatcher = new WebSocketRails('localhost:3000/websocket');

 	 	// bind to websocket global events
 	 	dispatcher.bind('connected', clientConnected);
 	 	dispatcher.bind('room_created', roomCreated);
 	 	dispatcher.bind('room_failed', roomFailed);
 	 	dispatcher.bind('show_rooms', displayRooms);
 	 	

 	 	// bind to events
 	 	$('#create_room_button').on('click', createRoom);
 	 	// $('#join_room_button').on('click', joinHandler);
 	 	$('#send_button').on('click', evalText);
 	 	$('#show_rooms_button').on('click', getRooms);
 	 	$('#chat-view').on('click', '.roomRow a', joinHandler);

 	 	// get rooms
 	 	getRooms();

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
	var embedLinks = text.match(EMBEDREGEXP);
	var timeCommand = text.split('/time');
	var mapsCommand = text.split('/maps ');
	var codeCommand = text.split('/code ');
	var searchCommand = text.split('/search');


	// see if text has regexp's
	if (embedLinks) {
		sendText(text);
		$.each(embedLinks, sendEmbed);
	} else if (timeCommand.length > 1) {
			if (timeCommand[0]) {
				sendText(timeCommand[0]);
			}
		sendTimeCommand(timeCommand[1]);
	} else if (mapsCommand.length > 1) {
			if (mapsCommand[0]) {
				sendText(mapsCommand[0]);
			}
		sendMapsCommand(mapsCommand[1]);
	} else if (codeCommand.length > 1) {
		if (codeCommand[0]) {
			sendText(timeCommand[0])
		}
		sendCodeCommand(codeCommand[1]);
	} else if (searchCommand.length > 1) {
			if (searchCommand[0]) {
				sendText(searchCommand[0]);
			}
		sendSearchCommand(addressCommand[0]);
	} else {
		sendText(text);
	}
};

var joinHandler = function(ev) {
	ev.preventDefault();
	var roomID = $(this).attr('href');
	joinRoom(roomID);
};

// Functions that send to the server
// nicks stuff
var sendTimeCommand = function(gmt) {
	var message = {
		id: userId,
		roomid: currentRoomId,
		gmt: gmt
	};
	dispatcher.trigger('send_time', message);
};
var getRooms = function() {
	var message = {

	};
	dispatcher.trigger('get_rooms', message);
};
// nick end

// james
var sendSearchCommand = function(search) {
	var message = {
		id: userId,
		roomid: currentRoomId,
		search: search
	};
	dispatcher.trigger('send_search', message);
}
// james end

//phil

var sendMapsCommand = function(map) {
	var message = {
		id: userId,
		roomid: currentRoomId,
		map: map
	};
	dispatcher.trigger('send_map', message);
}

// phil end

//lawrence
var sendCodeCommand = function (code) {
	var message = {
		id: userId,
		roomid: currentRoomId,
		code: code
	}
	dispatcher.trigger('send_code', message);
};

//lawrence end

// dont touch this ---------------------
var sendEmbed = function(i, embedLink) {
	var message = {
		url: embedLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_embed', message);
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

var leaveRoom = function(){
// stop listening to previous events and leave the room
	room.unsubscribe;
	// functions to stop listening to
	room.unbind('user_joined');
	room.unbind('user_left');
	room.unbind('new_text');
	room.unbind('new_embed');
	room.unbind('new_time');
	room.unbind('room_details');

	dispatcher.unbind('new_embed');
	dispatcher.unbind('new_text');
	dispatcher.unbind('new_time');

	// ADD BETWEEN HERE
	// AND HERE

	// send a message to people in the PREVIOUS room that someone has LEFT
	var leavemessage = {
		name: userName,
		id: userId,
		roomid: currentRoomId
	};
	dispatcher.trigger('left_room', leavemessage);
};
var joinRoom = function (room_id) {
	if (room) {
		// stop listening to previous events and leave the room
		room.unsubscribe;
		// functions to stop listening to
		room.unbind('user_joined');
		room.unbind('user_left');
		room.unbind('new_text');
		room.unbind('new_embed');
		room.unbind('new_time');
		room.unbind('new_map');

		dispatcher.unbind('new_embed');
		dispatcher.unbind('new_text');
		dispatcher.unbind('new_time');
		dispatcher.unbind('new_map');

		// ADD BETWEEN HERE
		// AND HERE

		// send a message to people in the PREVIOUS room that someone has LEFT
		var leavemessage = {
			name: userName,
			roomid: currentRoomId
		};
		dispatcher.trigger('left_room', leavemessage);
		leaveRoom();
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
	room.bind('new_embed', displayEmbed);
	room.bind('new_time', displayTime);
	room.bind('room_details', displayRoomDetails);

	// james

	// james end


	//phil
	room.bind('new_map', displayMap);

	//phil


	// phil end

	//lawrence

	//lawrence end

	dispatcher.bind('new_text', displayText);
	dispatcher.bind('new_embed', displayEmbed);
	dispatcher.bind('new_time', displayTime);

		// AND BETWEEN HERE

	// james

	// james end

	//phil


	dispatcher.bind('new_map', displayMap);

	// phil end


	//lawrence

	//lawrence end

		// AND HERE


		// message to send to server
		var message = {
			id: userId,
			room_joined: room_id
		};
		// tell server we have joined
		dispatcher.trigger('join_room', message);


	};
	// end dont touch this ---------------------------


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
};

var displayText = function (message) {
	var source = $('#text_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
	scrollChat();
};

var displayEmbed = function(message) {
	var source = $('#embed_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

// NICKS DISPLAY
var displayTime = function(message) {
	var source = $('#time_template').html()
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayRooms = function(message) {
	if (room) {
		leaveRoom();
		$('#topBar').empty();
	}
	rooms = jQuery.parseJSON( message );
	var source = $('#room_template').html();
	var displayHTML = Handlebars.compile(source);
	$('#chat-view').empty();
	$.each(rooms, function(i, roomObj){
		$('#chat-view').append(displayHTML(roomObj));
	});
};

var displayRoomDetails = function(message) {
	console.log(message)
	var source = $('#room_details_template').html();
	var displayHTML = Handlebars.compile(source);
	$('#topBar').empty();
	$('#topBar').append(displayHTML(message));
};
// END

// james

// james end

//phil

var displayMap = function(message) {
	var source = $('#map_template').html()
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};


// phil end

//lawrence

//lawrence end

var scrollChat = function() {
	var $chat = $('#chat-view');
	$chat.animate({ scrollTop: $chat.height() }, "slow");
}
