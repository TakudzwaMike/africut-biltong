<script>
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";

    let { data } = $props();
    let loading = $state(false);
</script>

<div class="max-w-2xl mx-auto space-y-6">
    <a
        href="/_/admin/suppliers"
        class="flex items-center gap-2 text-sm text-main/60 hover:text-main transition-colors"
    >
        <Icon icon="mdi:arrow-left" /> Back to Suppliers
    </a>

    <h1 class="text-2xl font-bold tracking-tight text-main">Edit Supplier</h1>

    <div class="rounded-lg border border-main/10 bg-white p-8 shadow-sm">
        <form
            method="POST"
            action="?/update"
            id="edit-supplier-form"
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update();
                    loading = false;
                };
            }}
            class="space-y-6"
        >
            <div class="grid grid-cols-1 gap-6">
                <!-- Name -->
                <div class="space-y-1">
                    <label
                        for="name"
                        class="block text-sm font-bold text-main/80"
                        >Supplier Name</label
                    >
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={data.supplier.name}
                        required
                        class="w-full rounded-md border-main/20 bg-light/50 px-3 py-2 text-sm focus:border-accent focus:ring-accent"
                    />
                </div>

                <!-- Email -->
                <div class="space-y-1">
                    <label
                        for="contactEmail"
                        class="block text-sm font-bold text-main/80"
                        >Contact Email</label
                    >
                    <input
                        type="email"
                        name="contactEmail"
                        id="contactEmail"
                        value={data.supplier.contactEmail}
                        class="w-full rounded-md border-main/20 bg-light/50 px-3 py-2 text-sm focus:border-accent focus:ring-accent"
                    />
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <!-- Currency -->
                    <div class="space-y-1">
                        <label
                            for="currency"
                            class="block text-sm font-bold text-main/80"
                            >Default Currency</label
                        >
                        <select
                            name="currency"
                            id="currency"
                            value={data.supplier.currency}
                            class="w-full rounded-md border-main/20 bg-light/50 px-3 py-2 text-sm focus:border-accent focus:ring-accent"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CNY">CNY (¥)</option>
                        </select>
                    </div>

                    <!-- Markup -->
                    <div class="space-y-1">
                        <label
                            for="defaultMarkup"
                            class="block text-sm font-bold text-main/80"
                            >Default Markup (%)</label
                        >
                        <div class="relative">
                            <input
                                type="number"
                                name="defaultMarkup"
                                id="defaultMarkup"
                                min="0"
                                value={data.supplier.defaultMarkup}
                                class="w-full rounded-md border-main/20 bg-light/50 px-3 py-2 text-sm focus:border-accent focus:ring-accent pr-8"
                            />
                            <span
                                class="absolute right-3 top-2 text-main/40 text-sm font-bold"
                                >%</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <div
            class="flex items-center justify-between pt-4 border-t border-main/10"
        >
            <form
                action="?/delete"
                method="POST"
                use:enhance
                onsubmit={(e) =>
                    !confirm("Are you sure?") && e.preventDefault()}
            >
                <button
                    type="submit"
                    class="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                    Delete Supplier
                </button>
            </form>

            <div class="flex items-center gap-3">
                <a
                    href="/_/admin/suppliers"
                    class="px-4 py-2 text-sm font-medium text-main/60 hover:text-main transition-colors"
                    >Cancel</a
                >
                <button
                    type="submit"
                    form="edit-supplier-form"
                    disabled={loading}
                    class="flex items-center gap-2 rounded-md bg-accent px-6 py-2 text-sm font-bold text-white hover:bg-accent/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if loading}
                        <Icon icon="mdi:loading" class="animate-spin" /> Saving...
                    {:else}
                        Save Changes
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>
