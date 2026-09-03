<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CashierAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_access_the_pos_dashboard(): void
    {
        $cashier = User::factory()->create(['role' => 'kasir']);

        $this->actingAs($cashier)
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_cashier_cannot_access_admin_pages(): void
    {
        $cashier = User::factory()->create(['role' => 'kasir']);

        $this->actingAs($cashier)
            ->get(route('manage-inventory'))
            ->assertForbidden();
    }

    public function test_admin_can_access_the_pos_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk();
    }
}
