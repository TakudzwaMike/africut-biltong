<script>
	import { page } from '$app/stores';
	import { toast } from '$lib/toast-service';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let brochureUrl = $derived($page.data.settings?.brochureUrl);
	let sys = $derived(data.system);

	function copyToClipboard(text) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(
				() => toast.success('Link copied!'),
				(err) => toast.error('Failed to copy link.')
			);
		}
	}

	// Helper for status colors
	function getStatusColor(status) {
		if (status === 'operational' || status === 'healthy') return 'bg-green-500';
		if (status === 'warning') return 'bg-yellow-500';
		return 'bg-red-500';
	}
</script>

<div class="p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-main">Dashboard</h1>
		<p class="mt-2 text-base text-main/70">Welcome back, {$page.data.user.username}. Here is what's happening today.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
		
		<!-- New Leads -->
		<a href="/_/admin/leads" class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-accent/20 transition-colors">
				<Icon icon="mdi:account-group" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">New Leads</p>
			<p class="mt-2 text-4xl font-bold text-main group-hover:text-accent transition-colors">
				{data.stats.newLeads}
			</p>
			<p class="mt-2 text-xs text-main/50">
				{data.stats.totalLeads} total inquiries
			</p>
		</a>

		<!-- Orders -->
		<a href="/_/admin/orders" class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-green-500/20 transition-colors">
				<Icon icon="mdi:cart" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Orders</p>
			<p class="mt-2 text-4xl font-bold text-main group-hover:text-green-600 transition-colors">
				{data.stats.totalOrders}
			</p>
			<p class="mt-2 text-xs text-main/50">
				Store transactions
			</p>
		</a>

		<!-- Content -->
		<a href="/_/admin/blog" class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-blue-500/20 transition-colors">
				<Icon icon="mdi:file-document-edit" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Content</p>
			<div class="mt-2 flex gap-4">
				<div>
					<span class="text-2xl font-bold text-main">{data.stats.totalPosts}</span>
					<span class="text-xs text-main/50 block">Posts</span>
				</div>
				<div>
					<span class="text-2xl font-bold text-main">{data.stats.totalProducts}</span>
					<span class="text-xs text-main/50 block">Products</span>
				</div>
			</div>
		</a>

		<!-- System Status (Real Data) -->
		<div class="rounded-xl border border-main/10 bg-main/5 p-6">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="relative flex h-3 w-3">
						{#if sys.overallStatus === 'healthy'}
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						{/if}
						<span class="relative inline-flex rounded-full h-3 w-3 {getStatusColor(sys.overallStatus)}"></span>
					</div>
					<p class="text-sm font-bold uppercase tracking-widest text-main/60">System Status</p>
				</div>
				<span class="text-xs font-mono text-main/40">{sys.checks.database.latency}ms</span>
			</div>
			
			<div class="space-y-3">
				<div class="flex justify-between text-sm">
					<span class="text-main/70">Database</span>
					<span class="font-medium text-main flex items-center gap-1.5">
						<div class="h-1.5 w-1.5 rounded-full {getStatusColor(sys.checks.database.status)}"></div>
						{sys.checks.database.message}
					</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-main/70">Storage (Blob)</span>
					<span class="font-medium text-main flex items-center gap-1.5">
						<div class="h-1.5 w-1.5 rounded-full {getStatusColor(sys.checks.storage.status)}"></div>
						{sys.checks.storage.message}
					</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-main/70">Email (Resend)</span>
					<span class="font-medium text-main flex items-center gap-1.5">
						<div class="h-1.5 w-1.5 rounded-full {getStatusColor(sys.checks.email.status)}"></div>
						{sys.checks.email.message}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="max-w-xl">
		<h3 class="text-lg font-bold mb-4">Quick Actions</h3>
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			{#if brochureUrl}
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-accent/10 p-2 text-accent">
							<Icon icon="mdi:file-pdf-box" width="24" />
						</div>
						<div>
							<p class="font-medium text-main">Company Brochure</p>
							<a href={brochureUrl} target="_blank" class="text-xs text-main/60 hover:text-accent hover:underline">
								Preview PDF
							</a>
						</div>
					</div>
					<button
						onclick={() => copyToClipboard(brochureUrl)}
						class="rounded-md border border-main/20 px-3 py-1.5 text-sm font-bold text-main transition hover:bg-main hover:text-light"
					>
						Copy Link
					</button>
				</div>
			{:else}
				<div class="text-center py-4">
					<p class="text-sm text-main/70">
						No brochure uploaded. 
						<a href="/_/admin/settings" class="font-bold text-accent underline">Upload one in settings</a>.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>