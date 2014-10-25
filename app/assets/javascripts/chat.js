var dispatcher;
var room;
var currentRoomId;

// Reg expressions used
var IMAGEREGEXP = /(www\.)?\S+?\.[\w]{2,4}\/\S+\.(gif|jpg|jpeg|jpe|png|bmp|webm)/gi;

var YOUTUBEREGEX = /^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{10,})/g;
// wikipedia.org\/wiki\/(\S+)

// var YOUTUBEREGEX = /[a-zA-Z0-9\-\_]{11}/g;


http://www.youtube.com/watch?v=s_enm5TBKSA

// Lawrences twitter regex
var TWITTERREGEXP = /(?:https?:\/\/)?(?:www\.)?twitter.com\/\S+/g;

var VIMEOREGEXP = /(?:https?:\/\/)?(?:www\.)?vimeo.com\/\S+/g;


// James REGEX(soundcloub, spotify??)
var SOUNDCLOUDREGEX = /(?:https?:\/\/)?(?:www\.)?(soundcloud.com|snd.sc)\/(.*)$/gi;

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
	var youtubeLinks = text.match(YOUTUBEREGEX);
	// create arrays
	var imageLinks = text.match(IMAGEREGEXP);

	var twitterLinks = text.match(TWITTERREGEXP);

	var vimeoLinks = text.match(VIMEOREGEXP);

	var soundCloudLink = text.match(SOUNDCLOUDREGEX);
	// see if text has regexp's
	if (imageLinks) {
		sendText(text);
		$.each(imageLinks, sendImage);
	} else if (youtubeLinks) {
		sendText(text);
		$.each(youtubeLinks, sendTube);
	} else if (twitterLinks) {
		sendText(text);
		$.each(twitterLinks, sendTweet);
	} else if (vimeoLinks) {
		sendText(text);
		$.each(vimeoLinks, sendVimeo);
	} else if (soundCloudLink) {
		sendText(text);
		$.each(soundCloudLink, sendSoundCloud);
	} else {
		sendText(text);
	}


};
var joinHandler = function () {
	var roomid = $('#room_name').val();
	joinRoom(roomid);
};

// Functions that send to the server

var sendVimeo = function(i, vimeoLink) {

	var message = {
		url: vimeoLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_vimeo', message);
};

var sendSoundCloud = function (i, soundLink) {
			console.log('sendSoundCloud');
	var message = {

		url: soundLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_sound_cloud', message);
};

var sendTweet = function(i, twitterLink) {
	var message = {
		twitter_url: twitterLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_tweet', message);
}

var sendImage = function(i, imgLink) {
	var message = {
		url: imgLink,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_image', message);
};

var sendTube = function(i, vidID) {
	var message = {
		url: vidID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_youtube', message)
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
		room.unbind('new_youtube');
		room.unbind('new_tweet');
		room.unbind('new_vimeo');
		room.unbind('new_sound');

		dispatcher.unbind('new_vimeo');
		dispatcher.unbind('new_tweet');
		dispatcher.unbind('new_youtube');
		dispatcher.unbind('new_image');
		dispatcher.unbind('new_text');
		dispatcher.unbind('new_sound');
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
	room.bind('new_tweet', displayTweet);
	room.bind('new_vimeo', displayVimeo);
	room.bind('new_sound', displaySound);

	dispatcher.bind('new_tweet', displayTweet);
	dispatcher.bind('new_vimeo', displayVimeo);

	room.bind('new_youtube', displayYouTube)

	dispatcher.bind('new_sound', displaySound);
	dispatcher.bind('new_text', displayText);
	dispatcher.bind('new_youtube', displayYouTube)
	dispatcher.bind('new_image', displayImg);


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

	$('#chat-view').append(displayHTML(message));
};

var displayImg = function(message) {
	var source = $('#image_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayTweet = function(message) {
	var source = $('#tweet_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayYouTube = function(message) {
	var source = $('#youtube_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};



var displayVimeo = function(message) {
	var source = $('#vimeo_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};



var displaySound = function(message) {
	console.log('display sound');
	var source = $('#sound_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

