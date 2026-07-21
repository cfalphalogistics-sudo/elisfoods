<?php

namespace App\Filament\Resources\Products\Tables;

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
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductsTable
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
                            TextColumn::make('category.name')
                                ->color('gray')
                                ->searchable(),
                        ]),
                        TextColumn::make('available')
                            ->badge()
                            ->formatStateUsing(fn (bool $state): string => $state ? 'Active' : 'Inactive')
                            ->color(fn (bool $state): string => $state ? 'success' : 'danger')
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('price_label')
                                ->default('Retail')
                                ->color('gray'),
                            TextColumn::make('price')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('compare_price_label')
                                ->default('Compare')
                                ->color('gray'),
                            TextColumn::make('compare_price')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold)
                                ->placeholder('GH₵ 0.00'),
                        ]),
                        Stack::make([
                            TextColumn::make('type')
                                ->badge()
                                ->color('info')
                                ->grow(false),
                        ]),
                    ]),
                ])->space(3),
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
