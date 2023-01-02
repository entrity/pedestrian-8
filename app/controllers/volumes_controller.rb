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
    @volume = Volume.find(params[:id])
    @posts = Post.where(volume_id:params[:id])
    # Grab posts that were created after a certain time (used for page updates)
    if params[:after]
      @order = 'created_at desc'
      @posts = @posts.where('created_at > ?', Time.parse("#{params[:after]} UTC"))
    # Fetch posts for a max-age-based volume
    elsif @volume.max_age.to_i > 0
      @order = 'created_at desc'
      if params[:before]
        @posts = @posts.where('created_at <= ?', Time.parse("#{params[:before]} UTC"))
      else
        @posts = @posts.where('created_at >= ?', @volume.max_age.days.ago)
      end
    # Fetch posts for a posts-count-based volume
    elsif @volume.max_posts.to_i > 0
      @order = 'idx desc'
    # Fetch posts for a volume with no specification for show only the last posts
    else
      @order = 'idx'
      @no_reverse = true
    end
    if params[:not_post_id].present?
      @posts = @posts.where('id != ?', params[:not_post_id])
    end
    @posts = @posts
      .paginate(page:params[:page], per_page:params[:per_page]||100)
      .order(@order).to_a
    @posts.reverse! unless @no_reverse
    render json: @posts
  end

private

  def volume_params
    params.permit(:title, :title_html, :description, :closed, :anthology, :insertions, :private, :css, :parent_id, :max_age, :max_posts)
  end
end
