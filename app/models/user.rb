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

	has_secure_password

	validates :name, presence: true, uniqueness: true, length: {minimum: 3}
	validates :email, presence: true, uniqueness: true
	validates_length_of :password, in: 3..20, on: :create
end
