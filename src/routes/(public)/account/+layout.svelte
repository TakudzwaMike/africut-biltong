<script>
	import { page } from '$app/stores';
    import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';
	  
	let { data, children } = $props();
    const { user } = data;
	const currentPath = $derived($page.url.pathname);
</script>

<PageHeader 
    title="My Account" 
    subtitle={`Welcome back, ${user.firstName || user.email}`}
/>

<div class="relative z-10 bg-slate-50 py-24">
    <div class="mx-auto max-w-7xl px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-4">
            
            <!-- Sidebar -->
            <aside class="lg:col-span-1">
                <nav class="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                    <a 
                        href="/account" 
                        class="flex items-center gap-3 border-l-4 px-6 py-4 font-bold transition-all hover:bg-slate-50 {currentPath === '/account' ? 'border-accent bg-accent/5 text-main' : 'border-transparent text-main/60'}"
                    >
                        <Icon icon="mdi:account" width="20" /> Profile
                    </a>
                    <a 
                        href="/account/orders" 
                        class="flex items-center gap-3 border-l-4 px-6 py-4 font-bold transition-all hover:bg-slate-50 {currentPath.startsWith('/account/orders') ? 'border-accent bg-accent/5 text-main' : 'border-transparent text-main/60'}"
                    >
                        <Icon icon="mdi:package-variant" width="20" /> Order History
                    </a>
                    <a 
                        href="/account/addresses" 
                        class="flex items-center gap-3 border-l-4 px-6 py-4 font-bold transition-all hover:bg-slate-50 {currentPath.startsWith('/account/addresses') ? 'border-accent bg-accent/5 text-main' : 'border-transparent text-main/60'}"
                    >
                        <Icon icon="mdi:map-marker" width="20" /> Addresses
                    </a>
                    
                    <div class="border-t border-slate-100 p-4">
                        <form action="/logout" method="POST">
                            <button class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                                <Icon icon="mdi:logout" /> Sign Out
                            </button>
                        </form>
                    </div>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="lg:col-span-3">
                {@render children?.()}
            </main>

        </div>
    </div>
</div>