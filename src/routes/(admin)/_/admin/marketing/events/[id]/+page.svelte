<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { goto } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();
	
	// Initialize Matrix State
	// We use a Map for O(1) access during rendering loops
	let priceState = $state({}); 

	// Hydrate state
	// Format: { [variantId]: { usd: float, zar: float } }
	$effect(() => {
		const map = {};
		data.products.forEach(p => {
			p.variants.forEach(v => {
				const existing = data.priceMap[v.id];
				map[v.id] = {
					usd: existing?.salePriceUsd ? existing.salePriceUsd / 100 : null,
					zar: existing?.salePriceZar ? existing.salePriceZar / 100 : null
				};
			});
		});
		priceState = map;
	});

	// Helper to prepare JSON for submission
	let submissionData = $derived(
		Object.entries(priceState).map(([variantId, prices]) => ({
			variantId,
			usd: prices.usd,
			zar: prices.zar
		}))
	);

	let isSavingEvent = $state(false);
	let isSavingPrices = $state(false);

	// Date Helper
	function formatDateTimeLocal(date) {
		if (!date) return '';
		const d = new Date(date);
		const pad = (num) => num.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function handleEventUpdate() {
		isSavingEvent = true;
		return ({ result, update }) => {
			isSavingEvent = false;
			if (result.type === 'success') toast.success(result.data.message);
			else toast.error(result.data?.message);
			update({ reset: false });
		};
	}

	function handlePriceSave() {
		isSavingPrices = true;
		return ({ result, update }) => {
			isSavingPrices = false;
			if (result.type === 'success') toast.success(result.data.message);
			else toast.error(result.data?.message);
			update({ reset: false });
		};
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success') {
				toast.success('Event deleted');
				goto('/_/admin/marketing');
			} else {
				toast.error('Failed to delete');
			}
		};
	}
</script>

<div class="p-8 max-w-7xl mx-auto">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Manage Sale Event</h1>
			<p class="text-main/70 mt-1">Configure dates and product markdowns.</p>
		</div>
		<div class="flex gap-2">
			<a href="/_/admin/marketing" class="btn-secondary bg-white text-main border border-main/10 hover:bg-main/5">Back</a>
			<form method="POST" action="?/delete" use:enhance={handleDelete} onsubmit={(e) => !confirm('Delete this event?') && e.preventDefault()}>
				<button class="btn-danger">Delete Event</button>
			</form>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		
		<!-- LEFT: Settings -->
		<div class="lg:col-span-1 space-y-6">
			<form 
				method="POST" 
				action="?/updateEvent" 
				use:enhance={handleEventUpdate}
				class="rounded-xl border border-main/10 bg-white p-6 shadow-sm sticky top-6"
			>
				<h3 class="font-bold text-lg mb-4">Event Settings</h3>
				
				<div class="space-y-4">
					<div>
						<label for="name" class="mb-1 block text-xs font-bold uppercase tracking-wide text-main/60">Internal Name</label>
						<input type="text" name="name" value={data.event.name} required class="w-full rounded-md border-main/20 bg-main/5 text-sm" />
					</div>
					<div>
						<label for="publicLabel" class="mb-1 block text-xs font-bold uppercase tracking-wide text-main/60">Public Label</label>
						<input type="text" name="publicLabel" value={data.event.publicLabel || ''} class="w-full rounded-md border-main/20 bg-main/5 text-sm" />
					</div>
					<div>
						<label for="startsAt" class="mb-1 block text-xs font-bold uppercase tracking-wide text-main/60">Starts</label>
						<input type="datetime-local" name="startsAt" value={formatDateTimeLocal(data.event.startsAt)} required class="w-full rounded-md border-main/20 bg-main/5 text-sm" />
					</div>
					<div>
						<label for="endsAt" class="mb-1 block text-xs font-bold uppercase tracking-wide text-main/60">Ends</label>
						<input type="datetime-local" name="endsAt" value={formatDateTimeLocal(data.event.endsAt)} required class="w-full rounded-md border-main/20 bg-main/5 text-sm" />
					</div>
					
					<div class="flex items-center gap-3 border-t border-main/10 pt-4">
						<input type="checkbox" name="isActive" id="isActive" checked={data.event.isActive} class="h-5 w-5 rounded border-main/20 text-accent focus:ring-accent" />
						<div>
							<label for="isActive" class="font-bold text-main block">Event Active</label>
							<span class="text-xs text-main/60">Master switch to enable pricing.</span>
						</div>
					</div>
				</div>

				<div class="mt-6">
					<SubmitButton loading={isSavingEvent} class="w-full bg-main text-light">Update Settings</SubmitButton>
				</div>
			</form>
		</div>

		<!-- RIGHT: Pricing Matrix -->
		<div class="lg:col-span-2">
			<form 
				method="POST" 
				action="?/savePrices" 
				use:enhance={handlePriceSave}
				class="rounded-xl border border-main/10 bg-white shadow-sm flex flex-col h-full"
			>
				<input type="hidden" name="prices" value={JSON.stringify(submissionData)} />

				<div class="p-6 border-b border-main/10 flex items-center justify-between bg-slate-50 rounded-t-xl">
					<div>
						<h3 class="font-bold text-lg">Pricing Matrix</h3>
						<p class="text-xs text-main/60">Leave fields blank to use original price.</p>
					</div>
					<SubmitButton loading={isSavingPrices} class="bg-accent px-6">Save Prices</SubmitButton>
				</div>

				<div class="flex-1 overflow-y-auto p-0 max-h-[800px]">
					<table class="w-full text-left text-sm">
						<thead class="bg-main/5 text-xs uppercase tracking-wider text-main/50 font-bold sticky top-0 z-10 backdrop-blur-sm">
							<tr>
								<th class="p-4 w-1/3">Product</th>
								<th class="p-4 w-1/4">Original (USD)</th>
								<th class="p-4 w-1/4">Sale Price (USD)</th>
								<th class="p-4 w-1/6">Sale Price (ZAR)</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-main/5">
							{#each data.products as product}
								{#each product.variants as variant}
									{@const state = priceState[variant.id]}
									<tr class="hover:bg-main/5 transition-colors group">
										<td class="p-4">
											<div class="font-bold text-main">{product.name}</div>
											<div class="text-xs text-main/60">{variant.name}</div>
										</td>
										<td class="p-4 font-mono text-main/50">
											${(variant.priceUsd / 100).toFixed(2)}
										</td>
										<td class="p-4">
											<div class="relative">
												<span class="absolute left-3 top-2 text-main/40">$</span>
												<input 
													type="number" step="0.01"
													bind:value={state.usd}
													class="w-full rounded border-main/20 bg-white pl-6 py-1.5 text-sm focus:border-accent focus:ring-accent font-bold text-accent"
													placeholder="-"
												/>
											</div>
										</td>
										<td class="p-4">
											<div class="relative">
												<span class="absolute left-3 top-2 text-main/40">R</span>
												<input 
													type="number" step="0.01"
													bind:value={state.zar}
													class="w-full rounded border-main/20 bg-white pl-6 py-1.5 text-sm focus:border-accent focus:ring-accent font-bold text-accent"
													placeholder="-"
												/>
											</div>
										</td>
									</tr>
								{/each}
							{/each}
						</tbody>
					</table>
				</div>
			</form>
		</div>

	</div>
</div>
