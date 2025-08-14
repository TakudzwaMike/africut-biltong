<script>
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Tipex } from '@friendofsvelte/tipex';

	let { content = $bindable(), initialContent = null } = $props();
	let element = $state();
	let editor = $state();

	$effect(() => {
		if (element && !editor) {
			editor = new Editor({
				element: element,
				extensions: [StarterKit],
				content: initialContent,
				onUpdate: ({ editor }) => {
					content = editor.getJSON();
				},
				editorProps: {
					attributes: {
						class: 'prose max-w-none p-4 focus:outline-none'
					}
				}
			});
		}

		return () => {
			if (editor) {
				editor.destroy();
			}
		};
	});
</script>

<div class="rounded-md border border-main/20 bg-main/5">
	{#if editor}
		<div class="border-b border-main/20 p-2">
			<Tipex {editor} />
		</div>
	{/if}
	<div bind:this={element}></div>
</div>