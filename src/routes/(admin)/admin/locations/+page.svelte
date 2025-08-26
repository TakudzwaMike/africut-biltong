<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data, form } = $props();

	let editingLocation = $state(null); // null for new, or the location object for editing
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
			invalidateAll();
			editingLocation = null; // Close form on success
		} else if (form?.message) {
			toast.error(form.message);
		}
	});

	function startEditing(loc) {
		editingLocation = { ...loc }; // Create a copy
	}

	function startCreating() {
		editingLocation = {
			id: null,
			countryName: '',
			countryCode: '',
			address: '',
			phoneNumber: '',
			latitude: '',
			longitude: ''
		};
	}

	function cancelEditing() {
		editingLocation = null;
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Office Locations</h1>
			<p class="mt-2 text-base text-main/70">
				Manage the contact locations displayed in the website footer.
			</p>
		</div>
		<button
			onclick={startCreating}
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Add Location
		</button>
	</div>

	<!-- Add/Edit Form -->
	{#if editingLocation}
		<div class="mt-8 max-w-2xl">
			<form
				method="POST"
				action="?/save"
				class="rounded-xl border border-main/10 p-6"
				use:enhance={() => {
					isSubmitting = true;
					return () => (isSubmitting = false);
				}}
			>
				<input type="hidden" name="id" value={editingLocation.id} />
				<h3 class="text-lg font-bold">{editingLocation.id ? 'Edit' : 'Add New'} Location</h3>
				<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<label for="countryName" class="mb-1 block font-medium text-main/80"
							>Country Name</label
						>
						<input
							type="text"
							name="countryName"
							placeholder="e.g., Zimbabwe"
							required
							bind:value={editingLocation.countryName}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="countryCode" class="mb-1 block font-medium text-main/80"
							>Country Code (2 Letters)</label
						>
						<input
							type="text"
							name="countryCode"
							placeholder="e.g., ZW"
							required
							maxlength="2"
							bind:value={editingLocation.countryCode}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div class="sm:col-span-2">
						<label for="address" class="mb-1 block font-medium text-main/80"
							>Address/Details</label
						>
						<textarea
							name="address"
							rows="3"
							placeholder="e.g., 123 Innovation Drive, Harare"
							required
							bind:value={editingLocation.address}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						></textarea>
					</div>
					<div class="sm:col-span-2">
						<label for="phoneNumber" class="mb-1 block font-medium text-main/80"
							>Phone Number (Optional)</label
						>
						<input
							type="tel"
							name="phoneNumber"
							placeholder="e.g., +263 77 123 4567"
							bind:value={editingLocation.phoneNumber}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="latitude" class="mb-1 block font-medium text-main/80"
							>Latitude (Optional)</label
						>
						<input
							type="text"
							name="latitude"
							placeholder="e.g., -17.8252"
							bind:value={editingLocation.latitude}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="longitude" class="mb-1 block font-medium text-main/80"
							>Longitude (Optional)</label
						>
						<input
							type="text"
							name="longitude"
							placeholder="e.g., 31.0335"
							bind:value={editingLocation.longitude}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
				</div>
				<div class="mt-6 flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70">Cancel</button>
					<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
						Save Location
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Locations Table -->
	<div class="mt-12 overflow-x-auto">
		<h3 class="text-lg font-bold">Existing Locations</h3>
		<table class="mt-4 w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Country</th>
					<th class="p-4">Address</th>
					<th class="p-4">Phone</th>
					<th class="p-4">Coords</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.locations as loc (loc.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 font-medium">{loc.countryName} ({loc.countryCode})</td>
						<td class="p-4 text-main/80">{loc.address}</td>
						<td class="p-4 text-main/80">{loc.phoneNumber || 'N/A'}</td>
						<td class="p-4 font-mono text-xs text-main/60">
							{loc.latitude || 'N/A'}, {loc.longitude || 'N/A'}
						</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-2">
								<button
									onclick={() => startEditing(loc)}
									class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="lucide lucide-pencil"
										><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path
											d="m15 5 4 4"
										/></svg
									>
								</button>
								<form method="POST" action="?/delete&id={loc.id}" use:enhance>
									<button class="rounded-md bg-red-500 p-1.5 text-white">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="lucide lucide-trash-2"
											><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
												d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
											/><line x1="10" x2="10" y1="11" y2="17" /><line
												x1="14"
												x2="14"
												y1="11"
												y2="17"
											/></svg
										>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.locations?.length ?? 0) === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No locations added yet.</p>
			</div>
		{/if}
	</div>
</div>