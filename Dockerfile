FROM ruby:3.2.3

RUN apt-get update -qq && apt-get install -y nodejs npm
RUN npm i --global bower

RUN groupadd -g 1000 www && useradd -u 1000 -g www -m www
USER www

RUN bundle config set path /duckofdoom/vendor/bundle

RUN gem install passenger

WORKDIR /duckofdoom

EXPOSE 3000
CMD ["passenger", "start", "--port", "3000"]
