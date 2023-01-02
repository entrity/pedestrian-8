class Post < ActiveRecord::Base

  belongs_to :user
  belongs_to :volume

  def editable? user
    return user.id == user_id
  end
end
