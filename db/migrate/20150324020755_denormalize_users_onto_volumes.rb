class DenormalizeUsersOntoVolumes < ActiveRecord::Migration[5.2]
  def change
    add_column :volumes, :creator_name, :string
    add_column :volumes, :updated_by_id, :string
    add_column :volumes, :updated_by_name, :string
    add_column :volumes, :parent_name, :string
  end
end
