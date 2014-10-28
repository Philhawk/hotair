class PagesController < ApplicationController
  def index
  end

  def chat
  	unless logged_in?
  		redirect_to root_path
  	end
  end
end
