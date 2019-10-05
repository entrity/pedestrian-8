class Volume < ActiveRecord::Base
  has_and_belongs_to_many :editors, class_name:'User', join_table:'editors_volumes', association_foreign_key:'editor_id'
  belongs_to :parent, class_name:"Volume"
  
  attr_accessor :marked # used to detect cycles when iterating through parentage

  def order
    if max_age.to_i > 0
        'created_at'
    elsif max_posts.to_i > 0
        'idx'
    else
        'idx desc'
    end
  end

  def as_json(options={})
    o = super(options)
    o[:order] ||= order
    o
  end
end
