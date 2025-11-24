<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { page } from '$app/stores';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();

	let isSubmittingCreate = $state(false);
	let isSubmittingInvite = $state(false);
	let generatedToken = $state(null);

	$effect(() => {
		if (!form) return;

		// Handle create action
		if (form.form?.action.includes('?/create')) {
			if (form.success) {
				toast.success(form.message);
				invalidateAll();
				document.querySelector('form[action="?/create"]')?.reset();
			} else if (form.message) {
				toast.error(form.message);
			}
		}

		// Handle generateInvite action
		if (form.form?.action.includes('?/generateInvite')) {
			if (form.success) {
				generatedToken = form.token;
				toast.success('Invite link generated!');
			} else if (form.message) {
				toast.error(form.message);
			}
		}
	});

	function handleDelete(event) {
		if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
			event.preventDefault();
		}
		return ({ result }) => {
			if (result.type === 'success' && result.data?.status === 200) {
				toast.success(result.data.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data.message);
			}
		};
	}

	const columns = [
		{ label: 'Username' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">User Management</h1>
	<p class="mt-2 text-base text-main/70">Create and manage user accounts for the admin panel.</p>

	<div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Create New User Form -->
		<div>
			<form
				method="POST"
				action="?/create"
				class="rounded-xl border border-main/10 p-6"
				use:enhance={() => {
					isSubmittingCreate = true;
					return () => (isSubmittingCreate = false);
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
					<SubmitButton type="submit" loading={isSubmittingCreate} class="bg-accent px-6 py-2">
						Create User
					</SubmitButton>
				</div>
			</form>
		</div>

		<!-- Invite Link Generator -->
		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Invite New User</h3>
			<p class="mt-1 text-sm text-main/70">
				Generate a secure, one-time link to invite a new user to create an account.
			</p>
			<form
				method="POST"
				action="?/generateInvite"
				use:enhance={() => {
					isSubmittingInvite = true;
					return ({ result }) => {
						isSubmittingInvite = false;
						if (result.type === 'success') {
							generatedToken = result.data?.token;
							toast.success('Invite link generated!');
						} else if (result.type === 'failure') {
							toast.error(result.data?.message);
						}
					};
				}}
				class="mt-4"
			>
				<SubmitButton loading={isSubmittingInvite} class="bg-accent px-6 py-2"
					>Generate Invite Link</SubmitButton
				>
			</form>

			{#if generatedToken}
				{@const inviteUrl = `${$page.url.origin}/_/admin/create-account/${generatedToken}`}
				<div class="mt-4 rounded-md bg-accent/10 p-4">
					<p class="font-medium text-main">Share this link with your new team member:</p>
					<p class="mt-2 break-all font-mono text-sm text-accent">
						<a href={inviteUrl} target="_blank" class="underline">{inviteUrl}</a>
					</p>
				</div>
			{/if}
		</div>
	</div>

	<h3 class="mt-12 text-lg font-bold">Existing Users</h3>
	
	<DataTable 
		items={data.users} 
		{columns} 
		emptyMessage="No other users found."
		row={userRow}
	/>
</div>

{#snippet userRow(user)}
	<td class="p-4 font-medium">{user.username}</td>
	<td class="p-4 text-right">
		<form method="POST" action="?/delete&id={user.id}" use:enhance={handleDelete}>
			<button
				type="submit"
				class="font-bold text-red-500 transition hover:text-red-400"
				title="Delete User"
			>
				<Icon icon="mdi:trash-can-outline" width="20" />
			</button>
		</form>
	</td>
{/snippet}