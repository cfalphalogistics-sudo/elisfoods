<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: match ($this->order->status) {
                'confirmed' => "Order confirmed — {$this->order->reference}",
                'preparing' => "Your food is being prepared — {$this->order->reference}",
                'out-for-delivery' => "Your order is on its way! — {$this->order->reference}",
                'delivered' => "Order delivered — enjoy! — {$this->order->reference}",
                'cancelled' => "Order cancelled — {$this->order->reference}",
                default => "Order update — {$this->order->reference}",
            },
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.order-status',
            with: [
                'order' => $this->order,
                'headline' => $this->headline(),
                'message' => $this->statusMessage(),
                'trackUrl' => rtrim(config('app.frontend_url', ''), '/') . '/track?ref=' . urlencode($this->order->reference),
            ],
        );
    }

    private function headline(): string
    {
        return match ($this->order->status) {
            'confirmed' => 'Your order is confirmed! ✅',
            'preparing' => 'The kitchen is on it! 🍳',
            'out-for-delivery' => 'Your order is on its way! 🛵',
            'delivered' => 'Delivered — enjoy your meal! 🎉',
            'cancelled' => 'Your order was cancelled',
            default => 'Order update',
        };
    }

    private function statusMessage(): string
    {
        $name = explode(' ', trim($this->order->customer_name))[0] ?: 'there';

        return match ($this->order->status) {
            'confirmed' => "Hi {$name}, we've received your order and it's confirmed. We'll start preparing it shortly.",
            'preparing' => "Hi {$name}, our kitchen has started preparing your order. It won't be long now!",
            'out-for-delivery' => "Hi {$name}, your order has left the kitchen and is on its way to you.",
            'delivered' => "Hi {$name}, your order has been delivered. We hope you enjoy every bite — thank you for choosing Eli's Food!",
            'cancelled' => "Hi {$name}, your order has been cancelled. If this is unexpected, please contact us and we'll sort it out.",
            default => "Hi {$name}, there's an update on your order.",
        };
    }
}
