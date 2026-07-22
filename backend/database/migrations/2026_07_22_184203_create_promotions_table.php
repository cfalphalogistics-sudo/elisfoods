<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            // Identifies which spot on the site this banner fills (e.g.
            // "homepage_freezer", "menu_sidebar"), so the frontend can look
            // one up without depending on row order or a slug the admin types.
            $table->string('slot')->unique();
            $table->string('eyebrow')->nullable();
            $table->string('headline');
            $table->text('body')->nullable();
            $table->string('image')->nullable();
            $table->string('primary_label')->nullable();
            $table->string('primary_url')->nullable();
            $table->string('secondary_label')->nullable();
            $table->string('secondary_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
