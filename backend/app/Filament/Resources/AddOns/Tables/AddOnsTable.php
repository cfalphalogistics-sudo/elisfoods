<?php

namespace App\Filament\Resources\AddOns\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AddOnsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    Split::make([
                        Stack::make([
                            TextColumn::make('name')
                                ->weight(FontWeight::Bold)
                                ->searchable(),
                            TextColumn::make('category')
                                ->badge()
                                ->color('info'),
                        ]),
                        TextColumn::make('is_active')
                            ->badge()
                            ->formatStateUsing(fn (bool $state): string => $state ? 'Active' : 'Inactive')
                            ->color(fn (bool $state): string => $state ? 'success' : 'danger')
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('price_label')
                                ->default('Addon Price')
                                ->color('gray'),
                            TextColumn::make('price')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('products_label')
                                ->default('Linked Items')
                                ->color('gray'),
                            TextColumn::make('products_count')
                                ->weight(FontWeight::Bold),
                        ]),
                    ]),
                ])->space(3),
            ])
            ->filters([
                //
            ])
            ->actions([
                ViewAction::make(),
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
