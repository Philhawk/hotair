# == Route Map
#
#    Prefix Verb     URI Pattern               Controller#Action
#      root GET      /                         pages#index
#     users GET      /users(.:format)          users#index
#           POST     /users(.:format)          users#create
#  new_user GET      /users/new(.:format)      users#new
# edit_user GET      /users/:id/edit(.:format) users#edit
#      user GET      /users/:id(.:format)      users#show
#           PATCH    /users/:id(.:format)      users#update
#           PUT      /users/:id(.:format)      users#update
#           DELETE   /users/:id(.:format)      users#destroy
#     login GET      /login(.:format)          session#new
#           POST     /login(.:format)          session#create
#           DELETE   /login(.:format)          session#destroy
#      chat GET      /chat(.:format)           pages#chat
# websocket GET|POST /websocket(.:format)      websocket_rails
#

Rails.application.routes.draw do
	root to: 'pages#index'

	resources :users

	get '/login' => 'session#new'
	post '/login' => 'session#create'
	delete '/login' => 'session#destroy'

	get '/chat' => 'pages#chat'
end
