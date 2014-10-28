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
#  recent_rooms    :text
#

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
