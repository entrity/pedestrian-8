# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

# Replace 'rbenv exec' with 'docker exec ...'
SSHKit.config.command_map.prefix[:bundle].unshift "docker exec pedestrian"
SSHKit.config.command_map.prefix[:ruby].unshift "docker exec pedestrian"
SSHKit.config.command_map.prefix[:rails].unshift "docker exec pedestrian"
SSHKit.config.command_map.prefix[:rake].unshift "docker exec pedestrian"
SSHKit.config.command_map.prefix[:gem].unshift "docker exec pedestrian"

set :deploy_to, '/var/www/containerized-duckofdoom'
set :branch, 'containerize'
set :rails_env, :production

server '209.141.40.67', user: 'deploy', roles: %w{app db web}
# server 'example.com', user: 'deploy', roles: %w{app web}, other_property: :other_value
# server 'db.example.com', user: 'deploy', roles: %w{db}

namespace :deploy do
  before "bundler:config", :stop_and_start_docker_container do
    on roles(:app) do

      execute :docker, :stop, :pedestrian, raise_on_non_zero_exit: false
      execute :docker, :rm, :pedestrian, raise_on_non_zero_exit: false

      # Assets shared by containerized and non-containerized pedestrian sites
      mutual_path = "/var/www/shared-duckofdoom"

      # `run` may fail if the stopped container doesn't get cleaned up quickly
      # enough because it's an asynchronous cleanup. Just run the deploy a
      # second time if it fails for this reason.
      execute(:docker, :run,
        "--name", "pedestrian",
        '-d',
        '--network=piwigo_default', # So that we can access the container running the db.
        '-v', "#{release_path}:/duckofdoom",
        '-v', "#{shared_path}:/var/www/containerized-duckofdoom/shared",
        '-v', "#{mutual_path}/public:/duckofdoom/public",
        '-v', "#{mutual_path}/vendor/assets/stylesheets:/duckofdoom/vendor/assets/stylesheets",
        '-e', 'RAILS_ENV=production',
        '-p', '3000:3000',
        '-u', 1003, # This is the 'deploy' user on the server.
        '--rm',
        "pedestrian:8.1.5", # This isn't in a registry; I just built it on the server.
        'tail', '-f', '/dev/null', # Command to keep the container open but not doing anything.
      )
    end
  end

  after "deploy:restart", :start_passenger do
    on roles(:app) do
      execute :docker, :exec, "-d", :pedestrian, "passenger", "start", "--port", "3000"
    end
  end
end


# role-based syntax
# ==================

# Defines a role with one or multiple servers. The primary server in each
# group is considered to be the first unless any  hosts have the primary
# property set. Specify the username and a domain or IP for the server.
# Don't use `:all`, it's a meta role.

# role :app, %w{deploy@example.com}, my_property: :my_value
# role :web, %w{user1@primary.com user2@additional.com}, other_property: :other_value
# role :db,  %w{deploy@example.com}



# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.



# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.
# http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start
#
# Global options
# --------------
 set :ssh_options, {
#    keys: %w(/home/rlisowski/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
    auth_methods: %w(publickey),
 }
#
# The server-based syntax can be used to override options:
# ------------------------------------
# server 'example.com',
#   user: 'user_name',
#   roles: %w{web app},
#   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
#     forward_agent: false,
#     auth_methods: %w(publickey password)
#     # password: 'please use keys'
#   }
