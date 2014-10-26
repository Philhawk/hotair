class RoomController < WebsocketRails::BaseController
	# reg exps to use

	# LINKREGEXP = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=-]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/
	LINKREGEXP = /(https?:\/\/|www)\S+/

	def new
		room_name = message['name']
		room = Room.new(name: room_name, topic: 'Welcome!')
		if room.save
			message = {
		 	name: room.name,
		 	topic: room.topic,
		 	id: room.id.to_s
		 	}
			send_message :room_created, message
		else
		 	send_message :room_failed, message
		end
	end

	def join
		user_id = message['id'].to_i
		user = User.find user_id
		room_id = message['room_joined']
		room = Room.find room_id

		# add user to room
		room.users << user

		message = {
			name: user.name,
			id: user.id
		}

		# tell all users in that room that someone has joined
		WebsocketRails[room_id].trigger(:user_joined, message)

		# tell the user that joined the past messages
		room.messages.each do |m|
			send_message(m.function.to_sym, eval(m.object))
		end

	end

	def leave
		user_name = message['name']
		room = message['roomid']
		WebsocketRails[room].trigger(:user_left, message)
	end

	def new_image
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_image')

		WebsocketRails[room_id].trigger(:new_image, message)

	end

	def new_tweet
		user_id = message['id']
		room_id = message['roomid']
		url = message['twitter_url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_tweet')

		WebsocketRails[room_id].trigger(:new_tweet, message_to_send)

	end

	def new_vimeo
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_vimeo')

		WebsocketRails[room_id].trigger(:new_vimeo, message)

	end

	def new_youtube
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_youtube')

		WebsocketRails[room_id].trigger(:new_youtube, message_to_send)

	end

	def new_wiki
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_wiki')

		WebsocketRails[room_id].trigger(:new_wiki, message_to_send)

	end

	def new_imgur
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_imgur')

		WebsocketRails[room_id].trigger(:new_imgur, message_to_send)

	end

	def new_flickr
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_flickr')

		WebsocketRails[room_id].trigger(:new_flickr, message_to_send)

	end

	def new_insta
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_insta')

		WebsocketRails[room_id].trigger(:new_insta, message_to_send)

	end

	def new_git
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_git')

		WebsocketRails[room_id].trigger(:new_git, message_to_send)

	end

	def new_foursq
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_foursq')

		WebsocketRails[room_id].trigger(:new_foursq, message_to_send)

	end

	def new_linkedin
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_linkedin')

		WebsocketRails[room_id].trigger(:new_linkedin, message_to_send)

	end

	# Soundcloud
	def new_sound
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_sound')

		WebsocketRails[room_id].trigger(:new_sound, message)
	end

	def new_amazon
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_amazon')

		WebsocketRails[room_id].trigger(:new_amazon, message)
	end

	def new_shopstyle
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_shopstyle')

		WebsocketRails[room_id].trigger(:new_shopstyle, message)
	end

	def new_meetup
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_meetup')

		WebsocketRails[room_id].trigger(:new_meetup, message)
	end

	def new_text
		# Save data from the message into variables for easy access
		user_id = message['id']
		room_id = message['roomid']
		text = message['msg']

		# find the user from the message
		user = User.find user_id

		new_text = text.gsub(LINKREGEXP) { |link| "<a href='#{link}'>#{link}</a>" }

		# make a new message to send
		message_to_send = {
			name: user.name,
			text: new_text
		}

		# put the new message into the database, saving from the details of the message sent to the server
		put_message_in_db(message, message_to_send, 'new_text')

		# send the new message to the room
		WebsocketRails[room_id].trigger(:new_text, message_to_send)
	end


	def set_topic
	end

private
	# Storing the entire message and the function associated with it
	def put_message_in_db(message_sent, message_to_send, fn)
		# reduce boilerplate by creating associations in helper function
		msg = Message.new(user_id: message_sent['id'], room_id: message_sent['roomid'], object: message_to_send.to_s, function: fn)
		msg.save
		user = User.find message_sent['id']
		room = Room.find message_sent['roomid']
		user.messages << msg
		room.messages << msg
		msg
	end
end