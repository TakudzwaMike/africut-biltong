<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	let { data, form } = $props();

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
			// After a successful 'create' action, clear the form by invalidating the data.
			if (form.form?.name === 'create') {
				const formEl = document.querySelector('form[action="?/create"]');
				formEl?.reset();
			}
		} else if (form?.message) {
			toast.error(form.message);
		}
	});
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Office Locations</h1>
	<p class="mt-2 text-base text-main/70">
		Manage the contact locations displayed in the website footer.
	</p>

	<!-- Create New Location Form -->
	<div class="mt-8 max-w-2xl">
		<form method="POST" action="?/create" use:enhance class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Add New Location</h3>
			<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<label for="countryName" class="mb-1 block font-medium text-main/80"
						>Country Name</label
					>
					<input
						type="text"
						id="countryName"
						name="countryName"
						placeholder="e.g., Zimbabwe"
						required
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="countryCode" class="mb-1 block font-medium text-main/80"
						>Country Code (2 Letters)</label
					>
					<input
						type="text"
						id="countryCode"
						name="countryCode"
						placeholder="e.g., ZW"
						required
						maxlength="2"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="address" class="mb-1 block font-medium text-main/80">Address/Details</label>
					<textarea
						id="address"
						name="address"
						rows="3"
						placeholder="e.g., 123 Innovation Drive, Harare"
						required
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
			</div>
			<div class="mt-6">
				<button
					type="submit"
					class="rounded-md bg-accent px-6 py-2 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-0.5"
				>
					+ Add Location
				</button>
			</div>
		</form>
	</div>

	<!-- Existing Locations Table -->
	<div class="mt-12 overflow-x-auto">
		<h3 class="text-lg font-bold">Existing Locations</h3>
		<table class="mt-4 w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Country</th>
					<th class="p-4">Code</th>
					<th class="p-4">Address</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.locations as loc (loc.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 font-medium">{loc.countryName}</td>
						<td class="p-4 font-mono text-sm uppercase text-main/70">{loc.countryCode}</td>
						<td class="p-4 text-main/80">{loc.address}</td>
						<td class="p-4 text-right">
							<form method="POST" action="?/delete&id={loc.id}" use:enhance>
								<button
									type="submit"
									class="font-bold text-red-500 transition hover:text-red-400"
								>
									Delete
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if data.locations.length === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No locations added yet.</p>
			</div>
		{/if}
	</div>
</div>