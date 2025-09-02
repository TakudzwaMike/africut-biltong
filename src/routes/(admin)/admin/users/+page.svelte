<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	$effect(() => {
		// This handles the successful "create" action from the form below
		if (form?.success && form.form?.action.includes('?/create')) {
			toast.success(form.message);
			invalidateAll();
		} else if (form?.message && form.form?.action.includes('?/create')) {
			toast.error(form.message);
		}
	});

	function handleDelete(event) {
		if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
			event.preventDefault();
		}
		return ({ result }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">User Management</h1>
	<p class="mt-2 text-base text-main/70">Create and manage user accounts for the admin panel.</p>

	<!-- Create New User Form -->
	<div class="mt-8 max-w-lg">
		<form
			method="POST"
			action="?/create"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={() => {
				isSubmitting = true;
				return ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						const formEl = document.querySelector('form[action="?/create"]');
						formEl?.reset();
					}
				};
			}}
		>
			<h3 class="text-lg font-bold">Add New User</h3>
			<div class="mt-4 space-y-4">
				<div>
					<label for="username" class="mb-1 block font-medium text-main/80">Username</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="password" class="mb-1 block font-medium text-main/80">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
			<div class="mt-6">
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Create User
				</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Existing Users Table -->
	<div class="mt-12 overflow-x-auto">
		<h3 class="text-lg font-bold">Existing Users</h3>
		<table class="mt-4 w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Username</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user (user.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 font-medium">{user.username}</td>
						<td class="p-4 text-right">
							<form method="POST" action="?/delete&id={user.id}" use:enhance={handleDelete}>
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
		{#if (data.users?.length ?? 0) === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No other users found.</p>
			</div>
		{/if}
	</div>
</div>