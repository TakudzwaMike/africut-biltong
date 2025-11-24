<script>
	/**
	 * A generic component for managing CRUD operations.
	 *
	 * It uses Svelte 5 named snippets for customization:
	 * - form({ item, onCancel }): Renders the create/edit form.
	 * - tableHeader(): Renders the table's `<thead>` row.
	 * - tableRow({ item, onEdit }): Renders a single `<tr>` for an item.
	 */
	let {
		items = [],
		title = 'Items',
		description = 'Manage your items.',
		form,
		tableHeader,
		tableRow
	} = $props();

	let editingItem = $state(null);

	function startEditing(item) {
		editingItem = { ...item };
	}

	function startCreating() {
		editingItem = {};
	}

	function cancelEditing() {
		editingItem = null;
	}

	export function closeForm() {
		cancelEditing();
	}
</script>

<div class="p-8">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">{title}</h1>
			<p class="mt-2 text-base text-main/70">{description}</p>
		</div>
		{#if !editingItem}
			<button
				onclick={startCreating}
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New
			</button>
		{/if}
	</div>

	<!-- Add/Edit Form Section -->
	{#if editingItem}
		<div class="mt-8 max-w-2xl">
			{@render form({
				item: editingItem,
				onCancel: cancelEditing
			})}
		</div>
	{/if}

	<!-- Existing Items Table -->
	<div class="mt-12 overflow-x-auto" class:hidden={editingItem}>
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				{@render tableHeader()}
			</thead>
			<tbody>
				{#each items as item (item.id)}
					<tr class="border-b border-main/10">
						{@render tableRow({
							item,
							onEdit: () => startEditing(item)
						})}
					</tr>
				{/each}
			</tbody>
		</table>

		{#if items.length === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No items found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>