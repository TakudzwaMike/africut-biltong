<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import DataTable from '$lib/components/admin/DataTable.svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.status === 200) {
			toast.success('Blog post deleted successfully!');
		}
	});

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
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Blog Posts</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Write, edit, and manage your posts.</p>
			</div>
			<a
				href="/_/admin/blog/new"
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New Post
			</a>
		</div>

		<DataTable 
			items={data.posts} 
			{columns} 
			emptyMessage="No blog posts found. Create your first one!"
			row={postRow}
		/>
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