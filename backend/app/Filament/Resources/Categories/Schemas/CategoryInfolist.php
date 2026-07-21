<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CategoryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('slug'),
                        TextEntry::make('icon')
                            ->placeholder('-'),
                        ImageEntry::make('image')
                            ->label('Icon image')
                            ->placeholder('-'),
                        TextEntry::make('sort_order')
                            ->numeric(),
                        TextEntry::make('products_count')
                            ->label('Products')
                            ->numeric(),
                        IconEntry::make('is_active')
                            ->boolean(),
                    ]),
                Section::make('Timestamps')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('created_at')
                            ->dateTime(),
                        TextEntry::make('updated_at')
                            ->dateTime(),
                    ])
                    ->collapsible(),
            ]);
    }
}
