<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<PageHeader 
    title="Create Account" 
    subtitle="Join Vision AI to track orders and manage your hardware licenses."
/>

<div class="relative z-10 bg-slate-50 py-24">
	<div class="mx-auto max-w-lg px-8">
		<div class="rounded-xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
            
            <form method="POST" onsubmit={() => isSubmitting = true} class="space-y-6">
                {#if form?.error}
                    <div class="rounded-md bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200">
                        {form.error}
                    </div>
                {/if}

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="firstName" class="block text-sm font-bold text-main/80 mb-2">First Name</label>
                        <input type="text" name="firstName" id="firstName" required value={form?.data?.firstName || ''} class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent" />
                    </div>
                    <div>
                        <label for="lastName" class="block text-sm font-bold text-main/80 mb-2">Last Name</label>
                        <input type="text" name="lastName" id="lastName" required value={form?.data?.lastName || ''} class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent" />
                    </div>
                </div>

                <div>
                    <label for="email" class="block text-sm font-bold text-main/80 mb-2">Email Address</label>
                    <input type="email" name="email" id="email" required value={form?.data?.email || ''} class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent" />
                </div>

                <div>
                    <label for="password" class="block text-sm font-bold text-main/80 mb-2">Password</label>
                    <input type="password" name="password" id="password" required minlength="8" class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent" />
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-bold text-main/80 mb-2">Confirm Password</label>
                    <input type="password" name="confirmPassword" id="confirmPassword" required class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent" />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    class="w-full rounded-md bg-main px-8 py-3 font-bold text-light shadow-lg transition-all hover:bg-main/90 disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
            </form>

            <div class="mt-8 text-center text-sm text-main/60">
                Already have an account? 
                <a href="/login" class="font-bold text-accent hover:underline">Sign In</a>
            </div>
        </div>
    </div>
</div>