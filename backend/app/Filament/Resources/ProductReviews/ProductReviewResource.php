<?php

namespace App\Filament\Resources\ProductReviews;

use App\Filament\Resources\ProductReviews\Pages\ListProductReviews;
use App\Models\ProductReview;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Select;
use Filament\Schemas\Components\Textarea;
use Filament\Schemas\Components\TextInput;
use Filament\Schemas\Components\Toggle;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use UnitEnum;

class ProductReviewResource extends Resource
{
    protected static ?string $model = ProductReview::class;

    protected static ?string $navigationLabel = 'Product Reviews';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedStar;

    protected static string|UnitEnum|null $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Review Information')->schema([
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->required()
                    ->searchable(),
                TextInput::make('customer_name')
                    ->required()
                    ->maxLength(100),
                Select::make('rating')
                    ->options([
                        5 => '5 Stars ★★★★★',
                        4 => '4 Stars ★★★★☆',
                        3 => '3 Stars ★★★☆☆',
                        2 => '2 Stars ★★☆☆☆',
                        1 => '1 Star ★☆☆☆☆',
                    ])
                    ->required(),
                Textarea::make('comment')
                    ->rows(3)
                    ->maxLength(1000),
                TextInput::make('order_reference')
                    ->placeholder('EF-XXXX-XXXX'),
                Toggle::make('is_verified_purchase')
                    ->label('Verified Purchase'),
                Select::make('status')
                    ->options([
                        'approved' => 'Approved',
                        'pending' => 'Pending Review',
                        'rejected' => 'Rejected',
                    ])
                    ->required()
                    ->default('approved'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('product.name')
                    ->label('Product')
                    ->sortable()
                    ->searchable()
                    ->weight('bold'),
                TextColumn::make('customer_name')
                    ->label('Customer')
                    ->searchable(),
                TextColumn::make('rating')
                    ->label('Rating')
                    ->formatStateUsing(fn (int $state): string => str_repeat('★', $state) . str_repeat('☆', 5 - $state))
                    ->color('warning')
                    ->sortable(),
                TextColumn::make('comment')
                    ->label('Review Comment')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->comment),
                IconColumn::make('is_verified_purchase')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-mark'),
                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'approved',
                        'warning' => 'pending',
                        'danger' => 'rejected',
                    ]),
                TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('rating')
                    ->options([
                        5 => '5 Stars',
                        4 => '4 Stars',
                        3 => '3 Stars',
                        2 => '2 Stars',
                        1 => '1 Star',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'approved' => 'Approved',
                        'pending' => 'Pending',
                        'rejected' => 'Rejected',
                    ]),
                TernaryFilter::make('is_verified_purchase')
                    ->label('Verified Purchase'),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->hidden(fn (ProductReview $record) => $record->status === 'approved')
                    ->action(function (ProductReview $record) {
                        $record->update(['status' => 'approved']);
                        $record->product?->recalculateRating();
                        Notification::make()->success()->title('Review approved')->send();
                    }),
                Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->hidden(fn (ProductReview $record) => $record->status === 'rejected')
                    ->action(function (ProductReview $record) {
                        $record->update(['status' => 'rejected']);
                        $record->product?->recalculateRating();
                        Notification::make()->danger()->title('Review rejected')->send();
                    }),
                EditAction::make(),
                DeleteAction::make()
                    ->after(fn (ProductReview $record) => $record->product?->recalculateRating()),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProductReviews::route('/'),
        ];
    }
}
