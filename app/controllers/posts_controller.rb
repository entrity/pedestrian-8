class PostsController < ApplicationController
  before_filter :require_permission, only:[:update, :destroy]
  before_filter :require_content, only: [ :create ]

  respond_to :json

  def create
    @post = Post.new post_params
    @post.user_id = current_user.id
    @post.user_name = current_user.name
    @post.idx ||= Post.select(:id).last.id
    if @post.save && @post.volume.insertions
      Post.where(volume_id:@post.volume_id)
        .where('id != ?', @post.id)
        .where('idx <= ?', @post.idx)
        .update_all('idx = idx - 1')
    end
    respond_with @post
  end

  def update
    editlogger = Logger.new(File.join Rails.root, 'log', 'edit.log')
    editlogger.info "PRE:  #{@post.to_json}"
    @post.update_attributes post_params
    editlogger.info "POST: #{@post.to_json}"
    respond_with @post
  end

  def destroy
    destroylogger = Logger.new(File.join Rails.root, 'log', 'destroy.log')
    destroylogger.info @post.to_json
    @post.destroy
    respond_with @post
  end

private

  def blank_html?(text)
    stripped = text&.gsub(/(\s+)(<br>)|(&nbsp;?)|<p><\/p>/i, '')
    stripped.blank?
  end

  def post_params
    params.permit(:content, :volume_id, :idx)
  end

  def require_content
    if blank_html?(post_params[:content])
      render status: 422, json: { errors: ["Content must not be blank"] }
    end
  end

  def require_permission
    @post = Post.find params[:id]
    unless @post.editable?(current_user)
      return render status:401, text:"You lack permission to alter Post id #{@post.id}"
    end
  end

  def update_volume
    if @post.errors.empty?
      volume = @post.volume
      volume&.update_updated_by(@post.user, @post.updated_at)
    else
      Rails.logger.error "No update_updated_by. #{@post.errors.inspect}"
    end
  end
end
