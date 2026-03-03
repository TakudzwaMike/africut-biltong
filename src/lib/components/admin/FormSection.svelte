<script>
    /** @type {string} */
    export let title = "";
    /** @type {string | undefined} */
    export let className = "";
</script>

<div
    class="rounded-xl border border-main/10 bg-white p-4 sm:p-6 shadow-sm {className}"
>
    {#if title}
        <h3
            class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4"
        >
            {title}
        </h3>
    {/if}
    <slot />
</div>
