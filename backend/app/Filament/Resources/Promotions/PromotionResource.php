<?php

namespace App\Filament\Resources\Promotions;

use App\Filament\Resources\Promotions\Pages\ManagePromotions;
use App\Models\Promotion;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section as FormSection;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PromotionResource extends Resource
{
    protected static ?string $model = Promotion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMegaphone;

    protected static ?string $navigationLabel = 'Promotions';

    protected static string|\UnitEnum|null $navigationGroup = 'Management';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'promotion banner';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormSection::make()
                    ->schema([
                        TextInput::make('slot')
                            ->label('Slot')
                            ->disabled()
                            ->dehydrated()
                            ->helperText('Fixed identifier the website looks up — not editable.'),
                        Toggle::make('is_active')
                            ->label('Show on the website')
                            ->default(true),
                    ])
                    ->columns(2),

                FormSection::make('Content')
                    ->schema([
                        TextInput::make('eyebrow')
                            ->label('Eyebrow (small label above the headline)')
                            ->maxLength(60),
                        TextInput::make('headline')
                            ->required()
                            ->maxLength(120),
                        Textarea::make('body')
                            ->label('Body text')
                            ->rows(3)
                            ->maxLength(300),
                        FileUpload::make('image')
                            ->image()
                            ->directory('promotions')
                            ->maxSize(2048)
                            ->helperText('Optional. Only used by banners with a background image.'),
                    ]),

                FormSection::make('Buttons')
                    ->schema([
                        TextInput::make('primary_label')
                            ->label('Primary button label'),
                        TextInput::make('primary_url')
                            ->label('Primary button link')
                            ->helperText('A path like /menu?category=frozen, or a full https:// URL.'),
                        TextInput::make('secondary_label')
                            ->label('Secondary button label'),
                        TextInput::make('secondary_url')
                            ->label('Secondary button link'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('slot')
                    ->badge()
                    ->color('gray'),
                ImageColumn::make('image')
                    ->square(),
                TextColumn::make('headline')
                    ->weight('bold')
                    ->searchable(),
                TextColumn::make('primary_label')
                    ->label('Primary button')
                    ->placeholder('—'),
                IconColumn::make('is_active')
                    ->label('Live')
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManagePromotions::route('/'),
        ];
    }
}
