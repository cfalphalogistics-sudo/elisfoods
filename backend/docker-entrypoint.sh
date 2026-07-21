#!/bin/sh
set -e

# Ensure the persistent SQLite directory and file exist only when using SQLite
if [ "$DB_CONNECTION" = "sqlite" ]; then
    mkdir -p /var/www/html/database/storage
    touch /var/www/html/database/storage/database.sqlite
fi

# Run migrations on every startup
php /var/www/html/artisan migrate --force

# Seed the database only if it looks empty (no categories)
php /var/www/html/artisan tinker --execute='
$hasData = \App\Models\Category::exists();
exit($hasData ? 0 : 1);
' >/dev/null 2>&1 || php /var/www/html/artisan db:seed --force

# Start Apache in the foreground
exec apache2-foreground
