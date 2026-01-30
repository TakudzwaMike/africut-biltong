<script>
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";

    let { data } = $props();
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-main">
                Product Approvals
            </h1>
            <p class="text-sm text-main/60">
                Review and approve pending products for the storefront.
            </p>
        </div>
        <div class="flex gap-2">
            <a
                href="/_/admin/products"
                class="flex items-center gap-2 rounded-md border border-main/10 bg-white px-4 py-2 text-sm font-medium hover:bg-main/5 transition-colors"
            >
                All Products
            </a>
        </div>
    </div>

    <div
        class="rounded-lg border border-main/10 bg-white shadow-sm overflow-hidden"
    >
        <table class="w-full text-left text-sm">
            <thead
                class="bg-main/5 text-xs uppercase text-main/60 font-bold border-b border-main/10"
            >
                <tr>
                    <th class="px-6 py-4">Product</th>
                    <th class="px-6 py-4">Type</th>
                    <th class="px-6 py-4">Created At</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-main/10">
                {#if data.products.length === 0}
                    <tr>
                        <td
                            colspan="4"
                            class="px-6 py-12 text-center text-main/40 italic"
                        >
                            No pending products found. Great job!
                        </td>
                    </tr>
                {:else}
                    {#each data.products as product}
                        <tr class="hover:bg-main/5 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    {#if product.featuredImage}
                                        <img
                                            src={product.featuredImage
                                                .thumbnailUrl ||
                                                product.featuredImage
                                                    .originalUrl}
                                            alt={product.name}
                                            class="h-10 w-10 rounded-md object-cover bg-gray-100"
                                        />
                                    {:else}
                                        <div
                                            class="h-10 w-10 rounded-md bg-main/5 flex items-center justify-center text-main/30"
                                        >
                                            <Icon icon="mdi:image" width="20" />
                                        </div>
                                    {/if}
                                    <div>
                                        <p class="font-medium text-main">
                                            {product.name}
                                        </p>
                                        <p
                                            class="text-xs text-main/50 font-mono"
                                        >
                                            {product.slug}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 capitalize"
                                >
                                    {product.type}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-main/70">
                                {new Date(
                                    product.createdAt,
                                ).toLocaleDateString()}
                            </td>
                            <td
                                class="px-6 py-4 text-right flex items-center justify-end gap-2"
                            >
                                <a
                                    href="/_/admin/products/{product.id}"
                                    class="text-main/60 hover:text-main px-2 text-xs font-bold uppercase"
                                    >Review</a
                                >

                                <form
                                    method="POST"
                                    action="?/approve"
                                    use:enhance
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={product.id}
                                    />
                                    <button
                                        class="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-200 transition-colors"
                                    >
                                        <Icon icon="mdi:check" /> Approve
                                    </button>
                                </form>
                                <form
                                    method="POST"
                                    action="?/reject"
                                    use:enhance
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={product.id}
                                    />
                                    <button
                                        class="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors"
                                    >
                                        <Icon icon="mdi:close" /> Reject
                                    </button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    <!-- Simple Pagination -->
    {#if data.pagination.totalPages > 1}
        <div class="flex items-center justify-center gap-2 pt-4">
            <a
                href="?page={data.pagination.page - 1}"
                class="rounded-md border border-main/10 px-3 py-1 text-sm disabled:opacity-50 {data
                    .pagination.page === 1
                    ? 'pointer-events-none opacity-50'
                    : ''}"
            >
                Previous
            </a>
            <span class="text-xs text-main/50"
                >Page {data.pagination.page} of {data.pagination
                    .totalPages}</span
            >
            <a
                href="?page={data.pagination.page + 1}"
                class="rounded-md border border-main/10 px-3 py-1 text-sm disabled:opacity-50 {data
                    .pagination.page === data.pagination.totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''}"
            >
                Next
            </a>
        </div>
    {/if}
</div>
