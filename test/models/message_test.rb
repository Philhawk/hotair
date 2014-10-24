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

require 'test_helper'

class MessageTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
