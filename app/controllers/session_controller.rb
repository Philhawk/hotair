class SessionController < ApplicationController
  def new
  end

  def create
  	user = User.find_by(name: params[:name])
  	if user.present? && user.authenticate(params[:password])
  		session[:user_id] = user.id
  		redirect_to chat_path
    else
      @error = "Login Incorrect"
      render :new
  	end
  end

  def destroy
  	session[:user_id] = nil
  	redirect_to root_path
  end
end
