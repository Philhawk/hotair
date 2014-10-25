var dispatcher;
var room;
var currentRoomId;

// Reg expressions used
var IMAGEREGEXP = /(www\.)?\S+?\.[\w]{2,4}\/\S+\.(gif|jpg|jpeg|jpe|png|bmp|webm)/gi;

var YOUTUBEREGEX = /^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{10,})/g;

var FLICKRREGEXP = /(?:https?:\/\/)?(?:www\.)?flickr.com\/\S+/g;

var WIKIREGEXP = /wikipedia.org\/wiki\/(\S+)/g;

var IMGURREGEXP = /(?:https?:\/\/)?(?:www\.)?imgur.com\/\S+/g;

// Lawrences twitter regex
var TWITTERREGEXP = /(?:https?:\/\/)?(?:www\.)?twitter.com\/\S+/g;

var VIMEOREGEXP = /(?:https?:\/\/)?(?:www\.)?vimeo.com\/\S+/g;

var INSTAGRAMREGEXP = /(?:https?:\/\/)?(?:www\.)?instagram.com\/\S+/g;

var GITHUBREGEXP = /(?:https?:\/\/)?(?:www\.)?github.com\/\S+/g;



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

	var wikiLinks = text.match(WIKIREGEXP)

	var imgurLinks = text.match(IMGURREGEXP)

	var flickrLinks = text.match(FLICKRREGEXP)

	var instaLinks = text.match(INSTAGRAMREGEXP)

	var githubLinks = text.match(GITHUBREGEXP)

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
	} else if (githubLinks) {
		sendText(text);
		$.each(githubLinks, sendGit);
	} else if (youtubeLinks) {
		sendText(text);
		$.each(youtubeLinks, sendTube);
	} else if (wikiLinks) {
		sendText(text)
		$.each(wikiLinks, sendWiki);
	} else if (flickrLinks) {
		sendText(text)
		$.each(flickrLinks, sendFlickr);
	}  else if (instaLinks) {
		sendText(text)
		$.each(instaLinks, sendInsta);
	}  else if (imgurLinks) {
		sendText(text)
		$.each(imgurLinks, sendImgur);
	}  else if (twitterLinks) {
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

var sendFlickr = function(i, flickrID) {
	var message = {
		url: flickrID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_flickr', message)
};

var sendWiki = function(i, wikiID) {
	var message = {
		url: wikiID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_wiki', message)
};

var sendGit = function(i, gitID) {
	var message = {
		url: gitID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_git', message)
};

var sendImgur = function(i, imgurID) {
	var message = {
		url: imgurID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_imgur', message)
};

var sendInsta = function(i, instaID) {
	var message = {
		url: instaID,
		id: userId,
		roomid: currentRoomId
	}
	dispatcher.trigger('send_insta', message)
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
		room.unbind('new_flickr');
		room.unbind('new_wiki');
		room.unbind('new_imgur');
		room.unbind('new_insta');
		room.unbind('new_git');

		dispatcher.unbind('new_git');
		dispatcher.unbind('new_insta');
		dispatcher.unbind('new_imgur');
		dispatcher.unbind('new_wiki');
		dispatcher.unbind('new_flickr');
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
	room.bind('new_youtube', displayYouTube)
	room.bind('new_flickr', displayFlickr)
	room.bind('new_wiki', displayWiki)
	room.bind('new_imgur', displayImgur)
	room.bind('new_insta', displayInsta)
	room.bind('new_git', displayGit)

	dispatcher.bind('new_git', displayGit);
	dispatcher.bind('new_insta', displayInsta);
	dispatcher.bind('new_imgur', displayImgur);
	dispatcher.bind('new_wiki', displayWiki);
	dispatcher.bind('new_flickr', displayFlickr);
	dispatcher.bind('new_tweet', displayTweet);
	dispatcher.bind('new_vimeo', displayVimeo);
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

var displayGit = function (message) {
	var source = $('#git_template').html();
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

var displayFlickr = function(message) {
	var source = $('#flickr_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayWiki = function(message) {
	var source = $('#wiki_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayImgur = function(message) {
	var source = $('#imgur_template').html();
	var displayHTML = Handlebars.compile(source);

	$('#chat-view').append(displayHTML(message));
};

var displayInsta = function(message) {
	var source = $('#insta_template').html();
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

