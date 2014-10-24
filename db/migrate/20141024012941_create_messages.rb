class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.integer :user_id
      t.integer :room_id
      t.text :object
      t.string :function

      t.timestamps
    end
  end
end
