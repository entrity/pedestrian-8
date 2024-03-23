class AddUserNameToPosts < ActiveRecord::Migration[5.2]
  def change
    add_column :posts, :user_name, :string, limit:2048
  end
end
