<script>
	/** @type {import('./$types').PageData} */
	export let data;
	const { caseStudy } = data;

	// A helper function to render Strapi's rich text
	function renderRichText(richTextArray) {
		return richTextArray.map(element => {
			if (element.type === 'paragraph') {
				return element.children.map(child => child.text).join('');
			}
			return '';
		}).join('<br><br>');
	}
</script>


<svelte:head>
    <title>{caseStudy.title} | Vision AI Tech Case Study</title>
    <meta name="description" content="Read our case study with {caseStudy.clientName} on {caseStudy.title.toLowerCase()}." />
</svelte:head>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<!-- Header -->
		<div class="text-center">
			<p class="font-bold text-accent drop-shadow-accent-glow">
				Case Study: {caseStudy.clientName}
			</p>
			<h1 class="mt-2 text-4xl font-bold tracking-tight text-main sm:text-5xl">
				{caseStudy.title}
			</h1>
		</div>

		<!-- Body -->
		<div class="mt-16 space-y-12">
			<div class="corner-border">
				<h2 class="text-2xl font-bold text-main">The Challenge</h2>
				<div class="prose mt-4 max-w-none">
					{@html renderRichText(caseStudy.challenge)}
				</div>
			</div>

			<div class="corner-border">
				<h2 class="text-2xl font-bold text-main">Our Solution</h2>
				<div class="prose mt-4 max-w-none">
					{@html renderRichText(caseStudy.solution)}
				</div>
			</div>
            
            <div class="rounded-xl bg-main p-8 text-center">
                <h3 class="text-2xl font-bold text-light">Key Results</h3>
                <div class="mt-6 flex flex-wrap justify-center gap-8">
                    {#each caseStudy.results as result}
                        <div class="text-light">
                            <p class="text-4xl font-bold text-accent">{result.kpiValue}</p>
                            <p class="mt-1 font-medium">{result.kpiName}</p>
                        </div>
                    {/each}
                </div>
            </div>
		</div>
	</div>
</div>