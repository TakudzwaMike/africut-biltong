<script>
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Tipex } from '@friendofsvelte/tipex';

	let { content = $bindable(), initialContent = undefined } = $props();

	let editorEl = $state();
	let editor = $state();

	$effect(() => {
		// Ensure we only initialize once we have the element
		if (!editorEl) return;

		// Create the editor instance
		const editorInstance = new Editor({
			element: editorEl,
			extensions: [StarterKit],
			content: initialContent || '', // Start with initial content or empty string
			editorProps: {
				attributes: {
					class: 'prose max-w-none p-4 h-64 focus:outline-none overflow-y-auto'
				}
			},
			// This is the key part: on every update, bind the content back to the parent
			onUpdate: ({ editor }) => {
				content = editor.getJSON();
			}
		});

		// Set the state to make the editor available to the template
		editor = editorInstance;

		// Cleanup when the component is destroyed
		return () => {
			editorInstance.destroy();
		};
	});
</script>

<div class="rounded-md border border-main/20 bg-main/5">
	{#if editor}
		<!-- The Tipex toolbar, which needs a valid editor instance -->
		<div class="border-b border-main/20 p-2">
			<Tipex {editor} />
		</div>
	{/if}
	<!-- The element where TipTap will mount the editor -->
	<div bind:this={editorEl}></div>
</div>