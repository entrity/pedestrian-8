## Stack level too deep

viz. `numeric` or `conversion`, according to [this SO answer](https://stackoverflow.com/a/41504382/507721):

> In Ruby 2.4, there was a unification of integer types (i.e. Fixnum and Bignum are now the very same thing: Integer). This results on quite a few incompatibilities with existing gems which relied on the distinction of the classes.
>
> Older versions of ActiveSupport are among those which don't like this unification and barf over it when trying to serialize data. As such, you have one of two options:
>
> You can downgrade Ruby to a version earlier than 2.4, e.g. Ruby 2.3.x.
> Or you could upgrade Rails to a newer version. Preferably, that could be Rails 5.x. There is also a patch in the 4.2-stable branch which was released with Rails 4.2.8, making it the first version of the Rails 4.2 series that officially supports Ruby 2.4. Earlier Rails versions are not compatible with Ruby 2.4.

I downgraded to ruby 2.3.8:

```bash
/bin/bash --login
rvm install ruby-2.3.8
rvm use --default 2.3
gem install bundler --version 2.0.2
cd $PROJECT_ROOT
RAILS_ENV=production bundle install
```

And updated `/etc/apache2/sites-available/duck-of-doom.conf` to reflect these changes:

```
# Get ruby path with `which ruby`
PassengerRuby /var/www/.rvm/rubies/ruby-2.3.8/bin/ruby
# Get $GEM_PATH under "GEM PATHS" in `gem env`
SetEnv GEM_HOME /var/www/.rvm/gems/ruby-2.3.8@global
```
