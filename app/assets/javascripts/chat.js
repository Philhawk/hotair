// client global vars
var dispatcher;
var room;
var currentRoomId;
var recentRooms = [];
var commandsList = [];
var usersInRoom = [];

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

		// get commands read to listen to
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

 	 	// bind to client-triggered events
 	 	$('#show_create_room_button').on('click', showCreateRoom);
 	 	$('#create_room_button').on('click', createRoom);
 	 	$('#send_button').on('click', evalText);
 	 	$('#show_rooms_button').on('click', getRooms);
 	 	$('#chat-view').on('click', '.roomRow a', joinHandler);
 	 	$('#chat-page').on('click', '.recentRoom>a', joinHandler);
 	 	$('#chat-page').on('click', '.removeRecent>a', removeRecent);
 	 	$('#chat-view').on('scroll', onChatViewScroll);
 	 	$('#chat-page').on('click', '#roomTopic', editTopic);

 	 	$(window).on('keypress', function(ev){
 	 		if (ev.charCode === 13) {
 	 			evalText();
 	 		}
 	 	});

 	 	// get rooms
 	 	dispatcher.on_open = function(data) {
			getRecentRooms();
			getRooms();
		}

	}
});

// when connected get recent rooms

// send-to-server generator for custom commands
var sendCommand = function (type) {
	// return a custom function
	return function (value) {
		// prepare the message to send to the server
		var message = {
			// provide client details such as id and room id
			id: userId,
			roomid: currentRoomId
		};
		// add the value sent to the function, with the key of the command
		message[type] = value;
		// send the function
		dispatcher.trigger('send_' + type, message);
	}
};

// display data from server generator for custom commands
var displayCommand = function(type) {
	// returns a custom function
	return function(message) {
		// get rid of the new_ that prepends commands
		cmd = type.replace('new_', "");
		// grab the template HTML from the specific ID
		var source = $('#' + cmd + '_template').html();
		// render the html with handlebars
		var displayHTML = Handlebars.compile(source);

		// append the message to the chat view
		$('#chat-view').append(displayHTML(message));
	}
};

// evaluate what text has been entered in the text field
var evalText = function () {
	// grab the text
	var text = $('#chat_text').val();

	// create an array of links that need embeding
	var embedLinks = text.match(EMBEDREGEXP);

	if (embedLinks) {
		// send the original text and the embed links
		sendText(text);
		$.each(embedLinks, sendEmbed);
	} else {
		// just send the text
		sendText(text);
	}

	// with each command, create a function that sends that command to the server, then call it with the correct
	// arguements.
	$.each(commands, function(i, command){
		var commandArgs = text.split('/' + command)
		if (commandArgs.length > 1) {
			if (commandArgs[0]) {
				sendCommand('text')(commandArgs[0]);
			}
			sendCommand(command)(commandArgs[1].trim());
		}
	});

	// reset the text field
	$('#chat_text').val("");
};

var joinHandler = function(ev) {
	// grab the room ID of the link clicked and join that room
	ev.preventDefault();
	var roomID = $(this).attr('href');
	joinRoom(roomID);
};

var getRooms = function() {
	// get a list of rooms from the server
	var message = {};
	dispatcher.trigger('get_rooms', message);
};

var getRecentRooms = function() {
	// get a list of a users 'recent rooms' from the server
	var message = {
		id: userId,
	};
	dispatcher.trigger('get_recent_rooms',message);
};

var saveRecentRooms = function() {
	var message = {
		id: userId,
		recent_rooms: recentRooms
	}
	dispatcher.trigger('save_recent_rooms',message);
}

var sendEmbed = function(i, embedLink) {
	// send an embeded link to the correct function
	var message = {
		url: embedLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_embed', message);
};

var sendText = sendCommand('text');

var showCreateRoom = function () {
	// reveal the modal that contains the new room form
	$('#newRoomModal').foundation('reveal', 'open');
};

var createRoom = function () {
	// use form data to create the room
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

	// unbind each command in the command list
	$.each(commandsList, function(i, command){
			room.unbind(command);
			dispatcher.unbind(command);
	});

	// unbind from other functions

	dispatcher.unbind('new_text');
	dispatcher.unbind('new_embed');

	room.unbind('new_embed');
	room.unbind('new_text');
	room.unbind('scroll_chat');
	room.unbind('room_details');
	room.unbind('user_joined', userJoinedRoom);
	room.unbind('user_left', userLeftRoom);

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

	// listen to text and embed
	room.bind('new_text', displayCommand('text'));
	dispatcher.bind('new_text', displayCommand('text'));
	room.bind('new_embed', displayCommand('embed'));
	dispatcher.bind('new_embed', displayCommand('embed'));

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
	saveRecentRooms();
};

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
	var source = $('#users_in_room_template').html();
	var displayHTML = Handlebars.compile(source);
	$('.userList').empty();
	$('.userList').append(displayHTML(message));
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
	if (($chat[0].scrollHeight - $chat.scrollTop()) < 600 ){

		$chat.scrollTop($chat[0].scrollHeight);
	}
};

var removeRecent = function(ev) {
	ev.preventDefault();
	var roomID = $(this).attr('href');
	console.log(roomID);
	recentRooms = _.without(recentRooms,roomID);
	if (currentRoomId === roomID) {
		getRooms();
	}
	saveRecentRooms();
};

var updateRecentRooms = function(message) {
	recentRooms = message;
};
// lawrence
var editTopic = function () {
	var $topic = $(this);
	var topicText = $topic.text();

	if ($topic.find('input').length) {
	  return;
  }

	var $input = $('<input>').val(topicText);

  $input.on('blur', function () {

	  var topicText = $(this).val();
	  $topic.html(topicText);
	  // AJAX here to send to the server
		var message = {
			id: userId,
			roomid: currentRoomId,
			topic: topicText
		};
  dispatcher.trigger('edit_topic', message)
	});
	$topic.html($input);
	$input.focus();
};
// lawrence end
// James Start
var getNewChatViewData = function () {
  offset += 3;
  console.log("Offset: ", offset);
  var message = {
    offset: offset,
    limit: limit,
    roomid: currentRoomId
  };
  dispatcher.trigger('get_chat_data', message);
}

var onChatViewScroll = function  () { // checks the scroll on the page
		var docHeight = $(document).height();
		var chatViewHeight = $('#chat-view').height();
    var scrolled = $(this).scrollTop();
    console.log( $(this).scrollTop() );
    // if ( scrolled < 80 ) {
    if (scrolled < docHeight - 0.9 * chatViewHeight) {
    	console.log('Firing for more pictures');
      getNewChatViewData();
    }
}

var offset = 0, // inital value
    limit = 10;
// James end
