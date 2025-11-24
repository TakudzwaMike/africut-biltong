<script>
	/**
	 * @typedef {Object} Column
	 * @property {string} label - Header text
	 * @property {string} [class] - Optional classes for the th (e.g., 'text-right')
	 */

	/**
	 * @type {{
	 *   columns: Column[],
	 *   items: any[],
	 *   row: import('svelte').Snippet,
	 *   emptyMessage?: string
	 * }}
	 */
	let { columns, items, row, emptyMessage = 'No items found.' } = $props();
</script>

<div class="mt-12 overflow-x-auto rounded-xl border border-main/10 bg-light shadow-sm">
	<table class="w-full min-w-max text-left">
		<thead class="border-b border-main/10 bg-main/5 text-xs uppercase tracking-wider text-main/60">
			<tr>
				{#each columns as col}
					<th class="p-4 font-semibold {col.class || ''}">{col.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-main/10">
			{#each items as item (item.id)}
				<tr class="group transition-colors hover:bg-main/5">
					{@render row(item)}
				</tr>
			{/each}
		</tbody>
	</table>

	{#if items.length === 0}
		<div class="p-12 text-center text-main/60">
			<p>{emptyMessage}</p>
		</div>
	{/if}
</div>