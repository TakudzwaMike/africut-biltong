<script>
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { viewport } from "$lib/actions/viewport";

	/**
	 * @type {{ value: string, duration?: number }}
	 */
	let { value, duration = 1500 } = $props();

	// Parse the input string (e.g., "$15.5M")
	const match = value
		.toString()
		.match(/^([^0-9\.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);

	const prefix = match ? match[1] : "";
	const targetNumber = match ? parseFloat(match[2]) : 0;
	const suffix = match ? match[3] : "";
	const isInteger = match ? !match[2].includes(".") : true;

	// Create the tweened store
	const displayValue = tweened(0, {
		duration: duration,
		easing: cubicOut,
	});

	let hasAnimated = false;

	function handleEnter() {
		if (!hasAnimated) {
			displayValue.set(targetNumber);
			hasAnimated = true;
		}
	}
</script>

<span
	use:viewport={{ once: true, threshold: 0.5, onEnter: handleEnter }}
	class="inline-block tabular-nums"
>
	{prefix}{isInteger
		? Math.round($displayValue)
		: $displayValue.toFixed(1)}{suffix}
</span>
