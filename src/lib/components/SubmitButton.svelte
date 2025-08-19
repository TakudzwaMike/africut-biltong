<script>
	let {
        children,
		loading = false,
		success = false,
		error = false,
		class: className = '',
		...rest
	} = $props();

	const baseClasses =
		'rounded-md px-8 py-3 font-bold text-main shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none';
</script>

<button
	{...rest}
	disabled={loading || success || error}
	class="{baseClasses} {className}"
	class:bg-accent={!success && !error}
	class:bg-green-500={success}
	class:shadow-green-500={success}
	class:bg-red-500={error}
	class:shadow-red-500={error}
	class:animate-shake={error}
>
	{#if loading}
		<div class="flex items-center justify-center gap-2">
			<svg
				class="h-5 w-5 animate-spin text-main"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<span>Processing...</span>
		</div>
	{:else if success}
		<span>Done!</span>
	{:else if error}
		<span>That didn't work.</span>
	{:else}
		{@render children?.()}
	{/if}
</button>

<style>
	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}
	.animate-shake {
		animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
</style>