<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import Icon from '@iconify/svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { data } = $props();
	
	let selectedLead = $state(null);

	function handleStatusChange() {
		return ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Status updated');
			} else if (result.type === 'failure') {
				toast.error('Failed to update status');
			}
			update({ reset: false }); // Keep the selected value
		};
	}

	// CSS classes for status badges
	const statusColors = {
		new: 'bg-blue-100 text-blue-800 border-blue-200',
		contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		qualified: 'bg-purple-100 text-purple-800 border-purple-200',
		lost: 'bg-gray-100 text-gray-800 border-gray-200',
		closed: 'bg-green-100 text-green-800 border-green-200'
	};

	const columns = [
		{ label: 'Date' },
		{ label: 'Name' },
		{ label: 'Interest' },
		{ label: 'Status' },
		{ label: 'Message' }
	];
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Leads</h1>
			<p class="mt-2 text-base text-main/70">Manage inquiries from the contact form.</p>
		</div>
		<a
			href="/_/admin/leads/export"
			download
			class="flex items-center gap-2 rounded-md bg-main px-4 py-2 font-bold text-light shadow-sm transition hover:bg-main/90"
		>
			<Icon icon="mdi:download" width="20" />
			Export CSV
		</a>
	</div>

	<DataTable 
		items={data.leads} 
		{columns} 
		emptyMessage="No leads have been submitted yet."
		row={leadRow}
	/>
</div>

{#snippet leadRow(lead)}
	<td class="p-4 text-sm text-main/70 whitespace-nowrap">
		{new Date(lead.createdAt).toLocaleDateString()}
	</td>
	<td class="p-4">
		<p class="font-bold text-main">{lead.firstName} {lead.lastName}</p>
		<a href="mailto:{lead.email}" class="text-xs text-accent hover:underline">
			{lead.email}
		</a>
	</td>
	<td class="p-4 text-sm">
		{#if lead.solution}
			<span class="font-medium text-accent">{lead.solution.solutionName}</span>
		{:else}
			<span class="text-main/50">General Inquiry</span>
		{/if}
	</td>
	<td class="p-4">
		<form
			method="POST"
			action="?/updateStatus"
			use:enhance={handleStatusChange}
			class="inline-block"
		>
			<input type="hidden" name="id" value={lead.id} />
			<select
				name="status"
				class="cursor-pointer rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 focus:ring-2 focus:ring-accent focus:outline-none {statusColors[lead.status] || 'bg-gray-100'}"
				onchange={(e) => e.target.form.requestSubmit()}
				value={lead.status}
			>
				<option value="new">New</option>
				<option value="contacted">Contacted</option>
				<option value="qualified">Qualified</option>
				<option value="lost">Lost</option>
				<option value="closed">Closed</option>
			</select>
		</form>
	</td>
	<td class="p-4">
		<button 
			onclick={() => selectedLead = lead}
			class="text-left max-w-xs group"
		>
			<div class="truncate text-sm text-main/70 group-hover:text-main transition-colors">
				{lead.message}
			</div>
			<span class="text-xs text-accent underline opacity-0 group-hover:opacity-100 transition-opacity">Read More</span>
		</button>
	</td>
{/snippet}

<!-- Message Viewer Modal -->
<Modal show={!!selectedLead} onclose={() => selectedLead = null}>
	{#if selectedLead}
		<div class="p-6">
			<div class="flex justify-between items-start mb-4">
				<div>
					<h3 class="text-xl font-bold">{selectedLead.firstName} {selectedLead.lastName}</h3>
					<a href="mailto:{selectedLead.email}" class="text-accent hover:underline">{selectedLead.email}</a>
				</div>
				<span class="text-xs text-main/50">{new Date(selectedLead.createdAt).toLocaleString()}</span>
			</div>
			
			{#if selectedLead.solution}
				<div class="mb-6 rounded-md bg-accent/10 p-3 text-sm">
					<strong>Interest:</strong> {selectedLead.solution.solutionName}
				</div>
			{/if}

			<div class="rounded-xl bg-main/5 p-4">
				<p class="text-sm font-bold uppercase tracking-wide text-main/60 mb-2">Message</p>
				<p class="whitespace-pre-wrap text-main/90">{selectedLead.message}</p>
			</div>

			<div class="mt-6 flex justify-end">
				<button
					onclick={() => selectedLead = null}
					class="rounded-md bg-main px-6 py-2 text-sm font-bold text-light"
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</Modal>