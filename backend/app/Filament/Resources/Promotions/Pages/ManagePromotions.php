<?php

namespace App\Filament\Resources\Promotions\Pages;

use App\Filament\Resources\Promotions\PromotionResource;
use Filament\Resources\Pages\ManageRecords;

class ManagePromotions extends ManageRecords
{
    protected static string $resource = PromotionResource::class;

    // No create/delete: each row is a fixed slot the frontend looks up by
    // key, seeded once. Admins edit content in place, they don't add slots.
    protected function getHeaderActions(): array
    {
        return [];
    }
}
