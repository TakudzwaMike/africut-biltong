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

	function getStatusColor(status) {
		if (status === 'operational' || status === 'healthy') return 'bg-green-500';
		if (status === 'warning') return 'bg-yellow-500';
		return 'bg-red-500';
	}

    function formatMoney(cents) {
        return (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
</script>

<div class="p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-main">Dashboard</h1>
		<p class="mt-2 text-base text-main/70">Welcome back, {$page.data.user.username}. Overview of store performance.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
		
		<!-- Revenue Card (New) -->
		<div class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-green-500/20 transition-colors">
				<Icon icon="mdi:finance" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Total Revenue</p>
			<div class="mt-2 space-y-1">
                <p class="text-2xl font-bold text-main flex items-baseline gap-1">
                    <span class="text-sm font-normal text-main/40">USD</span> ${formatMoney(data.stats.revenue.USD)}
                </p>
                <p class="text-xl font-bold text-main/60 flex items-baseline gap-1">
                    <span class="text-xs font-normal text-main/40">ZAR</span> R {formatMoney(data.stats.revenue.ZAR)}
                </p>
            </div>
		</div>

		<!-- Orders -->
		<a href="/_/admin/orders" class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-accent/20 transition-colors">
				<Icon icon="mdi:cart" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Total Orders</p>
			<p class="mt-2 text-4xl font-bold text-main group-hover:text-accent transition-colors">
				{data.stats.totalOrders}
			</p>
			<p class="mt-2 text-xs text-main/50">
				Lifetime volume
			</p>
		</a>

        <!-- New Leads -->
		<a href="/_/admin/leads" class="group relative overflow-hidden rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
			<div class="absolute right-4 top-4 text-main/10 group-hover:text-blue-500/20 transition-colors">
				<Icon icon="mdi:account-group" width="64" />
			</div>
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">New Leads</p>
			<p class="mt-2 text-4xl font-bold text-main group-hover:text-blue-600 transition-colors">
				{data.stats.newLeads}
			</p>
			<p class="mt-2 text-xs text-main/50">
				{data.stats.totalLeads} total inquiries
			</p>
		</a>

		<!-- System Status -->
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
					<span class="text-main/70">Blob Storage</span>
					<span class="font-medium text-main flex items-center gap-1.5">
						<div class="h-1.5 w-1.5 rounded-full {getStatusColor(sys.checks.storage.status)}"></div>
						{sys.checks.storage.message}
					</span>
				</div>
			</div>
		</div>
	</div>

    <!-- Lower Section: Insights -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        <!-- Active Events & Quick Actions -->
        <div class="space-y-8">
            {#if data.insights.activeEvents.length > 0}
                <div class="rounded-xl border border-accent bg-accent/5 p-6">
                    <h3 class="font-bold text-main flex items-center gap-2 mb-4">
                        <Icon icon="mdi:tag-multiple" class="text-accent" />
                        Active Campaigns
                    </h3>
                    <div class="space-y-3">
                        {#each data.insights.activeEvents as event}
                            <div class="flex items-center justify-between bg-white p-3 rounded-md border border-accent/20 shadow-sm">
                                <div>
                                    <p class="font-bold text-main">{event.name}</p>
                                    <p class="text-xs text-main/60">{new Date(event.endsAt).toLocaleDateString()} (Ends)</p>
                                </div>
                                <a href={`/_/admin/marketing/events/${event.id}`} class="text-xs font-bold text-accent hover:underline">Manage</a>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
                <h3 class="font-bold text-main mb-4">Quick Actions</h3>
                <div class="grid grid-cols-2 gap-4">
                    <a href="/_/admin/products/import" class="flex flex-col items-center justify-center gap-2 rounded-lg border border-main/10 bg-slate-50 p-4 text-center transition hover:bg-white hover:shadow-md">
                        <Icon icon="mdi:file-upload" class="text-main/60" width="24" />
                        <span class="text-sm font-bold text-main">Import Stock</span>
                    </a>
                    <a href="/_/admin/marketing/codes/new" class="flex flex-col items-center justify-center gap-2 rounded-lg border border-main/10 bg-slate-50 p-4 text-center transition hover:bg-white hover:shadow-md">
                        <Icon icon="mdi:ticket-percent" class="text-main/60" width="24" />
                        <span class="text-sm font-bold text-main">Create Coupon</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
            <h3 class="font-bold text-main mb-4 flex items-center justify-between">
                <span>Inventory Alerts</span>
                <a href="/_/admin/products" class="text-xs text-accent hover:underline">View All</a>
            </h3>
            {#if data.insights.lowStock.length > 0}
                <table class="w-full text-left text-sm">
                    <thead class="border-b border-main/5 text-xs uppercase text-main/40">
                        <tr>
                            <th class="pb-2">Product</th>
                            <th class="pb-2">SKU</th>
                            <th class="pb-2 text-right">Stock</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-main/5">
                        {#each data.insights.lowStock as variant}
                            <tr>
                                <td class="py-3">
                                    <p class="font-medium text-main">{variant.product.name}</p>
                                    <p class="text-xs text-main/50">{variant.name}</p>
                                </td>
                                <td class="py-3 font-mono text-xs text-main/60">{variant.sku || '-'}</td>
                                <td class="py-3 text-right">
                                    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold {variant.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">
                                        {variant.stock}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <div class="flex flex-col items-center justify-center py-8 text-main/40">
                    <Icon icon="mdi:check-circle" width="32" class="mb-2 text-green-500/50" />
                    <p>Stock levels are healthy.</p>
                </div>
            {/if}
        </div>

    </div>
</div>
