# Pedestrian 8

## Overview

This is the 8th version of the Pedestrian book club application, which has been running since 2007. (It is now 2019, and the application still receives *daily* use from the book club members.)

## Dependencies

Dependencies are managed with ruby gems and bower:

```
bundle install
bower install
```

The back end is a Ruby on Rails application; the front-end is Angular.js. The database for both development and production is mysql. (The test environment is set up to use sqlite.)

## Set up

For the production environment, define an environment variable `SECRET_KEY_BASE`, which shall be used for ciphered and encrypted elements, such as user passwords.

## Deployment

Please deploy this using capistrano.
