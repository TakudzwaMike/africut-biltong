<script>
    export let data;
</script>
<div class="relative z-10">
    <div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
        <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Our Case Studies</h1>
            <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
                See how we've delivered real-world results for our partners in the industry.
            </p>
        </div>
        <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {#each data.caseStudies as caseStudy}
                <a href={`/case-studies/${caseStudy.slug}`} class="corner-border block">
                    <blockquote class="italic text-main/80">
                        "{caseStudy.results[0]?.kpiValue || 'Significant'}" {caseStudy.results[0]?.kpiName || 'Improvements'}
                    </blockquote>
                    <cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
                        - {caseStudy.clientName}
                    </cite>
                    <p class="mt-2 text-sm text-main/60">{caseStudy.title}</p>
                </a>
            {/each}
        </div>
    </div>
</div>