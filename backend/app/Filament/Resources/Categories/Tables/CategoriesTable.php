<?php

namespace App\Filament\Resources\Categories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    Split::make([
                        ImageColumn::make('image')
                            ->square()
                            ->grow(false),
                        Stack::make([
                            TextColumn::make('name')
                                ->weight(FontWeight::Bold)
                                ->searchable(),
                            TextColumn::make('icon')
                                ->color('gray')
                                ->placeholder('Menu Category'),
                        ]),
                        TextColumn::make('is_active')
                            ->badge()
                            ->formatStateUsing(fn (bool $state): string => $state ? 'Active' : 'Inactive')
                            ->color(fn (bool $state): string => $state ? 'success' : 'danger')
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('sort_label')
                                ->default('Sort Order')
                                ->color('gray'),
                            TextColumn::make('sort_order')
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('products_label')
                                ->default('Dishes')
                                ->color('gray'),
                            TextColumn::make('products_count')
                                ->weight(FontWeight::Bold),
                        ]),
                    ]),
                ])->space(3),
            ])
            ->defaultSort('sort_order')
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
