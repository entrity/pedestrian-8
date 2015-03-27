class VolumesController < ApplicationController
  before_filter :require_logged_in!, only:[:update, :create, :destroy]
  respond_to :json

  def show
    if params[:id].to_i == 0
      render nothing:true
    elsif !current_user and volume.private
      render nothing:true, status:401
    else
      respond_with Volume.find(params[:id])
    end
  end

  def index
    @vols = Volume.all
    @vols = @vols.where('title like ?', "%#{params[:title]}%") if params[:title].present?
    respond_with @vols
  end

  def update
    @vol = Volume.find params[:id]
    @vol.created_by ||= current_user.id
    if @vol.created_by == current_user.id || @vol.editor_ids.include?(current_user.id)
      @vol.update_attributes(volume_params)
      respond_with @vol
    else
      render text:"Volume #{@vol.id} belongs to #{@vol.created_by}. You are #{current_user.id}", status:401
    end
  end

  def children
    params[:volume_id] = nil if params[:volume_id].to_i == 0
    child_volumes = Volume.where(parent_id:params[:volume_id]).order('timestamp DESC')
    respond_with child_volumes
  end

private

  def volume_params
    params.permit(:title, :title_html, :description, :closed, :anthology, :insertions, :private, :css, :parent_id, :max_age, :max_posts)
  end
end
