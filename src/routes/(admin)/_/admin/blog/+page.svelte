<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.status === 200) {
			toast.success('Blog post deleted successfully!');
		}
	});

	// Search State
	let searchQuery = $state(data.pagination.query || '');
	let searchTimeout;

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchQuery) {
				url.searchParams.set('q', searchQuery);
				url.searchParams.set('page', '1');
			} else {
				url.searchParams.delete('q');
			}
			goto(url, { keepFocus: true, noScroll: true });
		}, 400);
	}

	function changePage(newPage) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url, { noScroll: true });
	}

	const columns = [
		{ label: 'Title' },
		{ label: 'Author' },
		{ label: 'Status' },
		{ label: 'Created' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<!-- Header Row -->
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Blog Posts</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Write, edit, and manage your posts.</p>
			</div>
			
			<div class="flex flex-col items-end gap-4 sm:flex-row">
				<!-- Search Box -->
				<div class="relative w-full sm:w-64">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Icon icon="mdi:magnify" class="text-main/40" />
					</div>
					<input
						type="text"
						placeholder="Search posts..."
						bind:value={searchQuery}
						oninput={handleSearchInput}
						class="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
					/>
				</div>

				<a
					href="/_/admin/blog/new"
					class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
				>
					<Icon icon="mdi:plus" />
					<span>Create New</span>
				</a>
			</div>
		</div>

		<DataTable 
			items={data.posts} 
			{columns} 
			emptyMessage="No blog posts found matching your criteria."
			row={postRow}
		/>

		<!-- Pagination Footer -->
		{#if data.pagination.totalPages > 1}
			<div class="mt-6 flex items-center justify-between border-t border-main/10 pt-6">
				<div class="text-sm text-main/60">
					Page <span class="font-bold text-main">{data.pagination.page}</span> of <span class="font-bold text-main">{data.pagination.totalPages}</span>
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => changePage(data.pagination.page - 1)}
						disabled={data.pagination.page <= 1}
						class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Icon icon="mdi:chevron-left" /> Previous
					</button>
					<button
						onclick={() => changePage(data.pagination.page + 1)}
						disabled={data.pagination.page >= data.pagination.totalPages}
						class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Next <Icon icon="mdi:chevron-right" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet postRow(post)}
	<td class="p-4 font-medium">{post.title}</td>
	<td class="p-4 text-main/80">{post.author.username}</td>
	<td class="p-4">
		{#if post.isPublished}
			<span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
				>Published</span
			>
		{:else}
			<span class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800"
				>Draft</span
			>
		{/if}
	</td>
	<td class="p-4 text-sm text-main/70">
		{new Date(post.createdAt).toLocaleDateString()}
	</td>
	<td class="p-4">
		<div class="flex items-center justify-end gap-4">
			<a
				href={`/_/admin/blog/${post.id}/edit`}
				class="font-bold text-accent transition hover:drop-shadow-accent-glow"
			>
				Edit
			</a>
			<form method="POST" action="?/delete&id={post.id}" use:enhance>
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