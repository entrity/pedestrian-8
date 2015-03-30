class Post < ActiveRecord::Base

  def editable? user
    return user.id == user_id
  end
end
