class PostsSearcher
  def initialize(volume, params)
    @volume = volume
    @params = params
    @is_age_based = volume.max_age.to_i > 0
    @column = is_age_based ? 'created_at' : 'idx'
    @posts = Post.where(volume_id: volume.id)
    @needs_order_reversal = false
  end

  def search
    before_after_applied = apply_cursor_from_params || apply_before_or_after_from_params
    search_applied = apply_search_from_params
    apply_default_before_after unless before_after_applied || search_applied
    self.posts = posts.limit(params[:per_page] || 100).to_a
    posts.reverse! if @needs_order_reversal
    posts
  end

  private
  attr_reader :volume, :params, :is_age_based, :column
  attr_accessor :posts, :needs_order_reversal

  def apply_cursor_from_params
    cursor_id = params[:after_post_id].presence || params[:before_post_id].presence
    return false unless cursor_id
    cursor = Post.select(:id, :created_at, :idx).find(cursor_id)
    self.posts = posts.where('id <> ?', cursor.id) unless params[:inclusive]
    if params[:after_post_id]
      self.posts = posts.where("#{column} >= ?", cursor[column]).
        order("#{column}")
    else
      self.posts = posts.where("#{column} <= ?", cursor[column]).
        order("#{column} DESC")
      self.needs_order_reversal = true
    end
    true
  end

  def apply_before_or_after_from_params
    if params[:after].present? # Grab posts that were created after a certain time (used for page updates)
      self.posts = posts.where("created_at > ?", Time.parse("#{params[:after]} UTC")).
        order("#{column}")
    elsif params[:before].present?
      self.posts = posts.where("created_at <= ?", Time.parse("#{params[:before]} UTC")).
        order("#{column} DESC")
      self.needs_order_reversal = true
    end
    params[:after].present? || params[:before].present?
  end

  def apply_search_from_params
    if params[:search].present?
      pattern = "%#{params[:search].gsub('*', '%')}%"
      self.posts = posts.where('content LIKE ?', pattern)
    end
    params[:search].present?
  end

  def apply_default_before_after
    if is_age_based # Fetch posts for a max-age-based volume
      self.posts = posts.where('created_at >= ?', volume.max_age.days.ago)
      self.posts = posts.order('created_at DESC')
      self.needs_order_reversal = true
    elsif volume.max_posts.to_i > 0 # Fetch posts for a posts-count-based volume
      self.posts = posts.order('idx DESC')
      self.needs_order_reversal = true
    else
      self.posts = posts.order('idx')
    end
  end

end
