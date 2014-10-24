class RoomController < WebsocketRails::BaseController
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

	def new_text
		
		user_id = message['id']
		room_id = message['roomid']
		text = message['msg']

		user = User.find user_id 
		room = Room.find room_id 

		message = {
			name: user.name,
			text: text
		}

		msg_in_db = put_message_in_db(message, 'new_text')

		user.messages << msg_in_db
		room.messages << msg_in_db

		WebsocketRails[room_id].trigger(:new_text, message)
	end

	def set_topic
	end

private
	# Storing the entire message and the function associated with it
	def put_message_in_db(message, fn)
		msg = Message.new(user_id: message['id'], room_id: message['roomid'], object: message.to_s, function: fn)
		msg.save 
		msg
	end 
end