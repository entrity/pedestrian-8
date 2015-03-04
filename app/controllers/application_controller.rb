class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  before_action :require_logged_in!

  def index
    render json:self.class.model.all.as_json
  end

  def create
    new_obj = self.class.model.new(permitted_params)
    if new_obj.save
      render status:201, json:new_obj.as_json
    else
      render status:422, json:new_obj.as_json
    end
  end

  def show
    render json:self.class.model.find(params[:id])
  end

  def update
    obj = self.class.model.find(params[:id])
    if obj.update_attributes(permitted_params)
      render status:200, json:Hash.new
    else
      render status:422, json:obj.as_json
    end
  end

  def destroy
    obj = self.class.model.find(params[:id])
    if obj.destroy
      render status:205, json:Hash.new
    else
      render status:422, json:obj.as_json
    end
  end

private

  def permitted_params
    raise 'Not implemented. This should only be implemented in a subclass'
  end

  def require_logged_in!
    return render(status:401, text:'Not logged in') unless user_signed_in?
  end
end
