# Stage 1: PHP dependencies (vendor/ is needed by the Vite theme build below)
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --ignore-platform-reqs

# Stage 2: Frontend assets (Filament admin theme via Vite/Tailwind)
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.js ./
COPY resources ./resources
COPY app ./app
COPY --from=vendor /app/vendor ./vendor
RUN npm run build

# Stage 3: Application image
FROM php:8.4-apache

# Install dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    libsqlite3-dev \
    libpq-dev \
    && docker-php-ext-install intl pdo pdo_mysql pdo_sqlite pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Get Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Enable Apache rewrite module
RUN a2enmod rewrite

# Configure Apache document root and port for Fly.io
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}/!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -i 's/^Listen 80$/Listen 3000/' /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:3000>/' /etc/apache2/sites-available/*.conf

WORKDIR /var/www/html

# Copy application
COPY . .

# Compiled Vite assets from the build stage (public/build is gitignored)
COPY --from=assets /app/public/build ./public/build

ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Laravel writable paths and permissions
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

USER root
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER www-data

EXPOSE 3000
CMD ["/usr/local/bin/docker-entrypoint.sh"]
