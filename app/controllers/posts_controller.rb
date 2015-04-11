class PostsController < ApplicationController
  before_filter :require_permission, only:[:update, :destroy]
  after_action :update_volume, only:[:create, :update]

  respond_to :json

  def create
    @post = Post.new post_params
    @post.user_id = current_user.id
    @post.user_name = current_user.name
    @post.idx ||= Post.select(:id).last.id
    if @post.save && @post.volume.insertions
      Post.where(volume_id:@post.volume_id)
        .where('id != ?', @post.id)
        .where('idx >= ?', @post.idx)
        .update_all('idx = idx + 1')
    end
    respond_with @post
  end

  def update
    @post.update_attributes post_params
    respond_with @post
  end

  def destroy
    @post.destroy
    respond_with @post
  end

private

  def post_params
    params.permit(:content, :volume_id, :idx)
  end

  def require_permission
    @post = Post.find params[:id]
    unless @post.editable?(current_user)
      return render status:401, text:"You lack permission to alter Post id #{@post.id}"
    end
  end

  def update_volume
    if @post.errors.empty?
      @volume = Volume.find(@post.volume_id)
      while @volume
        break if @volume.marked # prevent cycles
        @volume.marked = true # mark to prevent cycles
        break unless @volume.update_attributes(
          updated_by_id:current_user.id,
          updated_by_name:current_user.name,
          timestamp:@post.updated_at
        )
        @volume = @volume.parent
      end
    end
  end
end
