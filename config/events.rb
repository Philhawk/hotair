WebsocketRails::EventMap.describe do
  # You can use this file to map incoming events to controller actions.
  # One event can be mapped to any number of controller actions. The
  # actions will be executed in the order they were subscribed.
  #
  # Uncomment and edit the next line to handle the client connected event:
  subscribe :client_connected, :to => ChatController, :with_method => :new
  subscribe :new_room, :to => RoomController, :with_method => :new
  subscribe :join_room, :to => RoomController, :with_method => :join
  subscribe :left_room, :to => RoomController, :with_method => :leave
  subscribe :get_rooms, :to => RoomController, :with_method => :show


  subscribe :send_text, :to => RoomController, :with_method => :new_text
  subscribe :send_embed, :to => RoomController, :with_method => :new_embed

  # NICKS
  subscribe :send_time, :to => RoomController, :with_method => :new_time
  subscribe :get_recent_rooms, :to => RoomController, :with_method => :get_recent_rooms

# james
  subscribe :send_search, :to => RoomController, :with_method => :new_search
# james end

#phil
  subscribe :send_map, :to => RoomController, :with_method => :new_map
  subscribe :send_recipe, :to => RoomController, :with_method => :new_recipe
  subscribe :send_movie, :to => RoomController, :with_method => :new_movie
  subscribe :send_directions, :to => RoomController, :with_method => :new_directions

# phil end

#lawrence
  subscribe :send_code, :to => RoomController, :with_method => :new_code

#lawrence end

  #
  # Here is an example of mapping namespaced events:
  #   namespace :product do
  #     subscribe :new, :to => ProductController, :with_method => :new_product
  #   end
  # The above will handle an event triggered on the client like `product.new`.
end
