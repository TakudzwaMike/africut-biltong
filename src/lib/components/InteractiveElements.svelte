<script>
	import Switch from './Switch.svelte';
	import Tooltip from './Tooltip.svelte';
	import { toast } from '$lib/toast-service.js';
	import { viewport } from '$lib/actions/viewport.js';

	let notificationsEnabled = $state(true);
	let darkModeEnabled = $state(false);
	let autoSaveEnabled = $state(true);
	let isVisible = $state(false);
</script>

<section id="interactive-elements" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div
			class="fade-in"
			class:is-visible={isVisible}
			use:viewport={{ threshold: 0.1 }}
			onenterViewport={() => (isVisible = true)}
		>
			<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
				Interactive Elements
			</h2>
			<p class="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-main/70">
				A collection of stateful, accessible UI controls.
			</p>
			<div
				class="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:items-start"
			>
				<!-- Left Column -->
				<div class="rounded-xl border border-main/10 bg-light/50 p-8 shadow-sm">
					<h3 class="text-lg font-bold">Switches & Tooltips</h3>
					<div class="mt-6 space-y-6">
						<Switch bind:checked={notificationsEnabled}>Enable Notifications</Switch>
						<Switch bind:checked={darkModeEnabled}>Dark Mode</Switch>
						<Switch bind:checked={autoSaveEnabled}>Auto-Save Document</Switch>
					</div>
					<div class="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-main/10 pt-8">
						<Tooltip text="This is a button tooltip!">
							<button class="rounded-md bg-main px-4 py-2 text-sm font-bold text-light">
								Hover Over Me
							</button>
						</Tooltip>
						<Tooltip text="This is a text tooltip!">
							<span class="cursor-help border-b border-dashed border-main/50">or me!</span>
						</Tooltip>
					</div>
				</div>

				<!-- Right Column -->
				<div class="rounded-xl border border-main/10 bg-light/50 p-8 shadow-sm">
					<h3 class="text-lg font-bold">Notifications</h3>
					<p class="mt-2 text-sm text-main/70">Click buttons to trigger toast messages.</p>
					<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<button
							onclick={() => toast.success('Profile updated successfully!')}
							class="rounded-md bg-green-500 px-4 py-2 font-bold text-white transition hover:bg-green-600"
						>
							Success
						</button>
						<button
							onclick={() => toast.error('Connection failed. Please try again.')}
							class="rounded-md bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-600"
						>
							Error
						</button>
						<button
							onclick={() => toast.info('A new software update is available.')}
							class="rounded-md bg-main px-4 py-2 font-bold text-light transition hover:bg-main/90 sm:col-span-2"
						>
							Information
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>