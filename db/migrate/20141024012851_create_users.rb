class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.integer :room_id
      t.string :name
      t.text :email
      t.string :password_digest

      t.timestamps
    end
  end
end
