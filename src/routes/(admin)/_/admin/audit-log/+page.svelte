<script>
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let viewingLog = $state(null);

	const columns = [
		{ label: 'Time' },
		{ label: 'User' },
		{ label: 'Action' },
		{ label: 'Target' },
		{ label: 'Details', class: 'text-right' }
	];
</script>

<div class="p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-main">Audit Log</h1>
		<p class="mt-2 text-base text-main/70">A record of all administrative actions taken.</p>
	</div>

	<DataTable 
		items={data.logs} 
		{columns} 
		emptyMessage="No audit log entries found."
		row={logRow}
	/>
</div>

{#snippet logRow(log)}
	<td class="p-4 text-sm text-main/70 whitespace-nowrap">
		{new Date(log.createdAt).toLocaleString()}
	</td>
	<td class="p-4 font-medium">
		{log.user?.username || 'System'}
	</td>
	<td class="p-4">
		<span class="inline-flex items-center rounded-md bg-main/5 px-2 py-1 text-xs font-medium text-main ring-1 ring-inset ring-main/10 font-mono">
			{log.action}
		</span>
	</td>
	<td class="p-4 font-mono text-sm text-main/70">
		{log.targetId || '-'}
	</td>
	<td class="p-4 text-right">
		{#if log.data}
			<button
				onclick={() => (viewingLog = log)}
				class="text-sm font-bold text-accent hover:underline"
			>
				View Data
			</button>
		{:else}
			<span class="text-main/30 text-sm">No Data</span>
		{/if}
	</td>
{/snippet}

<!-- JSON Inspector Modal -->
<Modal show={!!viewingLog} onclose={() => (viewingLog = null)}>
	{#if viewingLog}
		<div class="p-6">
			<h3 class="text-lg font-bold mb-2">Log Details</h3>
			<div class="space-y-2 text-sm mb-4 border-b border-main/10 pb-4">
				<div class="flex justify-between">
					<span class="text-main/60">Action:</span>
					<span class="font-mono">{viewingLog.action}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-main/60">User:</span>
					<span>{viewingLog.user?.username || 'System'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-main/60">Target ID:</span>
					<span class="font-mono">{viewingLog.targetId}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-main/60">Timestamp:</span>
					<span>{new Date(viewingLog.createdAt).toLocaleString()}</span>
				</div>
			</div>

			<div class="bg-main/5 rounded-md p-4 overflow-auto max-h-[50vh]">
				<pre class="text-xs font-mono text-main/80 whitespace-pre-wrap">{JSON.stringify(viewingLog.data, null, 2)}</pre>
			</div>

			<div class="mt-6 flex justify-end">
				<button
					onclick={() => (viewingLog = null)}
					class="rounded-md bg-main px-4 py-2 text-sm font-bold text-light"
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</Modal>