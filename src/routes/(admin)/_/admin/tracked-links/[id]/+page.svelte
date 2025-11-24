<script>
	let { data } = $props();
</script>

<div class="p-8">
	<div>
		<a href="/_/admin/tracked-links" class="font-bold text-accent hover:drop-shadow-accent-glow"
			>← Back to All Links</a
		>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-main">
			Link Analytics: {data.link.description}
		</h1>
	</div>

	<div class="mt-8 grid gap-8 md:grid-cols-3">
		<!-- Left Column: Details -->
		<div class="space-y-6 md:col-span-2">
			<div class="rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Link Details</h3>
				<div class="mt-4 space-y-2 text-sm">
					<p><span class="font-semibold text-main/70">Short Link:</span> <a href={`/r/${data.link.shortCode}`} target="_blank" class="font-mono text-accent">{`/r/${data.link.shortCode}`}</a></p>
					<p><span class="font-semibold text-main/70">Destination:</span> <a href={data.link.destinationUrl} target="_blank" class="font-mono text-accent truncate">{data.link.destinationUrl}</a></p>
					<p><span class="font-semibold text-main/70">Created By:</span> {data.link.user.username}</p>
					<p><span class="font-semibold text-main/70">Created On:</span> {new Date(data.link.createdAt).toLocaleString()}</p>
				</div>
			</div>

			<div class="rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Recent Clicks ({data.link.visits.length} Total)</h3>
				<div class="mt-4 max-h-96 overflow-y-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-main/10">
								<th class="p-2">Timestamp</th>
								<th class="p-2">Country</th>
							</tr>
						</thead>
						<tbody>
							{#each data.link.visits as visit}
								<tr class="border-b border-main/10">
									<td class="p-2">{new Date(visit.visitedAt).toLocaleString()}</td>
									<td class="p-2">{visit.ipCountry || 'Unknown'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Right Column: Summary -->
		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Clicks by Country</h3>
			<div class="mt-4 space-y-2">
				{#each Object.entries(data.visitsByCountry) as [country, count]}
					<div class="flex justify-between text-sm">
						<span>{country}</span>
						<span class="font-bold">{count}</span>
					</div>
				{:else}
					<p class="text-sm text-main/70">No visits recorded yet.</p>
				{/each}
			</div>
		</div>
	</div>
</div>