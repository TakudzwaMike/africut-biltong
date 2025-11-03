<script>
	let { data } = $props();
</script>

<div class="p-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-main">Audit Log</h1>
		<p class="mt-2 text-base text-main/70">A record of all administrative actions taken.</p>
	</div>

	<div class="mt-12 overflow-x-auto">
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Timestamp</th>
					<th class="p-4">User</th>
					<th class="p-4">Action</th>
					<th class="p-4">Target ID</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logs as log (log.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 text-sm text-main/70">
							{new Date(log.createdAt).toLocaleString()}
						</td>
						<td class="p-4 font-medium">{log.user?.username || 'System'}</td>
						<td class="p-4 font-mono text-sm">{log.action}</td>
						<td class="p-4 font-mono text-sm text-main/70">{log.targetId || 'N/A'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.logs?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No audit log entries found.</p>
			</div>
		{/if}
	</div>
</div>