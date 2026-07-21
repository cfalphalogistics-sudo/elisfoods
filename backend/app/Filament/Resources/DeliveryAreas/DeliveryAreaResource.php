<?php

namespace App\Filament\Resources\DeliveryAreas;

use App\Filament\Resources\DeliveryAreas\Pages\CreateDeliveryArea;
use App\Filament\Resources\DeliveryAreas\Pages\EditDeliveryArea;
use App\Filament\Resources\DeliveryAreas\Pages\ListDeliveryAreas;
use App\Filament\Resources\DeliveryAreas\Pages\ViewDeliveryArea;
use App\Filament\Resources\DeliveryAreas\Schemas\DeliveryAreaForm;
use App\Filament\Resources\DeliveryAreas\Schemas\DeliveryAreaInfolist;
use App\Filament\Resources\DeliveryAreas\Tables\DeliveryAreasTable;
use App\Models\DeliveryArea;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DeliveryAreaResource extends Resource
{
    protected static ?string $model = DeliveryArea::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return DeliveryAreaForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return DeliveryAreaInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DeliveryAreasTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDeliveryAreas::route('/'),
            'create' => CreateDeliveryArea::route('/create'),
            'view' => ViewDeliveryArea::route('/{record}'),
            'edit' => EditDeliveryArea::route('/{record}/edit'),
        ];
    }
}
