class Volume < ActiveRecord::Base
  has_and_belongs_to_many :editors, class_name:'User', join_table:'editors_volumes', association_foreign_key:'editor_id'
  belongs_to :parent, class_name:"Volume"
  
  attr_accessor :marked # used to detect cycles when iterating through parentage
end
