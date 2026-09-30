<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
            'size' => 'nullable|string|max:100',
            'variant' => 'nullable|string|max:100',
            'icon' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $base = Str::slug($validated['name'], '-');
        $sku = 'POS-' . strtoupper($base ?: 'ITEM') . '-' . strtoupper(Str::random(4));
        while (Product::where('sku', $sku)->exists()) {
            $sku = 'POS-' . strtoupper($base ?: 'ITEM') . '-' . strtoupper(Str::random(4));
        }
        $validated['sku'] = $sku;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('product-images', 'public');
        }

        Product::create($validated);

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
            'size' => 'nullable|string|max:100',
            'variant' => 'nullable|string|max:100',
            'icon' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image && !str_starts_with($product->image, 'http')) {
                Storage::disk('public')->delete($product->image);
            }

            $validated['image'] = $request->file('image')->store('product-images', 'public');
        } else {
            unset($validated['image']);
        }

        $product->update($validated);

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        if ($product->image && !str_starts_with($product->image, 'http')) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}
