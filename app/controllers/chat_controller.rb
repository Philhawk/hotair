class ChatController < WebsocketRails::BaseController
	def new
		send_message :connected, message 
	end 
end 