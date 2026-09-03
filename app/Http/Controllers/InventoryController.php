<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $inventories = Inventory::orderBy('created_at', 'desc')->get();

        return Inertia::render('ManageInventory', [
            'inventories' => $inventories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'qty' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
        ]);

        // Hitung total harga otomatis (qty x price) untuk pengeluaran
        $validated['total_price'] = $validated['qty'] * $validated['price'];
        $validated['status'] = $validated['qty'] > 5 ? 'aman' : 'menipis';

        Inventory::create($validated);

        return redirect()->back()->with('success', 'Bahan baru berhasil ditambahkan.');
    }

    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'qty' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
        ]);

        $validated['total_price'] = $validated['qty'] * $validated['price'];
        $validated['status'] = $validated['qty'] > 5 ? 'aman' : 'menipis';

        $inventory->update($validated);

        return redirect()->back()->with('success', 'Stok berhasil diperbarui.');
    }
}