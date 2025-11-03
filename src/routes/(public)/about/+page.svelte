<script>
	import CompanyHistory from '$lib/components/CompanyHistory.svelte';
	import OurTeam from '$lib/components/OurTeam.svelte';

	let { data } = $props();
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 text-center sm:py-24">
		<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">
			Pioneering Intelligence in Heavy Industry
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-main/70">
			Vision AI Tech was founded to bring the transformative power of artificial intelligence to the
			world's most essential and challenging sectors.
		</p>
	</div>
</div>

<CompanyHistory content={data.content?.history} />
<OurTeam teamMembers={data.teamMembers} />