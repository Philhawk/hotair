# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  room_id         :integer
#  name            :string(255)
#  email           :text
#  password_digest :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#

class User < ActiveRecord::Base
	belongs_to :room
	has_many :messages
end
