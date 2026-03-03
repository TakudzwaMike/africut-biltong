<script>
    import Icon from "@iconify/svelte";

    /** @type {boolean} */
    export let open = false;
    /** @type {string} */
    export let title = "";
    /** @type {() => void} */
    export let onClose = () => {};
</script>

{#if open}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        onclick={onClose}
        class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        role="button"
        tabindex="0"
    ></div>

    <!-- Slide-Over Container -->
    <div
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-light shadow-2xl transition-transform"
    >
        <!-- Header -->
        <div
            class="flex items-center justify-between border-b border-main/10 px-6 py-4 bg-white"
        >
            <h2 class="text-xl font-bold text-main">{title}</h2>
            <button onclick={onClose} class="text-main/50 hover:text-main">
                <Icon icon="mdi:close" width="24" />
            </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
            <slot />
        </div>

        <!-- Sticky Footer -->
        <div
            class="border-t border-main/10 bg-white p-4 flex flex-col sm:flex-row justify-end gap-4"
        >
            <slot name="footer" />
        </div>
    </div>
{/if}
