<?php

namespace App\Filament\Pages;

use App\Models\StoreSetting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;

class ManageStoreSettings extends Page
{
    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedCog8Tooth;

    protected static ?string $navigationLabel = 'Store Settings';

    protected static string | \UnitEnum | null $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 100;

    protected static ?string $slug = 'store-settings';

    protected string $view = 'filament-panels::pages.page';

    public ?array $data = [];

    public function mount(): void
    {
        $this->fillForm();
    }

    protected function fillForm(): void
    {
        $this->form->fill([
            'phone' => StoreSetting::get('phone', ''),
            'whatsapp' => StoreSetting::get('whatsapp', ''),
            'email' => StoreSetting::get('email', ''),
            'social_facebook' => StoreSetting::get('social_facebook', ''),
            'social_instagram' => StoreSetting::get('social_instagram', ''),
            'social_tiktok' => StoreSetting::get('social_tiktok', ''),
            'hours_open' => StoreSetting::get('hours_open', '10:00'),
            'hours_close' => StoreSetting::get('hours_close', '21:00'),
            'packaging_fee' => ((int) StoreSetting::get('packaging_fee', 0)) / 100,
            'is_open' => filter_var(StoreSetting::get('is_open', 'true'), FILTER_VALIDATE_BOOLEAN),
            'payment_methods' => json_decode(StoreSetting::get('payment_methods', '[]'), true) ?: ['hubtel', 'cash', 'whatsapp'],
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('Contact')
                    ->columns(2)
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('phone')
                            ->tel()
                            ->required(),
                        \Filament\Forms\Components\TextInput::make('whatsapp')
                            ->tel()
                            ->required(),
                        \Filament\Forms\Components\TextInput::make('email')
                            ->email()
                            ->required(),
                    ]),

                Section::make('Social links')
                    ->columns(3)
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('social_facebook')
                            ->label('Facebook')
                            ->url(),
                        \Filament\Forms\Components\TextInput::make('social_instagram')
                            ->label('Instagram')
                            ->url(),
                        \Filament\Forms\Components\TextInput::make('social_tiktok')
                            ->label('TikTok')
                            ->url(),
                    ]),

                Section::make('Opening hours')
                    ->columns(2)
                    ->schema([
                        \Filament\Forms\Components\TimePicker::make('hours_open')
                            ->label('Opens at')
                            ->required(),
                        \Filament\Forms\Components\TimePicker::make('hours_close')
                            ->label('Closes at')
                            ->required(),
                    ]),

                Section::make('Store status & fees')
                    ->columns(2)
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('packaging_fee')
                            ->label('Packaging fee')
                            ->prefix('GH₵')
                            ->numeric()
                            ->required()
                            ->formatStateUsing(fn (?int $state): float => ($state ?? 0) / 100)
                            ->dehydrateStateUsing(fn (?float $state): int => (int) round(($state ?? 0) * 100)),
                        \Filament\Forms\Components\Toggle::make('is_open')
                            ->label('Open for orders')
                            ->required(),
                    ]),

                Section::make('Payment methods')
                    ->schema([
                        \Filament\Forms\Components\CheckboxList::make('payment_methods')
                            ->label('Payment methods shown to customers')
                            ->options([
                                'hubtel' => 'Hubtel',
                                'cash' => 'Cash on delivery',
                                'whatsapp' => 'WhatsApp / manual',
                            ])
                            ->default(['hubtel', 'cash', 'whatsapp'])
                            ->required()
                            ->columns(3),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            } elseif (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            }
            StoreSetting::set($key, (string) $value);
        }

        $this->getSavedNotification()?->send();
    }

    protected function getSavedNotification(): ?Notification
    {
        $title = $this->getSavedNotificationTitle();

        if (blank($title)) {
            return null;
        }

        return Notification::make()
            ->success()
            ->title($title);
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'Store settings saved';
    }

    public function getTitle(): string | Htmlable
    {
        return 'Store Settings';
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getFormContentComponent(),
            ]);
    }

    public function getFormContentComponent(): Component
    {
        return Form::make([EmbeddedSchema::make('form')])
            ->id('form')
            ->livewireSubmitHandler('save')
            ->footer([
                Actions::make($this->getFormActions())
                    ->alignment('left'),
            ]);
    }

    protected function getFormActions(): array
    {
        return [
            $this->getSaveFormAction(),
        ];
    }

    protected function getSaveFormAction(): Action
    {
        return Action::make('save')
            ->label('Save settings')
            ->submit('save')
            ->keyBindings(['mod+s']);
    }
}
