<?php

namespace App\Filament\Resources\DeliveryAreas\Pages;

use App\Filament\Resources\DeliveryAreas\DeliveryAreaResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewDeliveryArea extends ViewRecord
{
    protected static string $resource = DeliveryAreaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
