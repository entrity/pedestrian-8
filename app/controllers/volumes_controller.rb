class VolumesController < ApplicationController
  before_filter :require_logged_in!, only:[:update, :create, :destroy]
  respond_to :json, :css

  def show
    if params[:id].to_i == 0
      render nothing:true
    elsif !current_user and volume.private
      render nothing:true, status:401
    else
      @volume = Volume.find(params[:id])
      respond_to do |format|
        format.json{ render json:@volume }
        format.css{ render text:@volume.css }
      end
    end
  end

  def index
    @vols = Volume.all
    @vols = @vols.where('title like ?', "%#{params[:title]}%") if params[:title].present?
    respond_with @vols
  end

  def create
    @vol = Volume.new volume_params
    @vol.save
    respond_with @vol
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
    params[:id] = nil if params[:id].to_i == 0
    child_volumes = Volume.where(parent_id:params[:id]).order('timestamp DESC')
    respond_with child_volumes
  end

  def posts
    @volume = Volume.find(params[:id])
    @posts = Post.where(volume_id:params[:id])
    if @volume.max_age.to_i > 0
      @order = 'created_at desc'
      page = [1, params.delete('page').to_i].max
      @posts = @posts.where('created_at >= ?', (page*@volume.max_age).days.ago)
      if page > 1
        @posts = @posts.where('created_at < ?', ((page-1)*@volume.max_age).days.ago)
      end
    elsif @volume.max_posts.to_i > 0
      @order = 'idx desc'
    else
      @order = 'idx'
      @no_reverse = true
      params[:per_page] ||= 50
    end
    @posts = @posts
      .paginate(page:params[:page], per_page:params[:per_page]||100)
      .order(@order).to_a
    @posts.reverse! unless @no_reverse
    respond_with @posts
  end

private

  def volume_params
    params.permit(:title, :title_html, :description, :closed, :anthology, :insertions, :private, :css, :parent_id, :max_age, :max_posts)
  end
end
