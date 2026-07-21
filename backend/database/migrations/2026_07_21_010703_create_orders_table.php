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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('customer_name');
            $table->string('phone');
            $table->string('alt_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('method'); // delivery, pickup
            $table->text('address')->nullable();
            $table->string('ghana_post_gps')->nullable();
            $table->string('landmark')->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->foreignId('delivery_area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('preferred_time')->nullable();
            $table->string('payment_method'); // hubtel, cash, whatsapp
            $table->string('status')->default('placed');
            $table->unsignedInteger('subtotal')->default(0);
            $table->unsignedInteger('add_ons_total')->default(0);
            $table->unsignedInteger('packaging_fee')->default(0);
            $table->unsignedInteger('delivery_fee')->default(0);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('total')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
