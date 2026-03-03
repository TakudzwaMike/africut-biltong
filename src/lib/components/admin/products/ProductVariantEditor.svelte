<script>
    import Icon from "@iconify/svelte";

    /** @type {any} Variant object (bindable) */
    let {
        variant = $bindable(),
        suppliers = [],
        index = 0,
        onRemove,
        onSetDefault,
    } = $props();
</script>

<div
    class="relative grid grid-cols-1 gap-4 rounded-lg border border-main/10 bg-main/5 p-4 sm:grid-cols-6"
>
    <!-- Delete Button -->
    <button
        type="button"
        onclick={() => onRemove?.(index)}
        class="absolute right-2 top-2 text-red-500 hover:text-red-700"
        title="Remove Variant"
    >
        <Icon icon="mdi:close" />
    </button>

    <!-- Row 1: Name, SKU, Stock -->
    <div class="sm:col-span-2">
        <label class="mb-1 block text-xs font-bold text-main/60"
            >Variant Name</label
        >
        <input
            type="text"
            bind:value={variant.name}
            placeholder="Default"
            class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
        />
    </div>
    <div class="sm:col-span-2">
        <label class="mb-1 block text-xs font-bold text-main/60">SKU</label>
        <input
            type="text"
            bind:value={variant.sku}
            class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
        />
    </div>
    <div class="sm:col-span-2">
        <label class="mb-1 block text-xs font-bold text-main/60">Stock</label>
        <input
            type="number"
            bind:value={variant.stock}
            class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
        />
    </div>

    <!-- Row 2: Supplier, Supplier SKU, Raw Cost -->
    <div
        class="sm:col-span-6 grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-main/10 pt-4 mt-2"
    >
        <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Supplier</label
            >
            <select
                bind:value={variant.supplierId}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
            >
                <option value="">-- None --</option>
                {#each suppliers as s}
                    <option value={s.id}>{s.name} ({s.currency})</option>
                {/each}
            </select>
        </div>
        <div>
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Supplier SKU</label
            >
            <input
                type="text"
                bind:value={variant.supplierSku}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
            />
        </div>
        <div>
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Raw Cost</label
            >
            <input
                type="number"
                step="0.01"
                bind:value={variant.rawPrice}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm font-mono text-blue-600 font-bold"
            />
        </div>
    </div>

    <!-- Row 3: Shipping, Auto-Calc, Retail USD, Retail ZAR -->
    <div class="sm:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Shipping (Flat)</label
            >
            <input
                type="number"
                step="0.01"
                bind:value={variant.shippingFlatRate}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm"
            />
        </div>
        <div class="flex items-end pb-1">
            <button
                type="button"
                class="text-xs font-bold text-accent hover:underline"
                title="Simulate based on markup & exchange rate"
            >
                <Icon icon="mdi:calculator" class="inline" /> Auto-Calc
            </button>
        </div>
        <div>
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Retail (USD)</label
            >
            <input
                type="number"
                step="0.01"
                bind:value={variant.priceUsd}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm font-bold"
            />
        </div>
        <div>
            <label class="mb-1 block text-xs font-bold text-main/60"
                >Retail (ZAR)</label
            >
            <input
                type="number"
                step="0.01"
                bind:value={variant.priceZar}
                class="w-full rounded border-main/20 bg-white px-2 py-1.5 text-sm font-bold"
            />
        </div>
    </div>

    <!-- Row 4: Default Radio -->
    <div class="sm:col-span-6 flex items-center gap-2 pt-2">
        <input
            type="radio"
            name="defaultVariant"
            checked={variant.isDefault}
            onchange={() => onSetDefault?.(index)}
            class="text-accent focus:ring-accent"
        />
        <span class="text-xs font-medium text-main/80"
            >Set as Default Variant</span
        >
    </div>
</div>
