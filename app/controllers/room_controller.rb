class RoomController < WebsocketRails::BaseController
	# reg exps to use

	# LINKREGEXP = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=-]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/
	LINKREGEXP = /(https?:\/\/|www)\S+/

	def new
		room_name = message['name']
		room = Room.new(name: room_name, topic: 'Welcome!')
		if room.save
			# send a message to the user that the room was created
			message = {
		 	name: room.name,
		 	topic: room.topic,
		 	id: room.id.to_s
		 	}
			send_message :room_created, message

			# send a message to all users that a new room is created
			broadcast_message :new_room_added, message 

		else
		 	send_message :room_failed, message
		end
	end

	def show
		roomsAsJSON = Room.all.to_json 
		send_message :show_rooms, roomsAsJSON
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

		# tell all users the room details
		room_details = {
			name: room.name,
			topic: room.topic,
			users: room.users.length
		}
		WebsocketRails[room_id].trigger(:room_details, room_details)
		# tell the user that joined the past messages
		room.messages.each do |m|
			send_message(m.function.to_sym, eval(m.object))
		end



	end

	def leave
		user_name = message['name']
		room_id = message['roomid']
		WebsocketRails[room_id].trigger(:user_left, message)

		user = User.find message['id']
		room = Room.find message['roomid']

		# remove association
		room.users.delete(user)

		# tell all users the room details
		room_details = {
			name: room.name,
			topic: room.topic,
			users: room.users.length
		}
		WebsocketRails[room_id].trigger(:room_details, room_details)
	end

	def new_embed
		user_id = message['id']
		room_id = message['roomid']
		url = message['url']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			url: url
		}

		put_message_in_db(message, message_to_send, 'new_embed')

		WebsocketRails[room_id].trigger(:new_embed, message)

	end

	#lawrence
	def new_code
		user_id = message['id']
		room_id = message['roomid']
		code = message['code']

		user = User.find user_id

put_message_in_db(message, message_to_send, 'new_code')

WebsocketRails[roomid].trigger(:new_code, message_to_send)

	end

	#lawrence end

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

	# NICKS
	def new_time
		user_id = message['id']
		room_id = message['roomid']
		gmt = message['gmt']

		user = User.find user_id

		localtime = Time.now.to_s

		message_to_send = {
			name: user.name,
			time: localtime
		}

		put_message_in_db(message, message_to_send, 'new_time')

		WebsocketRails[room_id].trigger(:new_time, message_to_send)

	end
	# NICKS END

	# JAMES
	def new_search
		user_id = message['id']
		room_id = message['roomid']
		search = message['search']

		user = User.find user_id

		

	  search = Google::Search::Web.new do |search|
	    search.query = query
	    search.size = :large
	    search.each_response { print '.'; $stdout.flush }
	  end
	  search.find { |item| item.uri =~ uri }

	end
	# JAMES END

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