<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// We only import the tools here. The main EditorJS class will be imported dynamically.
	import Header from '@editorjs/header';
	import List from '@editorjs/list';
	import Paragraph from '@editorjs/paragraph';

	let { initialContent = null, content = $bindable() } = $props();

	let holder;
	let editor;

	onMount(async () => {
		// This onMount block only runs in the browser.
		// We dynamically import the main EditorJS class here to prevent it from running on the server.
		const EditorJS = (await import('@editorjs/editorjs')).default;

		editor = new EditorJS({
			holder: holder,
			placeholder: 'Let’s write an awesome story!',
			tools: {
				paragraph: {
					class: Paragraph,
					inlineToolbar: true
				},
				header: {
					class: Header,
					inlineToolbar: true
				},
				list: {
					class: List,
					inlineToolbar: true
				}
			},
			data: initialContent || {},

			onChange: async (api) => {
				const savedData = await api.saver.save();
				content = savedData;
			},
			
			// This will focus the editor once it's ready
			onReady: () => {
				if(holder) {
					holder.querySelector('.codex-editor__redactor')?.focus();
				}
			}
		});

		return () => {
			if (editor && typeof editor.destroy === 'function') {
				editor.destroy();
			}
		};
	});

	// Handle external changes to initialContent after mount
	$effect(() => {
		if (browser && editor && initialContent && typeof editor.render === 'function') {
			// This check prevents re-rendering if the content is the same, avoiding cursor jumps
			if (JSON.stringify(content) !== JSON.stringify(initialContent)) {
				editor.render(initialContent);
			}
		}
	});
</script>

<div
	bind:this={holder}
	class="prose prose-lg max-w-none rounded-md border border-main/10 bg-main/5 p-4 text-main focus-within:border-accent"
	style="min-height: 200px;"
>
	<!-- Placeholder shown during SSR and before the editor mounts on the client -->
	{#if !browser}
		<div class="text-main/50">Loading Editor...</div>
	{/if}
</div>