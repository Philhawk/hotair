var dispatcher;
var room;
var currentRoomId;
var recentRooms = [];
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

// Send command generator

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
		var source = $('#' + type + '_template').html();
		var displayHTML = Handlebars.compile(source);

		$('#chat-view').append(displayHTML(message));
	}
};

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
	var moviesCommand = text.split('/movies ');
	var recipeCommand = text.split('/recipe ');
	var moviesCommand = text.split('/movies ');
	var codeCommand = text.split('/code ');
	var searchCommand = text.split('/search ');
	var nudgeCommand = text.split('/nudge');
	var transportCommand = text.split('/transport ');
	var wikiCommand = text.split('/wiki ');
	var gotoCommand = text.split('/goto ');
	var flipCommand = text.split('/flip');
	var rollCommand = text.split('/roll');
	var randomFactCommand = text.split('/fact');
	var gifCommand = text.split('/gifme');
	var fortuneCommand = text.split('/fortune');


	// see if text has regexp's
	if (embedLinks) {
		sendText(text);
		$.each(embedLinks, sendEmbed);
	} else if (timeCommand.length > 1) {
			if (timeCommand[0]) {
				sendText(timeCommand[0]);
			}
		sendTimeCommand(timeCommand[1]);
	} else if (gotoCommand.length > 1) {
			if (gotoCommand[0]) {
				sendText(gotoCommand[0]);
			}
		sendGoToCommand(gotoCommand[1]);
	} else if (transportCommand.length > 1) {
			if (transportCommand[0]) {
				sendText(transportCommand[0]);
			}
		sendTransportCommand(transportCommand[1]);
	} else if (mapsCommand.length > 1) {
			if (mapsCommand[0]) {
				sendText(mapsCommand[0]);
			}
		sendMapsCommand(mapsCommand[1]);
	} else if (wikiCommand.length > 1) {
			if (wikiCommand[0]) {
				sendText(wikiCommand[0]);
			}
		sendWikiCommand(wikiCommand[1]);
	} else if (moviesCommand.length > 1) {
			if (moviesCommand[0]) {
				sendText(moviesCommand[0]);
			}
		sendMoviesCommand(moviesCommand[1]);
	} else if (recipeCommand.length > 1) {
			if (recipeCommand[0]) {
				sendText(recipeCommand[0]);
			}
		sendRecipeCommand(recipeCommand[1]);
	} else if (codeCommand.length > 1) {
			if (codeCommand[0]) {
				sendText(codeCommand[0])
			}
			sendCodeCommand(codeCommand[1]);
	} else if (nudgeCommand.length > 1) {
			if (nudgeCommand[0]) {
				sendText(nudgeCommand[0])
		}
  		sendNudgeCommand(nudgeCommand[1]);
	} else if (searchCommand.length > 1) {
			if (searchCommand[0]) {
				sendText(searchCommand[0]);
		}
		sendSearchCommand(searchCommand[1]);
	} else if (flipCommand.length > 1) {
		if (flipCommand[0]) {
			sendText(flipCommand[0]);
		}
		sendFlipCommand(flipCommand[1]);

	} else if (rollCommand.length > 1){
		if (rollCommand[0]) {
			sendText(rollCommand[0]);
		}
		sendRollCommand(rollCommand[1]);
	} else if (randomFactCommand.length > 1) {
			if (randomFactCommand[0]){
				sendText(randomFactCommand[0])
		}
		sendRandomFactCommand(randomFactCommand[1]);
	} else if (gifCommand.length > 1){
		if (gifCommand[0]) {
			sendText(gifCommand[0]);
		}
		sendGifCommand(gifCommand[1]);
	} else if (fortuneCommand.length > 1) {
		if (fortuneCommand[0]) {
			sendText(fortuneCommand[0]);
		}
		sendFortuneCommand(fortuneCommand[1]);
	}	else {
		sendText(text);
	}
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

var sendRollCommand = sendCommand('roll');
var sendTimeCommand = sendCommand('time');
var sendFlipCommand = sendCommand('flip');
// nick end

// james
var sendSearchCommand = sendCommand('search');
var sendGifCommand = sendCommand('gif');
// james end

//phil

var sendMapsCommand = sendCommand('map');
var sendTransportCommand = sendCommand('transport');
var sendWikiCommand = sendCommand('wiki');
var sendGoToCommand = sendCommand('directions');
var sendRecipeCommand = sendCommand('recipe');
var sendMoviesCommand = sendCommand('movie');

// phil end

//lawrence

var sendCodeCommand = sendCommand('code');
var sendNudgeCommand = sendCommand('nudge');
var sendRandomFactCommand = sendCommand('fact');
var sendFortuneCommand = sendCommand('fortune');
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
	// functions to stop listening to
	room.unbind('user_joined');
	room.unbind('user_left');
	room.unbind('new_text');
	room.unbind('new_embed');
	room.unbind('new_time');
	room.unbind('room_details');
	room.unbind('new_search');
	room.unbind('new_fact');
	room.unbind('new_gif');
	room.unbind('new_fortune');

	dispatcher.unbind('new_embed');
	dispatcher.unbind('new_text');
	dispatcher.unbind('new_time');
	dispatcher.unbind('new_search');
	dispatcher.unbind('new_fact');
	dispatcher.unbind('new_gif');
	dispatcher.unbind('new_fortune');

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
		room.unbind('new_code');
		room.unbind('new_flip');
		room.unbind('new_roll');
		room.unbind('new_fortune');

		room.unbind('new_transport');
		room.unbind('new_map');
		room.unbind('new_nudge');
		room.unbind('new_directions');
		room.unbind('new_wiki');
		room.unbind('new_recipe');
		room.unbind('new_movie');

		room.unbind('scroll_chat');

		room.unbind('new_search');
		room.unbind('new_gif');

		room.unbind('new_fact');

		dispatcher.unbind('new_fortune');
		dispatcher.unbind('new_embed');
		dispatcher.unbind('new_text');
		dispatcher.unbind('new_time');
		dispatcher.unbind('new_code');
		dispatcher.unbind('new_transport');
		dispatcher.unbind('new_map');
		dispatcher.unbind('new_recipe');
		dispatcher.unbind('new_movie');
		dispatcher.unbind('new_wiki');
		dispatcher.unbind('new_nudge');
		dispatcher.unbind('new_flip');
		dispatcher.unbind('new_roll');

		dispatcher.unbind('new_fact');

		dispatcher.unbind('new_directions');

		dispatcher.unbind('new_search');
		dispatcher.unbind('new_gif');


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
	room.bind('scroll_chat', scrollChat);
	room.bind('new_flip', displayFlip);
	room.bind('new_roll', displayRoll);


	// james
	room.bind('new_search', displaySearch);
	room.bind('new_gif', displayGif);
	// james end


	//phil
	room.bind('new_map', displayMap);
	room.bind('new_recipe', displayRecipe);
	room.bind('new_movie', displayMovie);
	room.bind('new_transport', displayTransport);
	room.bind('new_directions', displayDirections);
	room.bind('new_wiki', displayWiki);
	// phil end

 //lawrence
	room.bind('new_code', displayCode);
	room.bind('new_nudge', displayNudge);
	room.bind('new_fact', displayFact);
	room.bind('new_fortune', displayFortune);

	//lawrence end

	dispatcher.bind('new_text', displayText);
	dispatcher.bind('new_embed', displayEmbed);
	dispatcher.bind('new_time', displayTime);
	dispatcher.bind('new_flip', displayFlip);
	dispatcher.bind('new_roll', displayRoll);



		// AND BETWEEN HERE

	// james
	dispatcher.bind('new_search', displaySearch);
	dispatcher.bind('new_gif', displayGif);
	// james end

	//phil
	dispatcher.bind('new_map', displayMap);
	dispatcher.bind('new_recipe', displayRecipe);
	dispatcher.bind('new_movie', displayMovie);
	dispatcher.bind('new_directions', displayDirections);
	dispatcher.bind('new_transport', displayTransport);
	dispatcher.bind('new_wiki', displayWiki);
	// phil end


	//lawrence

	dispatcher.bind('new_code', displayCode);
	dispatcher.bind('new_fact', displayFact);
	dispatcher.bind('new_forutne', displayFortune);
	//lawrence end

		// AND HERE
				// message to send to server
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

// NICKS DISPLAY

var displayText = displayCommand('text');
var displayEmbed = displayCommand('embed');
var displayRoll = displayCommand('roll');
var displayFlip = displayCommand('flip');
var displayTime = displayCommand('time');

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
// END

// james
var displaySearch = function(message) {
	console.log(message);
	var source = $('#search_template').html();
	var displayHTML = Handlebars.compile(source);

	$.each(message.search, function(i, result) {
		result.name = message.name;
		$('#chat-view').append(displayHTML(result));
	});
};

var displayGif = displayCommand('gif');
// james end

//phil

var displayMap = displayCommand('map');
var displayTransport = displayCommand('transport');
var displayDirections = displayCommand('directions');
var displayRecipe = displayCommand('recipe');
var displayMovie = displayCommand('movie');
var displayWiki = displayCommand('wiki');

// phil end

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

var displayFact = displayCommand('fact');
var displayFortune = displayCommand('fortune');
//lawrence end

var scrollChat = function() {
	var $chat = $('#chat-view');
	$chat.scrollTop($chat[0].scrollHeight);
}

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
