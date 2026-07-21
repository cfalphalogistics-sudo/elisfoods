<?php

namespace App\Filament\Resources\Coupons\Tables;

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

class CouponsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    Split::make([
                        Stack::make([
                            TextColumn::make('code')
                                ->weight(FontWeight::Bold)
                                ->color('primary')
                                ->searchable(),
                            TextColumn::make('type')
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
                            TextColumn::make('value_label')
                                ->default('Discount Value')
                                ->color('gray'),
                            TextColumn::make('value')
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('usage_label')
                                ->default('Used / Limit')
                                ->color('gray'),
                            TextColumn::make('usage_count')
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
