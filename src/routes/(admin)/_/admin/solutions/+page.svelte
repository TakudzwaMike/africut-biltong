<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import DataTable from '$lib/components/admin/DataTable.svelte';

	// FIX: Use $props()
	let { data, form } = $props();

	$effect(() => {
		if (form?.status === 200) {
			toast.success('Solution deleted successfully!');
		}
	});

	const columns = [
		{ label: 'Name' },
		{ label: 'Description' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Solutions</h1>
			<p class="mt-2 text-base text-main/70">Manage your solutions pages.</p>
		</div>
		<a
			href="/_/admin/solutions/new"
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Create New
		</a>
	</div>

	<DataTable 
		items={data.solutions} 
		{columns} 
		emptyMessage="No solutions found. Create your first one!"
		row={solutionRow}
	/>
</div>

{#snippet solutionRow(s)}
	<td class="p-4 font-medium">{s.solutionName}</td>
	<td class="p-4 text-main/80 max-w-md truncate">{s.shortDescription}</td>
	<td class="p-4">
		<div class="flex items-center justify-end gap-4">
			<a
				href={`/_/admin/solutions/${s.id}/edit`}
				class="font-bold text-accent transition hover:drop-shadow-accent-glow"
			>
				Edit
			</a>
			<form method="POST" action="?/delete&id={s.id}" use:enhance>
				<button
					type="submit"
					class="font-bold text-red-500 transition hover:text-red-400"
				>
					Delete
				</button>
			</form>
		</div>
	</td>
{/snippet}