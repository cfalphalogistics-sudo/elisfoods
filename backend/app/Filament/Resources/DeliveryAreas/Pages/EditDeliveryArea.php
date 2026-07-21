<?php

namespace App\Filament\Resources\DeliveryAreas\Pages;

use App\Filament\Resources\DeliveryAreas\DeliveryAreaResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditDeliveryArea extends EditRecord
{
    protected static string $resource = DeliveryAreaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
