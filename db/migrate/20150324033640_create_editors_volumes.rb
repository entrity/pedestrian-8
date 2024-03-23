class CreateEditorsVolumes < ActiveRecord::Migration[5.2]
  def change
    create_table :editors_volumes do |t|
      t.integer :editor_id
      t.integer :volume_id
    end
    add_index :editors_volumes, :editor_id
    add_index :editors_volumes, :volume_id
  end
end
