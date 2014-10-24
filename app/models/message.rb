# == Schema Information
#
# Table name: messages
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  room_id    :integer
#  object     :text
#  function   :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class Message < ActiveRecord::Base
	belongs_to :room 
	belongs_to :user
end
