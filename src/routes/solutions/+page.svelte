<script>
    export let data;
</script>
<div class="relative z-10">
    <div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
        <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Our Solutions</h1>
            <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
                A suite of AI-powered modules designed to tackle your most critical operational challenges.
            </p>
        </div>
        <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {#each data.solutions as solution}
                <a href={`/solutions/${solution.slug}`} class="corner-border block p-8">
                    <h3 class="text-2xl font-bold text-main">{solution.solutionName}</h3>
                    <p class="mt-2 text-main/70">{solution.shortDescription}</p>
                    <span class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow">Learn More →</span>
                </a>
            {/each}
        </div>
    </div>
</div>