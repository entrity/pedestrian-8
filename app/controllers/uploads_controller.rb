class UploadsController < ApplicationController
  BASE_DIR = 'public/uploads'
  THUMB_DIR = File.join BASE_DIR, 'thumb'
  ORIGINAL_DIR = File.join BASE_DIR, 'orig'
  LARGE_DIR = File.join BASE_DIR, 'lg'
  MEDIUM_DIR = File.join BASE_DIR, 'med'
  SMALL_DIR = File.join BASE_DIR, 'sm'
  THUMB_SIZE = '128x128'
  SMALL_SIZE = '256x256'
  MEDIUM_SIZE = '330x330'
  LARGE_SIZE = '512x512'

  def index
    [THUMB_DIR, ORIGINAL_DIR, LARGE_DIR, MEDIUM_DIR, SMALL_DIR].each do |dpath|
      FileUtils.mkdir_p dpath
    end
    process_new_image_files
    @images = images
    render layout: false
  end

  def lg; create :lg, LARGE_SIZE; end
  def med; create :med, MEDIUM_SIZE; end
  def sm; create :sm, SMALL_SIZE; end

private

  class Image < Struct.new(:name)

    def thumb(internal=false); url THUMB_DIR, internal; end
    def orig(internal=false); url ORIGINAL_DIR, internal; end
    def med(internal=false); url MEDIUM_DIR, internal; end
    def lg(internal=false); url LARGE_DIR, internal; end
    def sm(internal=false); url SMALL_DIR, internal; end

    def create(method_name, size)
      disk_path = send method_name, true
      unless File.exist? disk_path
        image = MiniMagick::Image.open orig(true)
        image.resize(size)
        image.write disk_path
      end
    end

    private

    def url dpath, return_internal
      dpath = dpath.sub(/^public/, '') unless return_internal
      File.join(dpath, name)
    end
  end

  def create method_name, size
    file = Image.new params.values_at(:fname, :format).join('.')
    file.create method_name, size
    redirect_to request.path, status: 307
  end

  def extract_thumb fpath
    file = Image.new File.basename(fpath)
    # Put thumb into thumb
    image = MiniMagick::Image.open fpath
    image.resize(THUMB_SIZE)
    image.write file.thumb(true)
    # Move orig to orig
    FileUtils.mv fpath, file.orig(true)
  end

  def images
    Dir.glob(File.join THUMB_DIR, "*.*")
    .sort_by { |f| File.mtime(f) }
    .map { |f| Image.new File.basename(f) }
  end

  def process_new_image_files
    fpaths = Dir.glob(File.join BASE_DIR, "*.*")
    fpaths.each do |fpath|
      if fpath =~ /\.(png|jpg|jpeg|gif)$/i
        extract_thumb fpath
      end
    end
  end
end
