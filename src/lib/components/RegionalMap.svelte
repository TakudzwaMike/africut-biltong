<script>
	let { locations = [] } = $props();

	// Bounding box for Southern Africa to map coordinates to the SVG viewBox.
	// These values can be adjusted to change the zoom/pan of the map.
	const bounds = {
		minLat: -35.0,
		maxLat: -15.0,
		minLon: 15.0,
		maxLon: 38.0
	};

	const svgSize = { width: 500, height: 500 };

	function projectCoordinates(lat, lon) {
		if (lat === null || lon === null) return null;

		const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * svgSize.height;
		const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * svgSize.width;

		return { x, y };
	}

	let mappedLocations = $derived(
		locations
			.map((loc) => ({
				...loc,
				position: projectCoordinates(parseFloat(loc.latitude), parseFloat(loc.longitude))
			}))
			.filter((loc) => loc.position) // Only include locations with valid coordinates
	);
</script>

<div class="relative">
	<svg
		viewBox="0 0 {svgSize.width} {svgSize.height}"
		class="w-full h-auto"
	>
		<!-- Simplified map outline of Southern Africa -->
		<path
			d="M326 405 l-24 -4 c-13 -2 -24 -6 -24 -9 c0 -3 -15 -14 -33 -25 c-32 -18 -55 -41 -65 -64 l-6 -15 13 -12 c7 -7 20 -13 29 -14 l16 -1 -1 -12 c-1 -10 -5 -21 -10 -25 l-9 -8 -30 20 c-17 11 -35 20 -41 20 c-6 0 -11 -2 -11 -5 c0 -3 -16 -23 -35 -45 c-20 -22 -37 -43 -39 -46 c-2 -3 -10 -2 -17 3 c-16 11 -33 11 -48 1 l-9 -6 -5 -28 c-3 -15 -2 -28 2 -28 c4 0 11 -5 15 -12 l7 -11 23 2 c13 1 24 0 24 -3 c0 -2 -5 -9 -11 -15 c-15 -15 -11 -34 7 -34 c10 0 13 -3 13 -13 l1 -12 25 11 c21 9 26 9 44 -1 l24 -14 15 10 c8 5 21 15 28 22 l14 13 18 -18 c10 -10 24 -24 32 -32 l14 -14 26 12 c14 7 30 13 36 14 l10 2 6 12 c3 6 8 20 10 30 l4 19 19 -4 c10 -2 24 -1 31 3 l12 6 2 24 c2 20 2 24 -3 30 l-7 9 -17 -2 c-9 -1 -25 3 -35 8 c-24 13 -40 43 -31 58 l5 8 13 0 c13 0 14 2 8 12 c-10 16 -10 35 1 54 l7 12 11 -12 c6 -7 18 -15 26 -19 l15 -6 6 13 c3 7 11 20 16 29 l10 17 -18 10 c-10 5 -23 15 -29 22 l-11 13 -12 -6z"
			class="fill-main/5 stroke-main/10"
			stroke-width="2"
		/>

		<!-- Location Markers -->
		{#each mappedLocations as loc}
			<g class="group cursor-pointer">
				<circle
					cx={loc.position.x}
					cy={loc.position.y}
					r="12"
					class="fill-accent/20 opacity-0 transition-opacity group-hover:opacity-100"
				/>
				<circle
					cx={loc.position.x}
					cy={loc.position.y}
					r="6"
					class="fill-accent drop-shadow-accent-glow"
				/>
				<!-- Tooltip Text -->
				<text
					x={loc.position.x}
					y={loc.position.y - 18}
					class="fill-main text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
					text-anchor="middle"
				>
					{loc.countryName}
				</text>
			</g>
		{/each}
	</svg>
</div>