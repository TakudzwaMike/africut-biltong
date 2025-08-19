<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	$effect(() => {
		// This effect will run whenever the page is loaded OR a form action completes.
		// If you have been redirected here after creating a product, this will just work.
	});

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success' && result.data?.status === 200) {
				toast.success(result.data.message);
				invalidateAll(); // This re-runs the `load` function
			} else if (result.type === 'failure') {
				toast.error(result.data.message);
			}
		};
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Products</h1>
			<p class="mt-2 text-base text-main/70">Manage your product pages.</p>
		</div>
		<a
			href="/admin/products/new"
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Create New
		</a>
	</div>

	<div class="mt-12 overflow-x-auto">
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Image</th>
					<th class="p-4">Name</th>
					<th class="p-4">Description</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as p (p.id)}
					<tr class="border-b border-main/10">
						<td class="p-4">
							{#if p.imageUrl}
								<img
									src={p.imageUrl}
									alt={p.name}
									class="h-10 w-16 rounded-md bg-main/5 object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-16 items-center justify-center rounded-md bg-main/5 text-xs text-main/50"
								>
									No Image
								</div>
							{/if}
						</td>
						<td class="p-4 font-medium">{p.name}</td>
						<td class="p-4 text-main/80">{p.shortDescription}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-4">
								<a
									href={`/admin/products/${p.id}/edit`}
									class="font-bold text-accent transition hover:drop-shadow-accent-glow"
								>
									Edit
								</a>
								<form method="POST" action="?/delete&id={p.id}" use:enhance={handleDelete}>
									<button
										type="submit"
										class="font-bold text-red-500 transition hover:text-red-400"
									>
										Delete
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.products?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No products found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>