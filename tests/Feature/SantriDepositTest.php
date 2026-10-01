<?php

namespace Tests\Feature;

use App\Models\Santri;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SantriDepositTest extends TestCase
{
    use RefreshDatabase;

    public function test_deposit_creates_santri_and_adds_balance(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);

        $response = $this->actingAs($user)->post('/santri/deposit', [
            'name' => 'Ahmad',
            'amount' => 250000,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('santris', [
            'name' => 'Ahmad',
            'balance' => 250000,
        ]);
        $this->assertDatabaseHas('santri_balance_entries', [
            'type' => 'deposit',
            'amount' => 250000,
        ]);
    }

    public function test_new_deposit_reduces_an_existing_negative_balance(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        $santri = Santri::create(['name' => 'Budi', 'balance' => -50000]);

        $this->actingAs($user)->post('/santri/deposit', [
            'name' => 'Budi',
            'amount' => 250000,
        ]);

        $this->assertSame('200000.00', $santri->refresh()->balance);
    }

    public function test_cashier_can_check_a_santri_balance(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        Santri::create(['name' => 'Dina', 'balance' => -75000]);

        $response = $this->actingAs($user)->getJson('/santri/balance?name=dina');

        $response
            ->assertOk()
            ->assertJson([
                'name' => 'Dina',
                'balance' => '-75000.00',
            ]);
    }

    public function test_cashier_can_view_and_export_santri_history(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        $santri = Santri::create(['name' => 'Eka', 'balance' => 25000]);

        $santri->balanceEntries()->create([
            'user_id' => $user->id,
            'type' => 'purchase',
            'amount' => -25000,
            'balance_after' => 0,
            'notes' => 'Pembelian kantin',
            'details' => [
                'items' => [
                    ['name' => 'Coffee', 'qty' => 1, 'price' => 25000],
                ],
            ],
        ]);

        $this->actingAs($user)
            ->getJson('/santri/history?name=eka')
            ->assertOk()
            ->assertJsonPath('entries.0.details.items.0.name', 'Coffee');

        $this->actingAs($user)
            ->get('/santri/history/export?name=eka')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_checkout_deducts_purchase_from_santri_balance(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        $santri = Santri::create(['name' => 'Citra', 'balance' => 250000]);
        $product = Product::create([
            'name' => 'Nasi Goreng',
            'sku' => 'TEST-NASI-GORENG',
            'price' => 50000,
            'stock' => 45,
            'category' => 'Makanan',
        ]);

        $response = $this->actingAs($user)->post('/checkout/process', [
            'cart' => [
                ['id' => $product->id, 'name' => $product->name, 'price' => 50000, 'qty' => 1, 'category' => 'Makanan'],
            ],
            'subtotal' => 50000,
            'total' => 50000,
            'customerName' => 'Citra',
            'paymentMethod' => 'deposit',
        ]);

        $response->assertRedirect(route('receipt.preview', absolute: false));
        $this->assertSame('200000.00', $santri->refresh()->balance);
        $this->assertDatabaseHas('santri_balance_entries', [
            'santri_id' => $santri->id,
            'type' => 'purchase',
            'amount' => -50000,
            'balance_after' => 200000,
        ]);
    }

    public function test_checkout_rejects_deposit_for_an_unregistered_name(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        $product = Product::create([
            'name' => 'Nasi Goreng',
            'sku' => 'TEST-NASI-GORENG-UNREGISTERED',
            'price' => 50000,
            'stock' => 45,
            'category' => 'Makanan',
        ]);

        $this->actingAs($user)->post('/checkout/process', [
            'cart' => [
                ['id' => $product->id, 'qty' => 1],
            ],
            'customerName' => 'Pengunjung Umum',
            'paymentMethod' => 'deposit',
        ])->assertStatus(422);

        // Nama asing tidak boleh ikut tercipta sebagai Santri dan saldo
        // produk juga harus utuh karena transaksi ditolak.
        $this->assertDatabaseMissing('santris', ['name' => 'Pengunjung Umum']);
        $this->assertSame(45, $product->refresh()->stock);
    }

    public function test_checkout_deducts_product_stock(): void
    {
        $user = User::factory()->create(['role' => 'kasir']);
        $product = Product::create([
            'name' => 'Nasi Goreng',
            'sku' => 'TEST-NASI-GORENG',
            'price' => 50000,
            'stock' => 45,
            'category' => 'Makanan',
        ]);

        $this->actingAs($user)->post('/checkout/process', [
            'cart' => [
                ['id' => $product->id, 'name' => $product->name, 'price' => 50000, 'qty' => 2, 'category' => 'Makanan'],
            ],
            'subtotal' => 100000,
            'total' => 100000,
            'customerName' => 'Pembeli Cash',
            'paymentMethod' => 'cash',
        ])->assertRedirect(route('receipt.preview', absolute: false));

        $this->assertSame(43, $product->refresh()->stock);
    }
}
