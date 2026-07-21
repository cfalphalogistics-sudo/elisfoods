<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_can_be_created_via_api(): void
    {
        $this->seed();

        $payload = [
            'items' => [
                [
                    'product_id' => null,
                    'name' => 'Fried Turkey + Jollof',
                    'price' => 75,
                    'quantity' => 2,
                    'size' => 'Large',
                    'spice_level' => 'Medium',
                    'variation_label' => null,
                    'instructions' => 'Extra shito',
                    'add_ons' => [
                        ['name' => 'Coleslaw', 'price' => 10],
                    ],
                ],
            ],
            'customer' => [
                'name' => 'John Doe',
                'phone' => '0249875848',
                'alt_phone' => null,
                'email' => null,
                'method' => 'delivery',
                'address' => 'Community 18, Lashibi',
                'ghana_post_gps' => 'GT-123-4567',
                'landmark' => 'Shell filling station',
                'delivery_instructions' => 'Gate code 1234',
                'area' => 'lashibi',
                'preferred_time' => '12:30 PM',
            ],
            'payment_method' => 'whatsapp',
            'totals' => [
                'subtotal' => 150,
                'add_ons_total' => 20,
                'packaging_fee' => 5,
                'delivery_fee' => 20,
                'discount' => 0,
                'total' => 195,
            ],
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('reference', fn ($reference) => str_starts_with($reference, 'EF-'))
            ->assertJsonPath('status', 'placed');

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'John Doe',
            'phone' => '0249875848',
            'total' => 19500,
        ]);
    }
}
