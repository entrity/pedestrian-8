# docker build --name pedestrian:8.1.5 --build-arg USRID=$(id -u) .

FROM ruby:3.2.3

ARG USRID

RUN apt-get update -qq
RUN apt-get install -y nodejs npm
RUN npm i --global yarn bower

# To make troubleshooting easier
RUN apt-get install -y vim less default-mysql-client

RUN groupadd -g $USRID www && useradd -u $USRID -g www -m www
USER www

RUN bundle config set path /duckofdoom/vendor/bundle

RUN gem install passenger

WORKDIR /duckofdoom

EXPOSE 3000
CMD ["passenger", "start", "--port", "3000"]
