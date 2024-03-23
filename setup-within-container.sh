set -eux

whoami
bundle config
pwd

bundle install
bower install
bundle exec bin/rails db:migrate RAILS_ENV=development
echo FIN