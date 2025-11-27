<script>
	import '../../../../app.css'
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import Icon from '@iconify/svelte';
    // Import our new permissions logic
    import { ADMIN_NAV, hasAccess } from '$lib/admin/permissions';

	let { children, data } = $props();
	let isMenuOpen = $state(false);

    // Determine current active link style
    function isActive(href) {
        return page.url.pathname.startsWith(href);
    }

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	afterNavigate(() => {
		isMenuOpen = false;
	});

    // Configuration for Role Badges
    const roleBadges = {
        admin: { label: 'Admin', bg: 'bg-purple-600', text: 'text-purple-50', icon: 'mdi:shield-crown' },
        store_manager: { label: 'Store Mgr', bg: 'bg-blue-600', text: 'text-blue-50', icon: 'mdi:store' },
        content_editor: { label: 'Editor', bg: 'bg-green-600', text: 'text-green-50', icon: 'mdi:fountain-pen-tip' }
    };

    // Fallback for safety
    const currentRole = data.user?.role || 'customer';
    const badge = roleBadges[currentRole] || { label: 'Guest', bg: 'bg-gray-500', text: 'text-white', icon: 'mdi:account' };
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex min-h-screen bg-light text-main font-sans">
    
    <!-- SIDEBAR -->
    <aside class="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-main/10 bg-white transition-transform duration-300 lg:translate-x-0 {isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
        
        <!-- Brand & Role Header -->
        <div class="flex flex-col border-b border-main/10 p-6">
            <span class="text-xl font-bold tracking-tight text-main">Vision AI Panel</span>
            
            <!-- Dynamic Role Badge -->
            <div class="mt-3 flex w-fit items-center gap-2 rounded-md {badge.bg} px-3 py-1.5 {badge.text} shadow-sm">
                <Icon icon={badge.icon} width="16" />
                <span class="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
            </div>
        </div>

        <!-- Navigation Loop -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-8">
            {#each ADMIN_NAV as section}
                <!-- Filter items based on the user's role -->
                {@const visibleItems = section.items.filter(item => hasAccess(currentRole, item.roles))}
                
                {#if visibleItems.length > 0}
                    <div>
                        <h3 class="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-main/40">{section.section}</h3>
                        <ul class="space-y-1">
                            {#each visibleItems as item}
                                <li>
                                    <a 
                                        href={item.href} 
                                        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive(item.href) ? 'bg-main text-light shadow-sm' : 'text-main/70 hover:bg-main/5 hover:text-main'}"
                                    >
                                        <Icon icon={item.icon} width="20" />
                                        {item.label}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            {/each}
        </nav>

        <!-- User Footer -->
        <div class="border-t border-main/10 p-4">
            <div class="flex items-center gap-3 mb-3 px-2">
                <div class="h-8 w-8 rounded-full bg-main/10 flex items-center justify-center font-bold text-main/60 text-xs border border-main/5">
                    {(data.user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div class="overflow-hidden">
                    <p class="truncate text-sm font-bold text-main">{data.user?.firstName || 'User'}</p>
                    <p class="truncate text-xs text-main/50">{data.user?.email}</p>
                </div>
            </div>
            <form action="/logout" method="POST">
                <button class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <Icon icon="mdi:logout" /> Sign Out
                </button>
            </form>
        </div>
    </aside>

    <!-- Mobile Overlay -->
    {#if isMenuOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div 
            class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" 
            onclick={toggleMenu} 
            role="button" 
            tabindex="0"
        ></div>
    {/if}

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <!-- Mobile Header -->
        <header class="flex items-center justify-between border-b border-main/10 bg-white/80 px-6 py-4 backdrop-blur-md lg:hidden sticky top-0 z-30">
            <span class="font-bold text-main">Admin Panel</span>
            <button onclick={toggleMenu} class="text-main">
                <Icon icon="mdi:menu" width="24" />
            </button>
        </header>

        <main class="flex-1">
            {@render children?.()}
        </main>
    </div>

</div>