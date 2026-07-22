#!/bin/sh
set -e

# Ensure the persistent SQLite directory and file exist only when using SQLite
if [ "$DB_CONNECTION" = "sqlite" ]; then
    mkdir -p /var/www/html/database/storage
    touch /var/www/html/database/storage/database.sqlite
fi

# Run migrations on every startup
php /var/www/html/artisan migrate --force

# Seed the database if admin user does not exist
php /var/www/html/artisan tinker --execute='
$hasAdmin = \App\Models\User::where("email", "admin@elisfood.com")->exists();
exit($hasAdmin ? 0 : 1);
' >/dev/null 2>&1 || php /var/www/html/artisan db:seed --force

# Ensure Filament assets are published and caches are fresh
php /var/www/html/artisan filament:assets
php /var/www/html/artisan storage:link || true
php /var/www/html/artisan optimize

# Start Apache in the foreground
exec apache2-foreground
