class UsersController < ApplicationController

  def show
    if params[:id].to_i == 0
      render json:current_user
    else
      render json:User.find(params[:id])
    end
  end

end
