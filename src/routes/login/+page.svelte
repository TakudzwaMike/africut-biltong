<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import Icon from '@iconify/svelte';

	let { form } = $props();
    let isSubmitting = $state(false);
</script>

<PageHeader 
    title="Sign In" 
    subtitle="Access your dashboard, track orders, and manage your account."
/>

<div class="relative z-10 bg-slate-50 py-24">
	<div class="mx-auto max-w-md px-8">
		<div class="rounded-xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
            
            <form method="POST" onsubmit={() => isSubmitting = true} class="space-y-6">
                {#if form?.message}
                    <div class="rounded-md bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200">
                        {form.message}
                    </div>
                {/if}

                <div>
                    <label for="email" class="block text-sm font-bold text-main/80 mb-2">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        required 
                        class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
                    />
                </div>

                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label for="password" class="block text-sm font-bold text-main/80">Password</label>
                        <a href="/forgot-password" class="text-xs font-bold text-accent hover:underline">Forgot?</a>
                    </div>
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        required 
                        class="w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    class="w-full rounded-md bg-main px-8 py-3 font-bold text-light shadow-lg transition-all hover:bg-main/90 disabled:opacity-50"
                >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div class="mt-8 text-center text-sm text-main/60">
                Don't have an account? 
                <a href="/register" class="font-bold text-accent hover:underline">Create one now</a>
            </div>
        </div>
    </div>
</div>