<script>
    import Icon from "@iconify/svelte";
    let { data } = $props();
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-main">
                Suppliers
            </h1>
            <p class="text-sm text-main/60">
                Manage your product suppliers and markups.
            </p>
        </div>
        <a
            href="/_/admin/suppliers/new"
            class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            <Icon icon="mdi:plus" /> New Supplier
        </a>
    </div>

    <!-- Suppliers Table -->
    <div
        class="rounded-lg border border-main/10 bg-white shadow-sm overflow-hidden"
    >
        <table class="w-full text-left text-sm">
            <thead
                class="bg-main/5 text-xs uppercase text-main/60 font-bold border-b border-main/10"
            >
                <tr>
                    <th class="px-6 py-4">Name</th>
                    <th class="px-6 py-4">Contact</th>
                    <th class="px-6 py-4">Currency</th>
                    <th class="px-6 py-4">Default Markup</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-main/10">
                {#if data.suppliers.length === 0}
                    <tr>
                        <td
                            colspan="5"
                            class="px-6 py-12 text-center text-main/40 italic"
                        >
                            No suppliers found. Create one to get started.
                        </td>
                    </tr>
                {:else}
                    {#each data.suppliers as supplier}
                        <tr class="hover:bg-main/5 transition-colors">
                            <td class="px-6 py-4 font-medium text-main"
                                >{supplier.name}</td
                            >
                            <td class="px-6 py-4 text-main/70"
                                >{supplier.contactEmail || "-"}</td
                            >
                            <td
                                class="px-6 py-4 text-main/70 font-mono text-xs bg-main/5 rounded px-2 py-1 w-fit inline-block"
                                >{supplier.currency}</td
                            >
                            <td class="px-6 py-4 text-main/70"
                                >{supplier.defaultMarkup}%</td
                            >
                            <td class="px-6 py-4 text-right">
                                <a
                                    href="/_/admin/suppliers/{supplier.id}"
                                    class="text-main/60 hover:text-accent font-medium transition-colors"
                                    >Edit</a
                                >
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>
