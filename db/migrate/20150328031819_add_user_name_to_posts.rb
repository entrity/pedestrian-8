class AddUserNameToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :user_name, :string, limit:2048
  end
end
