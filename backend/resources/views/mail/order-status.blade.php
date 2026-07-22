<x-mail::message>
# {{ $headline }}

{{ $message }}

<x-mail::panel>
**Order {{ $order->reference }}**

Status: **{{ ucfirst(str_replace('-', ' ', $order->status)) }}**<br>
Total: **GH₵ {{ number_format($order->total / 100, 2) }}**<br>
{{ $order->method === 'delivery' ? 'Delivery to: ' . ($order->address ?: 'your address') : 'Pickup order' }}
</x-mail::panel>

<x-mail::button :url="$trackUrl" color="primary">
Track your order
</x-mail::button>

Thanks,<br>
The Eli's Food team
</x-mail::message>
