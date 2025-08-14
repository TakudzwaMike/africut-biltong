<script>
	let { data } = $props();
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Contact Leads</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Submissions from the contact form.</p>
			</div>
			<a href="/admin" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to Dashboard</a
			>
		</div>

		<div class="mt-12 space-y-6">
			{#each data.leads as lead}
				<div class="corner-border">
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-lg font-bold">
								{lead.firstName} {lead.lastName}
							</h3>
							{#if lead.solution}
								<p class="mt-1 text-sm font-medium text-main/60">
									Inquiry about:
									<span class="font-bold text-accent">{lead.solution.solutionName}</span>
								</p>
							{/if}
						</div>
						<p class="flex-shrink-0 text-right text-sm text-main/60">
							{new Date(lead.createdAt).toLocaleString()}
						</p>
					</div>
					<a href="mailto:{lead.email}" class="mt-1 block text-accent hover:underline"
						>{lead.email}</a
					>
					<blockquote class="mt-4 border-l-4 border-main/20 pl-4 italic text-main/80">
						{lead.message}
					</blockquote>
				</div>
			{:else}
				<div class="rounded-xl border border-dashed border-main/20 p-12 text-center">
					<p class="text-main/70">No leads have been submitted yet.</p>
				</div>
			{/each}
		</div>
	</div>
</div>