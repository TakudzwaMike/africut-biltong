<script>
    import { enhance } from "$app/forms";
    import { toast } from "$lib/toast-service";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import DataTable from "$lib/components/admin/DataTable.svelte";
    import Icon from "@iconify/svelte";

    let { data } = $props();

    // Search & View State
    let searchQuery = $state(data.pagination.query || "");
    let currentView = $derived(data.pagination.view || "all");
    let searchTimeout;

    function handleSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateUrl({ q: searchQuery, page: 1 });
        }, 400);
    }

    function changePage(newPage) {
        updateUrl({ page: newPage });
    }

    function changeView(view) {
        // Clear search when switching views for cleaner UX
        searchQuery = "";
        updateUrl({ view, page: 1, q: "" });
    }

    function updateUrl(params) {
        const url = new URL($page.url);
        for (const [key, value] of Object.entries(params)) {
            if (value) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        }
        goto(url, { keepFocus: true, noScroll: true });
    }

    function handleRoleUpdate() {
        return ({ result, update }) => {
            if (result.type === "success") toast.success("Role updated");
            else toast.error(result.data?.message || "Failed");
            update({ reset: false });
        };
    }

    function handleDelete() {
        return ({ result, update }) => {
            if (result.type === "success") toast.success("User deleted");
            else toast.error(result.data?.message || "Failed");
            update();
        };
    }

    function handleAction() {
        return ({ result, update }) => {
            if (result.type === "success")
                toast.success(result.data?.message || "Done");
            else toast.error(result.data?.message || "Failed");
            update({ reset: false });
        };
    }

    const columns = [
        { label: "User" },
        { label: "Role" },
        { label: "Joined" },
        { label: "Actions", class: "text-right" },
    ];
</script>

<div class="p-8">
    <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8"
    >
        <div>
            <h1 class="text-3xl font-bold tracking-tight text-main">Users</h1>
            <p class="mt-2 text-base text-main/70">
                Manage customers and staff access.
            </p>
        </div>

        <div class="flex flex-col items-end gap-4 sm:flex-row">
            <!-- Invite Button -->
            <a
                href="/_/admin/users/invite"
                class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
            >
                <Icon icon="mdi:email-plus" />
                <span>Invite User</span>
            </a>
        </div>
    </div>

    <!-- Tabs & Search Bar -->
    <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
        <!-- Tabs -->
        <div class="flex items-center gap-1 bg-main/5 p-1 rounded-lg w-fit">
            <button
                onclick={() => changeView("all")}
                class="px-4 py-1.5 rounded-md text-sm font-bold transition-all {currentView ===
                'all'
                    ? 'bg-white text-main shadow-sm'
                    : 'text-main/60 hover:text-main'}"
            >
                All
            </button>
            <button
                onclick={() => changeView("staff")}
                class="px-4 py-1.5 rounded-md text-sm font-bold transition-all {currentView ===
                'staff'
                    ? 'bg-white text-main shadow-sm'
                    : 'text-main/60 hover:text-main'}"
            >
                Staff
            </button>
            <button
                onclick={() => changeView("customer")}
                class="px-4 py-1.5 rounded-md text-sm font-bold transition-all {currentView ===
                'customer'
                    ? 'bg-white text-main shadow-sm'
                    : 'text-main/60 hover:text-main'}"
            >
                Customers
            </button>
        </div>

        <!-- Search -->
        <div class="relative w-full sm:w-64">
            <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
                <Icon icon="mdi:magnify" class="text-main/40" />
            </div>
            <input
                type="text"
                placeholder="Search users..."
                bind:value={searchQuery}
                oninput={handleSearchInput}
                class="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
            />
        </div>
    </div>

    <DataTable
        items={data.users}
        {columns}
        emptyMessage="No users found matching your criteria."
        row={userRow}
    />

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
        <div
            class="mt-6 flex items-center justify-between border-t border-main/10 pt-6"
        >
            <div class="text-sm text-main/60">
                Page <span class="font-bold text-main"
                    >{data.pagination.page}</span
                >
                of
                <span class="font-bold text-main"
                    >{data.pagination.totalPages}</span
                >
            </div>
            <div class="flex gap-2">
                <button
                    onclick={() => changePage(data.pagination.page - 1)}
                    disabled={data.pagination.page <= 1}
                    class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
                    ><Icon icon="mdi:chevron-left" /> Previous</button
                >
                <button
                    onclick={() => changePage(data.pagination.page + 1)}
                    disabled={data.pagination.page >=
                        data.pagination.totalPages}
                    class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >Next <Icon icon="mdi:chevron-right" /></button
                >
            </div>
        </div>
    {/if}
</div>

{#snippet userRow(u)}
    <td class="p-4">
        <div class="flex items-center gap-3">
            <div
                class="h-10 w-10 rounded-full bg-main/10 flex items-center justify-center text-main/60 font-bold"
            >
                {(u.firstName?.[0] || u.email[0]).toUpperCase()}
            </div>
            <div>
                <p class="font-bold text-main">
                    {u.firstName || "No Name"}
                    {u.lastName || ""}
                </p>
                <p class="text-xs text-main/60">{u.email}</p>
            </div>
        </div>
    </td>
    <td class="p-4">
        <form
            method="POST"
            action="?/updateRole"
            use:enhance={handleRoleUpdate}
        >
            <input type="hidden" name="id" value={u.id} />
            <select
                name="role"
                class="rounded-md border-main/20 bg-main/5 px-3 py-1 text-xs font-bold uppercase tracking-wide cursor-pointer focus:ring-2 focus:ring-accent w-36"
                onchange={(e) => e.target.form.requestSubmit()}
                value={u.role}
            >
                <optgroup label="Staff">
                    <option value="admin">Admin</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="content_editor">Content Editor</option>
                </optgroup>
                <optgroup label="Users">
                    <option value="customer">Customer</option>
                </optgroup>
            </select>
        </form>
    </td>
    <td class="p-4 text-sm text-main/60">
        {new Date(u.createdAt).toLocaleDateString()}
    </td>
    <td class="p-4 text-right">
        <div class="flex items-center justify-end gap-1">
            <!-- Edit Profile -->
            <a
                href="/_/admin/users/{u.id}"
                class="text-accent hover:text-accent/80 p-2"
                title="Edit User Profile"
            >
                <Icon icon="mdi:pencil-outline" width="20" />
            </a>
            <!-- Send Password Reset -->
            <form
                method="POST"
                action="?/sendResetLink"
                use:enhance={handleAction}
            >
                <input type="hidden" name="email" value={u.email} />
                <input type="hidden" name="userId" value={u.id} />
                <button
                    class="text-blue-500 hover:text-blue-700 p-2"
                    title="Send password reset link"
                >
                    <Icon icon="mdi:lock-reset" width="20" />
                </button>
            </form>
            <!-- Resend Invite -->
            <form
                method="POST"
                action="?/resendInvite"
                use:enhance={handleAction}
            >
                <input type="hidden" name="email" value={u.email} />
                <input type="hidden" name="role" value={u.role} />
                <button
                    class="text-green-500 hover:text-green-700 p-2"
                    title="Resend invite email"
                >
                    <Icon icon="mdi:email-fast" width="20" />
                </button>
            </form>
            <!-- Delete -->
            <form
                method="POST"
                action="?/delete"
                use:enhance={handleDelete}
                onsubmit={(e) =>
                    !confirm("Are you sure? This user will lose all access.") &&
                    e.preventDefault()}
            >
                <input type="hidden" name="id" value={u.id} />
                <button
                    class="text-red-500 hover:text-red-700 p-2"
                    title="Delete"
                >
                    <Icon icon="mdi:trash-can-outline" width="20" />
                </button>
            </form>
        </div>
    </td>
{/snippet}
