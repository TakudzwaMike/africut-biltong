<script>
    import Icon from "@iconify/svelte";

    /** @type {any[]} Features array (bindable) */
    let { features = $bindable([]) } = $props();

    function addFeature() {
        features = [...features, { icon: "mdi:check", text: "" }];
    }

    function removeFeature(index) {
        features = features.filter((_, i) => i !== index);
    }
</script>

<div>
    <div class="flex items-center justify-between mb-3">
        <label class="text-sm font-bold text-main/80">Key Features</label>
        <button
            type="button"
            onclick={addFeature}
            class="text-xs font-bold text-accent hover:underline"
        >
            + Add Feature
        </button>
    </div>
    <div class="space-y-2">
        {#each features as feature, i}
            <div class="flex gap-2">
                <div class="relative w-1/4">
                    <div
                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2"
                    >
                        <Icon
                            icon={feature.icon || "mdi:check"}
                            class="text-main/40"
                        />
                    </div>
                    <input
                        type="text"
                        bind:value={feature.icon}
                        placeholder="Icon"
                        class="w-full rounded border-main/20 pl-8 py-1.5 text-sm"
                    />
                </div>
                <input
                    type="text"
                    bind:value={feature.text}
                    placeholder="Description"
                    class="flex-1 rounded border-main/20 py-1.5 text-sm"
                />
                <button
                    type="button"
                    onclick={() => removeFeature(i)}
                    class="text-red-500 px-2"
                >
                    <Icon icon="mdi:close" />
                </button>
            </div>
        {/each}
        {#if features.length === 0}
            <p class="text-sm text-main/40 italic">No features added yet.</p>
        {/if}
    </div>
</div>
