<script>
    import "../../../../app.css";
    import { page } from "$app/state";
    import { afterNavigate } from "$app/navigation";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import Icon from "@iconify/svelte";
    // Import our new permissions logic
    import { ADMIN_NAV, hasAccess } from "$lib/admin/permissions";
    import ToastContainer from "$lib/components/ToastContainer.svelte";

    let { children, data } = $props();
    let isMenuOpen = $state(false);
    let expandedSections = $state({});
    let mounted = $state(false);

    // Initialize state from local storage or default to all open
    onMount(() => {
        const stored = localStorage.getItem("admin_sidebar_state");
        if (stored) {
            try {
                expandedSections = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse sidebar state", e);
            }
        } else {
            // Default all sections to open
            ADMIN_NAV.forEach((s) => {
                expandedSections[s.section] = true;
            });
        }
        mounted = true;
    });

    function toggleSection(sectionName) {
        expandedSections[sectionName] = !expandedSections[sectionName];
        localStorage.setItem(
            "admin_sidebar_state",
            JSON.stringify(expandedSections),
        );
    }

    // Pre-calculate all available nav hrefs for specific matching
    const allNavHrefs = ADMIN_NAV.flatMap((s) => s.items.map((i) => i.href));

    function isActive(href) {
        const pathname = page.url.pathname;

        if (href === "/_/admin") {
            return pathname === href;
        }

        // Check if current path matches this href
        const isMatch = pathname.startsWith(href);
        if (!isMatch) return false;

        // If it's a match, ensure there isn't a MORE specific (longer) match in the nav
        const hasBetterMatch = allNavHrefs.some(
            (h) => h.length > href.length && pathname.startsWith(h),
        );

        return !hasBetterMatch;
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    afterNavigate(() => {
        isMenuOpen = false;
    });

    // Configuration for Role Badges
    const roleBadges = {
        admin: {
            label: "Admin",
            bg: "bg-purple-600",
            text: "text-purple-50",
            icon: "mdi:shield-crown",
        },
        store_manager: {
            label: "Store Mgr",
            bg: "bg-blue-600",
            text: "text-blue-50",
            icon: "mdi:store",
        },
        content_editor: {
            label: "Editor",
            bg: "bg-green-600",
            text: "text-green-50",
            icon: "mdi:fountain-pen-tip",
        },
        customer: {
            label: "Guest",
            bg: "bg-gray-500",
            text: "text-white",
            icon: "mdi:account",
        },
    };

    // Fallback for safety
    const currentRole = data.user?.role || "customer";
    const badge = roleBadges[currentRole] || {
        label: "Guest",
        bg: "bg-gray-500",
        text: "text-white",
        icon: "mdi:account",
    };
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
        href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="flex min-h-screen bg-light text-main font-sans">
    <!-- SIDEBAR -->
    <aside
        class="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-main/10 bg-white transition-transform duration-300 lg:translate-x-0 {isMenuOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full'}"
    >
        <!-- Brand & Role Header -->
        <div class="flex flex-col border-b border-main/10 p-6">
            <span class="text-xl font-bold tracking-tight text-main"
                >Vision AI Panel</span
            >

            <!-- Dynamic Role Badge -->
            <div
                class="mt-3 flex w-fit items-center gap-2 rounded-md {badge.bg} px-3 py-1.5 {badge.text} shadow-sm"
            >
                <Icon icon={badge.icon} width="16" />
                <span class="text-xs font-bold uppercase tracking-wider"
                    >{badge.label}</span
                >
            </div>
        </div>

        <!-- Navigation Loop -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
            {#each ADMIN_NAV as section}
                <!-- Filter items based on the user's role -->
                {@const visibleItems = section.items.filter((item) =>
                    hasAccess(currentRole, item.roles),
                )}

                {#if visibleItems.length > 0}
                    <div class="py-2">
                        <!-- Section Header (Collapsible Trigger) -->
                        <button
                            onclick={() => toggleSection(section.section)}
                            class="flex w-full items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-main/40 hover:text-main/70 transition-colors"
                        >
                            <span>{section.section}</span>
                            <Icon
                                icon="mdi:chevron-down"
                                class="transition-transform duration-200 {expandedSections[
                                    section.section
                                ]
                                    ? 'rotate-180'
                                    : ''}"
                            />
                        </button>

                        <!-- Collapsible Content -->
                        {#if !mounted || expandedSections[section.section]}
                            <ul
                                class="mt-2 space-y-1"
                                transition:slide|local={{
                                    duration: 200,
                                    axis: "y",
                                }}
                            >
                                {#each visibleItems as item}
                                    {@const active = isActive(item.href)}
                                    <li>
                                        <a
                                            href={item.href}
                                            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all {active
                                                ? 'bg-main text-light shadow-sm translate-x-1'
                                                : 'text-main/70 hover:bg-main/5 hover:text-main hover:translate-x-1'}"
                                        >
                                            <Icon
                                                icon={item.icon}
                                                width="20"
                                                class={active
                                                    ? "text-accent"
                                                    : "opacity-70"}
                                            />
                                            {item.label}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                {/if}
            {/each}
        </nav>

        <!-- User Footer -->
        <div class="border-t border-main/10 p-4">
            <div class="flex items-center gap-3 mb-3 px-2">
                <div
                    class="h-8 w-8 rounded-full bg-main/10 flex items-center justify-center font-bold text-main/60 text-xs border border-main/5"
                >
                    {(data.user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div class="overflow-hidden">
                    <p class="truncate text-sm font-bold text-main">
                        {data.user?.firstName || "User"}
                    </p>
                    <p class="truncate text-xs text-main/50">
                        {data.user?.email}
                    </p>
                </div>
            </div>
            <form action="/logout" method="POST">
                <button
                    class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
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
        <header
            class="flex items-center justify-between border-b border-main/10 bg-white/80 px-6 py-4 backdrop-blur-md lg:hidden sticky top-0 z-30"
        >
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

<ToastContainer />
