class InitialState < ActiveRecord::Migration[5.2]
  def up
    create_table :posts, bulk:true do |t|
      t.integer :idx, default:-1
      t.integer :volume_id
      t.integer :user_id
      t.text    :content
      t.timestamps
      t.datetime :timestamp
    end
    create_table :editors, bulk:true do |t|
      t.integer :volume_id
      t.integer :user_id
      t.timestamps
    end
    create_table :users, bulk:true do |t|
      t.string  :login
      t.text    :name
      t.string  :password
      t.timestamps
      t.string  :content_width
      t.integer :timezone
    end
    create_table :volumes, bulk:true do |t|
      t.integer :parent_id
      t.string  :url
      t.string  :title
      t.text    :title_html
      t.text    :description
      t.text    :css
      t.integer :created_by
      t.integer :user_id
      t.timestamps
      t.integer :max_age, default:0
      t.integer :max_posts, default:0
      t.integer :meta_editors, default:2
      t.integer :post_editors, default:0
      t.boolean :anthology
      t.boolean :closed
      t.boolean :private
      t.boolean :insertions, default:1
      t.boolean :inherit_css, default:1
      t.datetime :timestamp
      t.text    :meta_description
    end

    def down
      remove_table :users
      remove_table :editors
      remove_table :posts
      remove_table :volumes
    end
  end
end
