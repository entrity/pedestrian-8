class VolumesController < ApplicationController
  before_action :require_logged_in!, only:[:update, :create, :destroy]

  def show
    if params[:id].to_i == 0
      render body: nil
    elsif !current_user and volume.private
      render body: nil, status: 401
    else
      @volume = Volume.find(params[:id])
      respond_to do |format|
        format.json { render json: @volume }
        format.css { render plain: @volume.css, content_type: 'text/css' }
      end
    end
  end

  def index
    @vols = Volume.all
    @vols = @vols.where('title like ?', "%#{params[:title]}%") if params[:title].present?
    render json: @vols
  end

  def create
    @vol = Volume.new volume_params
    @vol.save
    render json: @vol
  end

  def update
    @vol = Volume.find params[:id]
    @vol.created_by ||= current_user.id
    if @vol.created_by == current_user.id || @vol.editor_ids.include?(current_user.id)
      @vol.update_attributes(volume_params)
      render json: @vol
    else
      render text:"Volume #{@vol.id} belongs to #{@vol.created_by}. You are #{current_user.id}", status:401
    end
  end

  def children
    params[:id] = nil if params[:id].to_i == 0
    child_volumes = Volume.where(parent_id:params[:id]).order('timestamp DESC')
    render json: child_volumes
  end

  def posts
    volume = Volume.find(params[:id])
    searcher = PostsSearcher.new(volume, params)
    render json: searcher.search
  end

private

  def volume_params
    params.permit(:title, :title_html, :description, :closed, :anthology, :insertions, :private, :css, :parent_id, :max_age, :max_posts)
  end
end
