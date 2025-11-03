<script>
	let { data, form } = $props();

	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	$effect(() => {
		if (form?.status === 200) {
			toast.success('Blog post deleted successfully!');
		}
	});
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Blog Posts</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Write, edit, and manage your posts.</p>
			</div>
			<a
				href="/admin/blog/new"
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New Post
			</a>
		</div>

		<div class="mt-12 overflow-x-auto">
			<table class="w-full min-w-max text-left">
				<thead class="border-b border-main/10">
					<tr>
						<th class="p-4">Title</th>
						<th class="p-4">Author</th>
						<th class="p-4">Status</th>
						<th class="p-4">Created</th>
						<th class="p-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.posts as post (post.id)}
						<tr class="border-b border-main/10">
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
										href={`/admin/blog/${post.id}/edit`}
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
						</tr>
					{/each}
				</tbody>
			</table>

			{#if data.posts.length === 0}
				<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
					<p class="text-main/70">No blog posts found. Create your first one!</p>
				</div>
			{/if}
		</div>
	</div>
</div>