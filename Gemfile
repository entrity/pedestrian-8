source 'https://rubygems.org'

ruby '2.6.6'

gem 'bootsnap'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.2.8'
# Use SCSS for stylesheets
gem 'sass-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 4.1.0'
# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby
gem 'mini_magick', '~> 4.10.1'

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

gem 'foundation-rails'

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Unicorn as the app server
# gem 'unicorn'

group :production do
  gem 'mysql2'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'

  # Use sqlite3 as the database for Active Record
  gem 'sqlite3', '~> 1.3.6'
  gem 'pry'

  gem 'rspec-rails'
end

group :development do
  gem 'capistrano', '3.4.0'
  # gem 'capistrano-bundler', '~> 1.1.2'
  # gem 'capistrano-bower'
  gem 'capistrano-rails'
  gem 'capistrano-rbenv', group: :development
  # gem 'capistrano-rvm'

  gem 'listen'
end

gem 'bower'
gem 'devise'
gem 'will_paginate'
