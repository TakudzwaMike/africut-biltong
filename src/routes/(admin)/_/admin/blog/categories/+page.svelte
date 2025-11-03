<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
			invalidateAll();
		} else if (form?.message) {
			toast.error(form.message);
		}
	});

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Blog Categories</h1>
	<p class="mt-2 text-base text-main/70">Manage the categories for your blog posts.</p>

	<!-- Create New Category Form -->
	<div class="mt-8 max-w-lg">
		<form
			method="POST"
			action="?/create"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={() => {
				isSubmitting = true;
				return ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						const formEl = document.querySelector('form[action="?/create"]');
						formEl?.reset();
					}
				};
			}}
		>
			<h3 class="text-lg font-bold">Add New Category</h3>
			<div class="mt-4">
				<label for="name" class="mb-1 block font-medium text-main/80">Category Name</label>
				<div class="flex items-start gap-4">
					<input
						type="text"
						id="name"
						name="name"
						required
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
					<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
						Add
					</SubmitButton>
				</div>
			</div>
		</form>
	</div>

	<!-- Existing Categories Table -->
	<div class="mt-12 overflow-x-auto">
		<h3 class="text-lg font-bold">Existing Categories</h3>
		<table class="mt-4 w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Name</th>
					<th class="p-4">Slug</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.categories as cat (cat.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 font-medium">{cat.name}</td>
						<td class="p-4 font-mono text-sm text-main/70">{cat.slug}</td>
						<td class="p-4 text-right">
							<form method="POST" action="?/delete&id={cat.id}" use:enhance={handleDelete}>
								<button
									type="submit"
									class="font-bold text-red-500 transition hover:text-red-400"
								>
									Delete
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.categories?.length ?? 0) === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No categories created yet.</p>
			</div>
		{/if}
	</div>
</div>
