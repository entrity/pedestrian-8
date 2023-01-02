class UsersController < ApplicationController
  respond_to :json

  def show
    if params[:id].to_i == 0
      render json:current_user
    else
      render json:User.find(params[:id])
    end
  end

  def update
    @user = User.find params[:id]
    @user.attributes = user_params
    name_changed = @user.name_changed?
    if @user.save && name_changed
      Post.where(user_id:@user.id).update_all user_name:@user.name
      Volume.where(updated_by_id:@user.id).update_all updated_by_name:@user.name
    end
    render json: @user
  end

private

  def user_params
    params.permit(:email, :password, :password_confirmation, :name)
  end

end
