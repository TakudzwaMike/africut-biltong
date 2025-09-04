<script>
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<div class="relative z-10">
	<div class="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Create Your Account</h1>
			<p class="mt-4 text-lg leading-8 text-main/70">
				Welcome to the team. Choose a username and a secure password to get started.
			</p>
		</div>

		<form
			method="POST"
			class="mt-12 space-y-6"
			use:enhance={() => {
				isSubmitting = true;
				return ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success' && result.data?.type === 'redirect') {
						goto(result.data.location, { invalidateAll: true });
					}
				};
			}}
		>
			<div>
				<label for="username" class="block text-sm font-medium leading-6 text-main/80"
					>Username</label
				>
				<div class="mt-2">
					<input
						id="username"
						name="username"
						type="text"
						required
						value={form?.data?.username ?? ''}
						class="block w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 placeholder:text-main/50 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium leading-6 text-main/80"
					>Password</label
				>
				<div class="mt-2">
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength="6"
						class="block w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 placeholder:text-main/50 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>

			{#if form?.message}
				<p class="text-center font-bold text-red-600">{form.message}</p>
			{/if}

			<div>
				<SubmitButton type="submit" loading={isSubmitting} class="w-full bg-accent">
					Create Account & Login
				</SubmitButton>
			</div>
		</form>
	</div>
</div>