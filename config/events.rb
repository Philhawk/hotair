WebsocketRails::EventMap.describe do
  # You can use this file to map incoming events to controller actions.
  # One event can be mapped to any number of controller actions. The
  # actions will be executed in the order they were subscribed.
  #
  # Uncomment and edit the next line to handle the client connected event:

  # how commands work:
  # subscribe send_command, :to => RoomController, :with_method => :new_command


  subscribe :client_connected, :to => ChatController, :with_method => :new
  subscribe :client_disconnected, :to => RoomController, :with_method => :closed
  subscribe :new_room, :to => RoomController, :with_method => :new
  subscribe :join_room, :to => RoomController, :with_method => :join
  subscribe :left_room, :to => RoomController, :with_method => :leave
  subscribe :get_rooms, :to => RoomController, :with_method => :show
  subscribe :delete_room, :to => RoomController, :with_method => :delete


  subscribe :edit_room_name, :to => RoomController, :with_method => :edit_name
  subscribe :send_text, :to => RoomController, :with_method => :new_text
  subscribe :send_embed, :to => RoomController, :with_method => :new_embed

  # NICKS
  subscribe :send_time, :to => RoomController, :with_method => :new_time
  subscribe :save_recent_rooms, :to => RoomController, :with_method => :save_recent_rooms
  subscribe :get_recent_rooms, :to => RoomController, :with_method => :get_recent_rooms
  subscribe :send_flip, :to => RoomController, :with_method => :new_flip
  subscribe :send_roll, :to => RoomController, :with_method => :new_roll

# james
  subscribe :send_search, :to => RoomController, :with_method => :new_search
  subscribe :send_gif, :to => RoomController, :with_method => :new_gif
  subscribe :get_chat_data, :to => RoomController, :with_method => :get_content
# james end

#phil
  subscribe :send_image, :to => RoomController, :with_method => :new_image
  subscribe :send_crumble, :to => RoomController, :with_method => :new_crumble
  subscribe :send_map, :to => RoomController, :with_method => :new_map
  subscribe :send_recipe, :to => RoomController, :with_method => :new_recipe
  subscribe :send_movie, :to => RoomController, :with_method => :new_movie
  subscribe :send_goto, :to => RoomController, :with_method => :new_goto
  subscribe :send_transport, :to => RoomController, :with_method => :new_transport
  subscribe :send_wiki, :to => RoomController, :with_method => :new_wiki

# phil end

#lawrence
  subscribe :send_code, :to => RoomController, :with_method => :new_code

  subscribe :send_nudge, :to => RoomController, :with_method => :new_nudge

  subscribe :send_fact, :to => RoomController, :with_method => :new_fact

  subscribe :send_fortune, :to => RoomController, :with_method => :new_fortune
  subscribe :edit_topic, :to => RoomController, :with_method => :new_topic

#lawrence end

  #
  # Here is an example of mapping namespaced events:
  #   namespace :product do
  #     subscribe :new, :to => ProductController, :with_method => :new_product
  #   end
  # The above will handle an event triggered on the client like `product.new`.
end
