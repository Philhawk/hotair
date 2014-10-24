# == Schema Information
#
# Table name: rooms
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  topic      :text
#  created_at :datetime
#  updated_at :datetime
#

class Room < ActiveRecord::Base
	has_many :users
	has_many :messages
end
