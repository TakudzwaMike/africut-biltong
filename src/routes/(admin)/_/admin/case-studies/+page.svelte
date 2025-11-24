<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import DataTable from '$lib/components/admin/DataTable.svelte';

	// FIX: Use $props() instead of export let
	let { data, form } = $props();

	$effect(() => {
		if (form?.status === 200) {
			toast.success('Case study deleted successfully!');
		}
	});

	const columns = [
		{ label: 'Title' },
		{ label: 'Client' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Case Studies</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Manage your case studies.</p>
			</div>
			<a
				href="/_/admin/case-studies/new"
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New
			</a>
		</div>

		<DataTable 
			items={data.caseStudies} 
			{columns} 
			emptyMessage="No case studies found. Create your first one!"
			row={caseStudyRow}
		/>
	</div>
</div>

{#snippet caseStudyRow(cs)}
	<td class="p-4 font-medium">{cs.title}</td>
	<td class="p-4 text-main/80">{cs.client?.name || 'N/A'}</td>
	<td class="p-4">
		<div class="flex items-center justify-end gap-4">
			<a
				href={`/_/admin/case-studies/${cs.id}/edit`}
				class="font-bold text-accent transition hover:drop-shadow-accent-glow"
			>
				Edit
			</a>
			<form method="POST" action="?/delete&id={cs.id}" use:enhance>
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