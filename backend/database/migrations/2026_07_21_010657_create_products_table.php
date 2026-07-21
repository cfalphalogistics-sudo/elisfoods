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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->unsignedInteger('price'); // stored in smallest currency unit (pesewas)
            $table->unsignedInteger('compare_price')->nullable();
            $table->string('image')->nullable();
            $table->string('type'); // prepared, combo, marinated, frozen
            $table->unsignedInteger('prep_time')->nullable();
            $table->decimal('rating', 2, 1)->default(4.5);
            $table->string('badge')->nullable();
            $table->boolean('available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('options')->nullable(); // sizes, spiceLevels
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
