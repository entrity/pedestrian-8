# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'Pedestrian'
set :repo_url, 'git@github.com:entrity/pedestrian-8.git'
# set :rvm_ruby_string, '2.2.0'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/var/www/duckofdoom'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

set :rbenv_type, :system
set :rbenv_ruby, '2.6.6'

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'public/favicon.ico')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'vendor/bundle', 'public/system', 'public/repository', 'vendor/assets')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 3

namespace :deploy do

  before :compile_assets, :my_tmp_task do # TODO rm, but this is what i'm using to make the secret key available to the capistrano tasks. putting it in .bashrc really doesn't get it in the env for capistrano.
    on roles(:app) do
      execute :rm, "#{release_path}/config/secrets.yml"
      execute :ln, "-s", "#{shared_path}/config/secrets.yml", "#{release_path}/config/secrets.yml"
    end
  end

  after :updated, :custom_symlinks do
    on roles(:web) do
      # For ckeditor
      execute "rm #{release_path}/public/assets/ckeditor; echo yes"
      execute :ln, "-s", "#{release_path}/vendor/assets/bower/ckeditor", "#{release_path}/public/assets"

      execute :ln, "-s", "#{shared_path}/public/uploads", "#{release_path}/public/uploads"
    end
  end

  after :finished, :restart do
    on roles(:web) do
      within current_path do
        execute :touch, "tmp/restart.txt"
      end
    end
  end

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

end
