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


	def get_recent_rooms
		user = User.find message['id']
		ids_of_rooms = message['recent_rooms']
		if ids_of_rooms.length < 1
			ids_of_rooms = JSON.parse(user.recent_rooms)
			send_message :update_recent_rooms, ids_of_rooms
		else
			user.recent_rooms = ids_of_rooms.to_json
			user.save
		end
		rooms = Room.find(ids_of_rooms).to_json
		send_message :show_recent_rooms, rooms
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
		# tell the user that joined the past 10 messages
		room.messages.last(10).each do |m|
			send_message(m.function.to_sym, JSON.parse(m.object))
		end

		# scroll user
		send_message(:scroll_chat, message);

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

		# scroll clients
		scroll_chat room_id
	end

	#lawrence
	def new_code
		user_id = message['id']
		room_id = message['roomid']
		code = message['code']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			code: code
		}

		put_message_in_db(message, message_to_send, 'new_code')

		WebsocketRails[room_id].trigger(:new_code, message_to_send)

		# scroll clients
		scroll_chat room_id
	end

	def new_nudge
		user_id = message['id']
		room_id = message['roomid']
		nudge = message['nudge']

		user = User.find user_id

		message_to_send = {
			name: user.name,
			nudge: nudge
		}

		# put_message_in_db(message, message_to_send, 'new_nudge')

		WebsocketRails[room_id].trigger(:new_nudge, message_to_send)

		scroll_chat room_id
	end

	def new_fact
		user_id = message['id']
		room_id = message['roomid']
		message['fact'] = ["trivia", "year", "date", "math"]
		fact = message['fact'].sample

		url = "http://numbersapi.com/random/#{fact}"
		puts "showing fact"
		fact = HTTParty.get url
		puts fact
		user = User.find user_id

		message_to_send = {
			name: user.name,
			fact: fact
		}

		put_message_in_db(message, message_to_send, 'new_fact')

		WebsocketRails[room_id].trigger(:new_fact, message_to_send)

		scroll_chat room_id
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

		# scroll clients
		scroll_chat room_id
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

		# scroll clients
		scroll_chat room_id
	end

	def new_roll
		user = User.find message['id']
		room_id = message['roomid']

		if message['max_value'].to_i == 0
			roll = 'no' + message['max_value'] + "'s"
		else
			roll = (rand(message['max_value'].to_i) + 1).floor
		end

		message_to_send = {
			name: user.name,
			roll: roll,
			max: message['max_value']
		}

		put_message_in_db(message, message_to_send, 'new_roll')

		WebsocketRails[room_id].trigger(:new_roll, message_to_send)

		scroll_chat room_id
	end

	def new_flip
		user = User.find message['id']
		room_id = message['roomid']

		heads_or_tails = rand > 0.5 ? 'heads' : 'tails'

		message_to_send = {
			name: user.name,
			result: heads_or_tails
		}

		put_message_in_db(message, message_to_send, 'new_flip')

		WebsocketRails[room_id].trigger(:new_flip, message_to_send)

		scroll_chat room_id
	end
	# NICKS END


	#PHIL

	def new_map
		user_id = message['id']
		room_id = message['roomid']
		map = message['map']

		user = User.find user_id

		new_address = "http://www.google.com.au/maps/place/#{ map.gsub(' ', '+') }"

		message_to_send = {
			name: user.name,
			address: new_address
		}

		put_message_in_db(message, message_to_send, 'new_map')

		WebsocketRails[room_id].trigger(:new_map, message_to_send)

	end

	def new_directions
		user_id = message['id']
		room_id = message['roomid']
		directions = message['directions']

		user = User.find user_id

		new_directions = "https://www.google.com/maps?saddr=My+Location&daddr=#{ directions.gsub(' ', '+') }"

		message_to_send = {
		name: user.name,
		directions: new_directions
		}

		put_message_in_db(message, message_to_send, 'new_directions')

		WebsocketRails[room_id].trigger(:new_directions, message_to_send)

	end

	def new_transport
		user_id = message['id']
		room_id = message['roomid']
		transport = message['transport']

		user = User.find user_id

		new_transport = "https://www.google.com/maps/dir/?saddr=my+location&daddr=#{ transport.gsub(' ', '+') }&ie=UTF8&f=d&sort=def&dirflg=r&hl=en"

		

		message_to_send = {
		name: user.name,
		transport: new_transport
		}

		put_message_in_db(message, message_to_send, 'new_transport')

		WebsocketRails[room_id].trigger(:new_transport, message_to_send)

	end

	def new_recipe
		user_id = message['id']
		room_id = message['roomid']
		recipe = message['recipe']

		user = User.find user_id

		new_recipe = "http://ifood.tv/search/q/#{ recipe.gsub(' ', '%20') }"

		message_to_send = {
			name: user.name,
			recipe: new_recipe
		}

		put_message_in_db(message, message_to_send, 'new_recipe')

		WebsocketRails[room_id].trigger(:new_recipe, message_to_send)

	end

	def new_wiki
		user_id = message['id']
		room_id = message['roomid']
		wiki = message['wiki']

		user = User.find user_id

		new_wiki = "http://en.wikipedia.org/wiki/#{ wiki.gsub(' ', '%20') }"

		message_to_send = {
			name: user.name,
			wiki: new_wiki
		}

		put_message_in_db(message, message_to_send, 'new_wiki')

		WebsocketRails[room_id].trigger(:new_wiki, message_to_send)

	end

	def new_movie
		user_id = message['id']
		room_id = message['roomid']
		movie = message['movie']

		user = User.find user_id

		new_movie = "http://www.imdb.com/find?ref_=nv_sr_fn&q=#{ movie.gsub(' ', '+') }&s=all"

		message_to_send = {
			name: user.name,
			movie: new_movie
		}

		put_message_in_db(message, message_to_send, 'new_movie')

		WebsocketRails[room_id].trigger(:new_movie, message_to_send)

	end
	#PHIL END

	# JAMES
	def new_search
		user_id = message['id']
		room_id = message['roomid']
		search = message['search']

		user = User.find user_id
	  uri = Google::Search::Web.new do |uri|
	    uri.query = search
	    uri.size = :small
	  end
	  uri_results = uri.first(5)

	  message_to_send = {
	  	name: user.name,
	  	search: uri_results
	  }

	  put_message_in_db(message, message_to_send, 'new_search')

	  WebsocketRails[room_id].trigger(:new_search, message_to_send)

	  scroll_chat room_id

	end

	def new_gif
		user_id = message['id']
		room_id = message['roomid']
		# gif = message['gif']

		user = User.find user_id

		url = "https://imgur.com/hot/viral"
		doc = Nokogiri::HTML(open(url))
		links = doc.css('a.image-list-link')
		results = []

		links.each do |link|
			results << link["href"]
		end

		sample = results.sample
		new_gif = "https://imgur.com#{ sample }"

		message_to_send = {
			name: user.name,
			gif: new_gif
		}

	  put_message_in_db(message, message_to_send, 'new_gif')

	  WebsocketRails[room_id].trigger(:new_gif, message_to_send)

	  scroll_chat room_id
	end

	# JAMES END


private
	# Storing the entire message and the function associated with it
	def scroll_chat(room_id)
		# scroll clients
		WebsocketRails[room_id].trigger(:scroll_chat, message)
	end
	def put_message_in_db(message_sent, message_to_send, fn)
		# reduce boilerplate by creating associations in helper function
		msg = Message.new(user_id: message_sent['id'], room_id: message_sent['roomid'], object: message_to_send.to_json, function: fn)
		msg.save
		user = User.find message_sent['id']
		room = Room.find message_sent['roomid']
		user.messages << msg
		room.messages << msg
		msg
	end
end