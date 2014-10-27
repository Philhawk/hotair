class AddRecentRoomsToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :recent_rooms, :text
  end
end
