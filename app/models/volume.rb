class Volume < ActiveRecord::Base
  has_and_belongs_to_many :editors, class_name:'User', join_table:'editors_volumes', association_foreign_key:'editor_id'
end
