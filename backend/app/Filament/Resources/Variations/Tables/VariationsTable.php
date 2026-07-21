<?php

namespace App\Filament\Resources\Variations\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class VariationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    Split::make([
                        Stack::make([
                            TextColumn::make('label')
                                ->weight(FontWeight::Bold)
                                ->searchable(),
                            TextColumn::make('product.name')
                                ->color('gray')
                                ->searchable(),
                        ]),
                        TextColumn::make('stock_quantity')
                            ->badge()
                            ->formatStateUsing(fn ($state) => "{$state} in stock")
                            ->color(fn ($state) => $state > 5 ? 'success' : 'danger')
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('price_label')
                                ->default('Variation Price')
                                ->color('gray'),
                            TextColumn::make('price')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold),
                        ]),
                    ]),
                ])->space(3),
            ])
            ->filters([
                //
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
            ->contentGrid([
                'default' => 1,
                'md' => 2,
                'xl' => 3,
            ]);
    }
}
