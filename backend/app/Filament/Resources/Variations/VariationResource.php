<?php

namespace App\Filament\Resources\Variations;

use App\Filament\Resources\Variations\Pages\CreateVariation;
use App\Filament\Resources\Variations\Pages\EditVariation;
use App\Filament\Resources\Variations\Pages\ListVariations;
use App\Filament\Resources\Variations\Schemas\VariationForm;
use App\Filament\Resources\Variations\Tables\VariationsTable;
use App\Models\Variation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class VariationResource extends Resource
{
    protected static ?string $model = Variation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return VariationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return VariationsTable::configure($table);
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
            'index' => ListVariations::route('/'),
            'create' => CreateVariation::route('/create'),
            'edit' => EditVariation::route('/{record}/edit'),
        ];
    }
}
