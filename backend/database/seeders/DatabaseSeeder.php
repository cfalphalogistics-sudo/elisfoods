<?php

namespace Database\Seeders;

use App\Models\AddOn;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\DeliveryArea;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\StoreSetting;
use App\Models\User;
use App\Models\Variation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@elisfood.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );

        $categories = [
            ['name' => 'All Dishes', 'slug' => 'all', 'icon' => 'restaurant_menu', 'sort_order' => 0],
            ['name' => 'Fried Turkey', 'slug' => 'fried-turkey', 'icon' => 'kebab_dining', 'sort_order' => 1],
            ['name' => 'Fish', 'slug' => 'fish', 'icon' => 'set_meal', 'sort_order' => 2],
            ['name' => 'Shrimp', 'slug' => 'shrimp', 'icon' => 'phishing', 'sort_order' => 3],
            ['name' => 'Squid', 'slug' => 'squid', 'icon' => 'content_cut', 'sort_order' => 4],
            ['name' => 'Chicken', 'slug' => 'chicken', 'icon' => 'dinner_dining', 'sort_order' => 5],
            ['name' => 'Main Meals', 'slug' => 'main-meals', 'icon' => 'restaurant', 'sort_order' => 6],
            ['name' => 'Sides', 'slug' => 'sides', 'icon' => 'rice_bowl', 'sort_order' => 7],
            ['name' => 'Sauces', 'slug' => 'sauces', 'icon' => 'soup_kitchen', 'sort_order' => 8],
            ['name' => 'Drinks', 'slug' => 'drinks', 'icon' => 'local_cafe', 'sort_order' => 9],
            ['name' => 'Combos', 'slug' => 'combos', 'icon' => 'fastfood', 'sort_order' => 10],
            ['name' => 'Marinated', 'slug' => 'marinated', 'icon' => 'kitchen', 'sort_order' => 11],
            ['name' => 'Frozen', 'slug' => 'frozen', 'icon' => 'ac_unit', 'sort_order' => 12],
        ];
        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }

        $addOns = [
            ['name' => 'Jollof Rice', 'slug' => 'jollof', 'category' => 'side', 'price' => 2500],
            ['name' => 'Fried Rice', 'slug' => 'fried-rice', 'category' => 'side', 'price' => 2500],
            ['name' => 'Plain Rice', 'slug' => 'plain-rice', 'category' => 'side', 'price' => 1500],
            ['name' => 'Fried Yam', 'slug' => 'fried-yam', 'category' => 'side', 'price' => 1800],
            ['name' => 'Banku', 'slug' => 'banku', 'category' => 'side', 'price' => 2000],
            ['name' => 'Kenkey', 'slug' => 'kenkey', 'category' => 'side', 'price' => 1200],
            ['name' => 'Coleslaw', 'slug' => 'coleslaw', 'category' => 'side', 'price' => 1000],
            ['name' => 'Shito', 'slug' => 'shito', 'category' => 'sauce', 'price' => 500],
            ['name' => 'Fresh Pepper', 'slug' => 'fresh-pepper', 'category' => 'sauce', 'price' => 500],
            ['name' => 'Ketchup', 'slug' => 'ketchup', 'category' => 'sauce', 'price' => 300],
            ['name' => 'Mayonnaise', 'slug' => 'mayonnaise', 'category' => 'sauce', 'price' => 400],
            ['name' => 'Extra Turkey', 'slug' => 'extra-turkey', 'category' => 'protein', 'price' => 3500],
            ['name' => 'Extra Fish', 'slug' => 'extra-fish', 'category' => 'protein', 'price' => 4500],
            ['name' => 'Extra Shrimp', 'slug' => 'extra-shrimp', 'category' => 'protein', 'price' => 5500],
            ['name' => 'Water', 'slug' => 'water', 'category' => 'drink', 'price' => 500],
            ['name' => 'Soft Drink', 'slug' => 'soft-drink', 'category' => 'drink', 'price' => 1000],
            ['name' => 'Juice', 'slug' => 'juice', 'category' => 'drink', 'price' => 1500],
        ];
        foreach ($addOns as $addOn) {
            AddOn::firstOrCreate(['slug' => $addOn['slug']], $addOn);
        }

        $deliveryAreas = [
            ['name' => 'Lashibi', 'slug' => 'lashibi', 'fee' => 2000, 'min_order' => 5000],
            ['name' => 'Spintex', 'slug' => 'spintex', 'fee' => 2500, 'min_order' => 5000],
            ['name' => 'Sakumono', 'slug' => 'sakumono', 'fee' => 2000, 'min_order' => 5000],
            ['name' => 'Accra Central', 'slug' => 'accra-central', 'fee' => 3500, 'min_order' => 8000],
            ['name' => 'Tema Community', 'slug' => 'tema', 'fee' => 3000, 'min_order' => 6000],
            ['name' => 'East Legon', 'slug' => 'east-legon', 'fee' => 3000, 'min_order' => 6000],
            ['name' => 'Osu', 'slug' => 'osu', 'fee' => 2500, 'min_order' => 5000],
        ];
        foreach ($deliveryAreas as $area) {
            DeliveryArea::firstOrCreate(['slug' => $area['slug']], $area);
        }

        Coupon::firstOrCreate(
            ['code' => 'ELI10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_order' => 5000,
                'usage_limit' => 100,
                'expires_at' => now()->addMonths(3),
            ]
        );
        Coupon::firstOrCreate(
            ['code' => 'FREEDEL'],
            [
                'type' => 'free_delivery',
                'value' => 0,
                'min_order' => 8000,
                'usage_limit' => 50,
                'expires_at' => now()->addMonths(1),
            ]
        );

        $settings = [
            'phone' => '0249875848',
            'whatsapp' => '233249875848',
            'email' => 'hello@elisfood.com',
            'social_facebook' => 'https://facebook.com/Elis_Food',
            'social_instagram' => 'https://instagram.com/Elis_Food',
            'social_tiktok' => 'https://tiktok.com/@Elis_Food',
            'hours_open' => '10:00',
            'hours_close' => '21:00',
            'is_open' => 'true',
            'packaging_fee' => '500',
            'payment_methods' => json_encode(['hubtel', 'cash', 'whatsapp']),
        ];
        foreach ($settings as $key => $value) {
            StoreSetting::set($key, $value);
        }

        $this->seedProducts();
        $this->seedOrders();
    }

    private function seedOrders(): void
    {
        if (Order::exists()) {
            return;
        }

        $product = Product::where('slug', 'fried-turkey-jollof')->first();
        $area = DeliveryArea::where('slug', 'lashibi')->first();

        if (! $product || ! $area) {
            return;
        }

        $subtotal = 7500;
        $deliveryFee = $area->fee;
        $packagingFee = 500;
        $total = $subtotal + $deliveryFee + $packagingFee;

        $order = Order::create([
            'reference' => 'ELI-' . strtoupper(uniqid()),
            'customer_name' => 'John Doe',
            'phone' => '0240000000',
            'email' => 'john@example.com',
            'method' => 'delivery',
            'address' => '123 Test Street',
            'delivery_area_id' => $area->id,
            'payment_method' => 'hubtel',
            'status' => 'confirmed',
            'subtotal' => $subtotal,
            'add_ons_total' => 0,
            'packaging_fee' => $packagingFee,
            'delivery_fee' => $deliveryFee,
            'discount' => 0,
            'total' => $total,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'quantity' => 1,
            'size' => 'Regular',
            'spice_level' => 'Medium',
            'instructions' => 'Please pack neatly',
            'add_ons' => [],
        ]);
    }

    private function seedProducts(): void
    {
        $categoryMap = Category::pluck('id', 'slug');
        $addOnMap = AddOn::pluck('id', 'slug');

        $products = [
            [
                'name' => 'Fried Turkey + Jollof',
                'slug' => 'fried-turkey-jollof',
                'description' => 'Signature fried turkey served with authentic jollof.',
                'long_description' => 'Crispy on the outside, juicy on the inside.',
                'category_slug' => 'combos',
                'price' => 7500,
                'compare_price' => 9000,
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3f?auto=format&fit=crop&w=800&q=80',
                'badge' => 'HOT',
                'rating' => 4.9,
                'prep_time' => 25,
                'available' => true,
                'type' => 'prepared',
                'options' => [
                    'sizes' => [
                        ['label' => 'Regular', 'price' => 0],
                        ['label' => 'Large', 'price' => 2500],
                        ['label' => 'Family Pack', 'price' => 6500],
                    ],
                    'spiceLevels' => ['Mild', 'Medium', 'Hot', 'Extra Hot'],
                ],
                'addOns' => ['coleslaw', 'shito', 'fresh-pepper', 'extra-turkey', 'juice'],
            ],
            [
                'name' => 'Crispy Fried Turkey',
                'slug' => 'crispy-fried-turkey',
                'description' => 'Wings marinated in special spices for 24 hours and fried to golden perfection.',
                'long_description' => 'A customer favourite.',
                'category_slug' => 'fried-turkey',
                'price' => 4500,
                'compare_price' => 5500,
                'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
                'badge' => 'Bestseller',
                'rating' => 4.8,
                'prep_time' => 20,
                'available' => true,
                'type' => 'prepared',
                'options' => [
                    'sizes' => [
                        ['label' => 'Regular', 'price' => 0],
                        ['label' => 'Large', 'price' => 2000],
                        ['label' => 'Family Pack', 'price' => 5500],
                    ],
                    'spiceLevels' => ['Mild', 'Medium', 'Hot'],
                ],
                'addOns' => ['jollof', 'fried-rice', 'fried-yam', 'shito', 'fresh-pepper', 'extra-turkey', 'soft-drink'],
            ],
            [
                'name' => 'Grilled Tilapia',
                'slug' => 'grilled-tilapia',
                'description' => 'Whole fresh tilapia seasoned with ginger, garlic, and local herbs.',
                'long_description' => 'Fresh tilapia from the coast.',
                'category_slug' => 'fish',
                'price' => 8500,
                'compare_price' => null,
                'image' => 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
                'badge' => 'Fresh Catch',
                'rating' => 4.7,
                'prep_time' => 30,
                'available' => true,
                'type' => 'prepared',
                'options' => [
                    'sizes' => [
                        ['label' => 'Regular', 'price' => 0],
                        ['label' => 'Large', 'price' => 2500],
                    ],
                    'spiceLevels' => ['Mild', 'Medium', 'Hot'],
                ],
                'addOns' => ['banku', 'fried-yam', 'kenkey', 'shito', 'fresh-pepper', 'extra-fish', 'water'],
            ],
            [
                'name' => 'Garlic Butter Shrimp',
                'slug' => 'fried-shrimp',
                'description' => 'Jumbo shrimps sautéed in creamy garlic butter with a touch of chili.',
                'long_description' => 'Plump jumbo shrimp.',
                'category_slug' => 'shrimp',
                'price' => 12000,
                'compare_price' => null,
                'image' => 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
                'badge' => 'New',
                'rating' => 4.8,
                'prep_time' => 20,
                'available' => true,
                'type' => 'prepared',
                'options' => [
                    'sizes' => [
                        ['label' => 'Regular', 'price' => 0],
                        ['label' => 'Large', 'price' => 3500],
                    ],
                    'spiceLevels' => ['Mild', 'Medium', 'Hot', 'Extra Hot'],
                ],
                'addOns' => ['fried-rice', 'jollof', 'fried-yam', 'shito', 'extra-shrimp', 'juice'],
            ],
            [
                'name' => 'Spiced Goat Meat',
                'slug' => 'spiced-goat-meat',
                'description' => 'Pre-marinated premium goat meat, ready for your grill or oven.',
                'long_description' => 'Tender goat meat cuts marinated in our house spice blend.',
                'category_slug' => 'marinated',
                'price' => 9500,
                'compare_price' => null,
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
                'badge' => null,
                'rating' => 4.8,
                'prep_time' => null,
                'available' => true,
                'type' => 'marinated',
                'variations' => [
                    ['label' => '500g', 'price' => 5000, 'stock_quantity' => 12],
                    ['label' => '1kg', 'price' => 9500, 'stock_quantity' => 20],
                    ['label' => '2kg', 'price' => 18000, 'stock_quantity' => 8],
                ],
            ],
            [
                'name' => 'Frozen Whole Chicken',
                'slug' => 'frozen-whole-chicken',
                'description' => 'Premium farm-reared chicken, cleaned and blast-frozen.',
                'long_description' => 'Whole chicken from trusted Ghanaian farms.',
                'category_slug' => 'frozen',
                'price' => 5500,
                'compare_price' => null,
                'image' => 'https://images.unsplash.com/photo-1587593810167-a84920ea7cf5?auto=format&fit=crop&w=800&q=80',
                'badge' => null,
                'rating' => 4.5,
                'prep_time' => null,
                'available' => true,
                'type' => 'frozen',
                'variations' => [
                    ['label' => '~1kg', 'price' => 4500, 'stock_quantity' => 15],
                    ['label' => '~1.2kg', 'price' => 5500, 'stock_quantity' => 20],
                    ['label' => '~2kg', 'price' => 9000, 'stock_quantity' => 6],
                ],
            ],
            [
                'name' => 'Family Turkey Pack',
                'slug' => 'family-turkey-pack',
                'description' => 'Generous portion of fried turkey, jollof, coleslaw and drinks for the whole family.',
                'long_description' => 'Serves 4–6.',
                'category_slug' => 'combos',
                'price' => 22000,
                'compare_price' => 26000,
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3f?auto=format&fit=crop&w=800&q=80',
                'badge' => 'BESTSELLER',
                'rating' => 4.9,
                'prep_time' => 35,
                'available' => true,
                'type' => 'combo',
                'options' => [
                    'sizes' => [
                        ['label' => 'Family (4-6)', 'price' => 0],
                        ['label' => 'Party (8-10)', 'price' => 12000],
                    ],
                    'spiceLevels' => ['Mild', 'Medium', 'Hot'],
                ],
                'addOns' => [],
            ],
        ];

        foreach ($products as $data) {
            $addOnSlugs = $data['addOns'] ?? [];
            unset($data['addOns']);
            $variations = $data['variations'] ?? [];
            unset($data['variations']);
            $categorySlug = $data['category_slug'];
            unset($data['category_slug']);

            $data['category_id'] = $categoryMap[$categorySlug] ?? null;
            $product = Product::firstOrCreate(['slug' => $data['slug']], $data);

            if (! empty($addOnSlugs)) {
                $product->addOns()->sync(
                    collect($addOnSlugs)->map(fn ($slug) => $addOnMap[$slug] ?? null)->filter()->values()
                );
            }

            foreach ($variations as $variation) {
                $product->variations()->create($variation);
            }
        }

        Promotion::firstOrCreate(['slot' => 'homepage_freezer'], [
            'eyebrow' => 'Home Cooking Made Easy',
            'headline' => 'Stock Your Freezer',
            'body' => "Skip the prep! Our vacuum-sealed marinated meats and pre-portioned frozen products are ready to cook whenever you are.",
            'image' => 'https://images.unsplash.com/photo-1607623814075-e51df1bd6567?auto=format&fit=crop&w=1200&q=80',
            'primary_label' => 'Shop Marinated Meat',
            'primary_url' => '/menu?category=marinated',
            'secondary_label' => 'View Frozen Range',
            'secondary_url' => '/menu?category=frozen',
            'is_active' => true,
        ]);

        Promotion::firstOrCreate(['slot' => 'menu_sidebar'], [
            'eyebrow' => 'Weekly Special',
            'headline' => 'Free Delivery on orders over ₵200',
            'primary_label' => 'Order Now',
            'primary_url' => '/menu',
            'is_active' => true,
        ]);
    }
}
