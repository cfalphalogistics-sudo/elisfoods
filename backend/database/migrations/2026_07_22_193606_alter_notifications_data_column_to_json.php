<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Laravel's default notifications migration stores `data` as text, but
     * Filament's notification queries use Postgres's `->>` JSON operator,
     * which errors ("operator does not exist: text ->> unknown") unless the
     * column is actually typed json/jsonb. SQLite has no such restriction
     * (json_extract works on any text column), which is why this only
     * surfaced on Render's Postgres database, not locally.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications ALTER COLUMN data TYPE jsonb USING data::jsonb');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications ALTER COLUMN data TYPE text');
        }
    }
};
