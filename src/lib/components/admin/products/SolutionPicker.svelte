<script>
    /** @type {any[]} All available solutions */
    let { allSolutions = [], selectedIds = $bindable(new Set()) } = $props();

    function toggle(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        // Force reactivity
        selectedIds = new Set(selectedIds);
    }
</script>

<div>
    <p class="text-sm text-main/70 mb-4">
        Select the Solutions that use this product.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {#each allSolutions as solution}
            <label
                class="flex items-start gap-3 p-2 rounded border border-main/10 hover:bg-main/5 cursor-pointer transition-colors {selectedIds.has(
                    solution.id,
                )
                    ? 'bg-accent/10 border-accent'
                    : ''}"
            >
                <input
                    type="checkbox"
                    checked={selectedIds.has(solution.id)}
                    onchange={() => toggle(solution.id)}
                    class="mt-1 h-4 w-4 rounded border-main/30 text-accent focus:ring-accent"
                />
                <span class="block text-sm font-bold text-main"
                    >{solution.solutionName}</span
                >
            </label>
        {/each}
        {#if allSolutions.length === 0}
            <p class="text-sm text-main/40 italic col-span-2">
                No solutions available.
            </p>
        {/if}
    </div>
</div>
