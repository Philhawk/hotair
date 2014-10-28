var dispatcher;
var room;
var currentRoomId;
var recentRooms = [];
var commandsList = [];
// Reg expressions used

var EMBEDREGEXP = /(https?:\/\/|www)\S+/g;

// List your commands here
var commands = [
	'map',
	'time',
	'movie',
	'flip',
	'code',
	'nudge',
	'search',
	'gif',
	'transport',
	'wiki',
	'goto',
	'recipe',
	'fact',
	'roll',
	'fortune'
];

$(document).ready(function() {
	// if someone is on the chat view
	if ($('#chat-page').length > 0){
		// connect to websocket
		dispatcher = new WebSocketRails('localhost:3000/websocket');

		// listen to commands
		$.each(commands, function(i, command) {
			commandsList.push('new_'+ command);
		});


 	 	// bind to websocket global events
 	 	dispatcher.bind('connected', clientConnected);
 	 	dispatcher.bind('room_created', roomCreated);
 	 	dispatcher.bind('room_failed', roomFailed);
 	 	dispatcher.bind('show_rooms', displayRooms);
 	 	dispatcher.bind('scroll_chat', scrollChat);
 	 	dispatcher.bind('show_recent_rooms', showRecentRooms);
 	 	dispatcher.bind('update_recent_rooms', updateRecentRooms);

 	 	// bind to events
 	 	$('#show_create_room_button').on('click', showCreateRoom);
 	 	$('#create_room_button').on('click', createRoom);
 	 	// $('#join_room_button').on('click', joinHandler);
 	 	$('#send_button').on('click', evalText);
 	 	$('#show_rooms_button').on('click', getRooms);
 	 	$('#chat-view').on('click', '.roomRow a', joinHandler);
 	 	$('#chat-page').on('click', '.recentRoom>a', joinHandler);
 	 	$('#chat-page').on('click', '.removeRecent>a', removeRecent);


 	 	// get rooms
 	 	getRooms();
 	 	getRecentRooms();
	}
});


var sendCommand = function (type) {
	return function (value) {
		var message = {
			id: userId,
			roomid: currentRoomId
		};
		message[type] = value;
		dispatcher.trigger('send_' + type, message);
	}
};


// display command generator

var displayCommand = function(type) {
	return function(message) {
		cmd = type.replace('new_', "");
		var source = $('#' + cmd + '_template').html();
		var displayHTML = Handlebars.compile(source);

		$('#chat-view').append(displayHTML(message));
	}
};

// Functions bound to events from page
var evalText = function () {
	var text = $('#chat_text').val();

	var embedLinks = text.match(EMBEDREGEXP);

	if (embedLinks) {
		sendText(text);
		$.each(embedLinks, sendEmbed);
	} else {
		sendText(text);
	}

	$.each(commands, function(i, command){
		var commandArgs = text.split('/' + command)
		if (commandArgs.length > 1) {
			if (commandArgs[0]) {
				sendCommand('text')(commandArgs[0]);
			}
			sendCommand(command)(commandArgs[1].trim());
		}
	});

	$('#chat_text').val("");
};

var joinHandler = function(ev) {
	ev.preventDefault();
	var roomID = $(this).attr('href');
	joinRoom(roomID);
};

// Functions that send to the server
// nicks stuff
var getRooms = function() {
	var message = {
	};
	dispatcher.trigger('get_rooms', message);
};

var getRecentRooms = function () {
	var message = {
		id: userId,
		recent_rooms: recentRooms
	};
	dispatcher.trigger('get_recent_rooms',message);
};


var sendEmbed = function(i, embedLink) {
	var message = {
		url: embedLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_embed', message);
};

var sendText = sendCommand('text');

var showCreateRoom = function () {
	// var roomName = $('#room_name').val();
	// var message = {
	// 	name: roomName
	// };
	// dispatcher.trigger('new_room', message);
	$('#newRoomModal').foundation('reveal', 'open');
};

var createRoom = function () {
	var roomName = $('#room_name').val();
	var message = {
		name: roomName
	};
	dispatcher.trigger('new_room', message);
	$('#newRoomModal').foundation('reveal', 'close');
};

var leaveRoom = function(){
 // stop listening to previous events and leave the room
	room.unsubscribe;

	$.each(commandsList, function(i, command){
			room.unbind(command);
			dispatcher.unbind(command);
	});

	var leavemessage = {
		name: userName,
		id: userId,
		roomid: currentRoomId
	};
	dispatcher.trigger('left_room', leavemessage);
};

var joinRoom = function (room_id) {
	if (room) {
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

	$.each(commandsList, function(i, command){
		room.bind(command, displayCommand(command));
		dispatcher.bind(command, displayCommand(command));
	});

	// listen
	room.bind('new_text');

	// unbind lawrences for now
	room.unbind('new_code');
	room.unbind('new_nudge');
	dispatcher.unbind('new_code');

	room.bind('room_details', displayRoomDetails);
	room.bind('scroll_chat', scrollChat);

 //lawrence
	room.bind('new_code', displayCode);
	room.bind('new_nudge', displayNudge);


	dispatcher.bind('new_code', displayCode);

	var message = {
		id: userId,
		room_joined: room_id
	};
		// tell server we have joined
	dispatcher.trigger('join_room', message);

	// add to recently joined
	recentRooms.push(room_id);
	recentRooms = _.uniq(recentRooms);
	getRecentRooms();
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
};

// NICKS DISPLAY
var showRecentRooms = function(message) {
	rooms = jQuery.parseJSON(message);

	var source = $('#recent_rooms_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#recentRoomNav').empty();

	$.each(rooms, function(i, roomObj){
		$('#recentRoomNav').append(displayHTML(roomObj));
	});
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

	var displayRoomsDetailsMessage = {
		name: "Room List",
		topic: "Click a room to join"
	};
	displayRoomDetails(displayRoomsDetailsMessage);
	$.each(rooms, function(i, roomObj){
		$('#chat-view').append(displayHTML(roomObj));
	});
};

var displayRoomDetails = function(message) {
	var source = $('#room_details_template').html();
	var displayHTML = Handlebars.compile(source);
	$('#topBar').empty();
	$('#topBar').append(displayHTML(message));
};

//lawrence
var displayCode = function(message) {
	var source = $('#code_template').html();
	var displayHTML = Handlebars.compile(source);
	$('#chat-view').append(displayHTML(message));

	$('pre code').each(function(i, msg) {
    hljs.highlightBlock(msg);
	});
};


var displayNudge = function (message) {
		var $html = $('div').addClass('shake');
			setTimeout(function () {
  	$html.removeClass('shake');
		}, 800);
};

//lawrence end

var scrollChat = function() {
	var $chat = $('#chat-view');
	$chat.scrollTop($chat[0].scrollHeight);
};

var removeRecent = function(ev) {
	ev.preventDefault();
	var roomID = $(this).attr('href');
	console.log(roomID);
	recentRooms = _.without(recentRooms,roomID);
	if (currentRoomId === roomID) {
		getRooms();
	}
	getRecentRooms();
};

var updateRecentRooms = function(message) {
	recentRooms = message;
};
