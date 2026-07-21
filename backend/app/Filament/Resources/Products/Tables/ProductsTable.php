<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->circular(),
                TextColumn::make('category.name')
                    ->searchable(),
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('price')
                    ->money('GHS', 100)
                    ->sortable(),
                TextColumn::make('compare_price')
                    ->money('GHS', 100)
                    ->sortable()
                    ->placeholder('-'),
                TextColumn::make('type')
                    ->badge()
                    ->searchable(),
                TextColumn::make('prep_time')
                    ->numeric()
                    ->suffix(' mins')
                    ->sortable()
                    ->placeholder('-'),
                TextColumn::make('rating')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('badge')
                    ->placeholder('-')
                    ->searchable(),
                IconColumn::make('available')
                    ->boolean(),
                IconColumn::make('is_featured')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'prepared' => 'Prepared',
                        'marinated' => 'Marinated',
                        'frozen' => 'Frozen',
                        'combo' => 'Combo',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make()
                    ->slideOver(),
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
