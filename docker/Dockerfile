FROM ubuntu

# Install common libraries
RUN apt-get update
RUN apt-get install -y curl gettext-base

# Install nodejs
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get install -y nodejs
RUN node -v

# Install nginx
RUN apt-get install -y nginx

# Build app
WORKDIR /app
COPY ./ ./
RUN npm install
COPY docker/.env.docker .
RUN envsubst < .env.docker > .env.production
RUN npm run build

# Copy nginx conf
COPY docker/nginx.conf /etc/nginx/sites-available/default

EXPOSE 80
CMD nginx && NODE_ENV=production npm run server
