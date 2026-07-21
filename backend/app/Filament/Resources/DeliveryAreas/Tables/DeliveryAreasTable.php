<?php

namespace App\Filament\Resources\DeliveryAreas\Tables;

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

class DeliveryAreasTable
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
                            TextColumn::make('slug')
                                ->color('gray')
                                ->searchable(),
                        ]),
                        TextColumn::make('is_active')
                            ->badge()
                            ->formatStateUsing(fn (bool $state): string => $state ? 'Active' : 'Inactive')
                            ->color(fn (bool $state): string => $state ? 'success' : 'danger')
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('fee_label')
                                ->default('Delivery Fee')
                                ->color('gray'),
                            TextColumn::make('fee')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('min_order_label')
                                ->default('Min Order')
                                ->color('gray'),
                            TextColumn::make('min_order')
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
