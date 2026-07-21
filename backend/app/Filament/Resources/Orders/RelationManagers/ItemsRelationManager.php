<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    public function form(Schema $schema): Schema
    {
        $pesewasToMoney = fn (?int $state): float => ($state ?? 0) / 100;
        $moneyToPesewas = fn (?float $state): int => (int) round(($state ?? 0) * 100);

        return $schema
            ->components([
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->preload()
                    ->searchable(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('GH₵')
                    ->formatStateUsing($pesewasToMoney)
                    ->dehydrateStateUsing($moneyToPesewas),
                TextInput::make('quantity')
                    ->required()
                    ->numeric()
                    ->default(1),
                TextInput::make('size'),
                TextInput::make('spice_level'),
                TextInput::make('variation_label'),
                Textarea::make('instructions')
                    ->columnSpanFull(),
                Textarea::make('add_ons')
                    ->hint('Stored as JSON')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('product.name')
                    ->placeholder('-')
                    ->searchable(),
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('price')
                    ->money('GHS', 100)
                    ->sortable(),
                TextColumn::make('quantity')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('size')
                    ->placeholder('-'),
                TextColumn::make('spice_level')
                    ->placeholder('-'),
                TextColumn::make('variation_label')
                    ->placeholder('-'),
                TextColumn::make('add_ons')
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', array_column($state, 'name')) : '-')
                    ->placeholder('-'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->stackedOnMobile()
            ->contentGrid([
                'default' => 1,
                'md' => 2,
                'xl' => 3,
            ]);
    }
}
