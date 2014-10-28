class PagesController < ApplicationController
  def index
  end

  def chat
  	unless logged_in?
  		redirect_to chat
  	end
  end
end
