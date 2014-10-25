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

  subscribe :send_text, :to => RoomController, :with_method => :new_text
  subscribe :send_image, :to => RoomController, :with_method => :new_image

  subscribe :send_git, :to => RoomController, :with_method => :new_git
  subscribe :send_insta, :to => RoomController, :with_method => :new_insta
  subscribe :send_imgur, :to => RoomController, :with_method => :new_imgur
  subscribe :send_wiki, :to => RoomController, :with_method => :new_wiki
  subscribe :send_youtube, :to => RoomController, :with_method => :new_youtube
  subscribe :send_flickr, :to => RoomController, :with_method => :new_flickr
  subscribe :send_tweet, :to => RoomController, :with_method => :new_tweet
  subscribe :send_vimeo, :to => RoomController, :with_method => :new_vimeo

  subscribe :send_sound_cloud, :to => RoomController, :with_method => :new_sound
  #
  # Here is an example of mapping namespaced events:
  #   namespace :product do
  #     subscribe :new, :to => ProductController, :with_method => :new_product
  #   end
  # The above will handle an event triggered on the client like `product.new`.
end
