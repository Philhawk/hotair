class UsersController < ApplicationController
	def new
		@user = User.new
	end

	def create
		@user = User.new user_params
		if @user.save
			session[:user_id] = @user.id
			redirect_to chat_path
		else
			render :new
		end
	end

	def edit
		@current_user
	end

	def update
		user = User.find params[:id]
		user.update user_params
		redirect_to chat_path
	end

	private
	def user_params
		params.require(:user).permit(:name, :email, :password, :password_confirmation)
	end
end
