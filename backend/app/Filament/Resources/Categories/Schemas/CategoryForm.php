<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(function (Set $set, ?string $state, ?string $old) {
                        if (filled($state) && blank($old)) {
                            $set('slug', Str::slug($state));
                        }
                    }),
                TextInput::make('slug')
                    ->required()
                    ->unique('categories', 'slug', ignoreRecord: true),
                TextInput::make('icon')
                    ->placeholder('e.g. local_dining')
                    ->hint('Material Symbols icon name used by the frontend'),
                FileUpload::make('image')
                    ->label('Icon image')
                    ->image()
                    ->directory('categories')
                    ->maxSize(1024)
                    ->columnSpanFull(),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->required()
                    ->default(true),
            ]);
    }
}
