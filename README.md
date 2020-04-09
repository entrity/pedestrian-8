# Pedestrian 8

## Overview

This is the 8th version of the Pedestrian book club application, which has been running since 2007. (It is now 2019, and the application still receives *daily* use from the book club members.)

The back end is a Ruby on Rails application; the front-end is Angular.js. The database for both development and production is mysql. (The test environment is set up to use sqlite.)

## Quick Build

```bash
sudo apt install -y nodejs npm bower sqlite3 libmysqlclient-dev
npm install -y bower
node_modules/bower/bin/bower install
bundle install
# If the bundle won't install, consider `bundle update`, but this may lead to other difficulties
```

## Set up

For the production environment, define an environment variable `SECRET_KEY_BASE`, which shall be used for ciphered and encrypted elements, such as user passwords.

## Deployment

Please deploy this using capistrano.
