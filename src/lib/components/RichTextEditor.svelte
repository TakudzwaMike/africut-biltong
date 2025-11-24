<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Icon from '@iconify/svelte';

	let { content = $bindable(), initialContent = undefined } = $props();

	let element = $state();
	let editor = $state();

	onMount(() => {
		if (!browser) return;

		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					autolink: true,
					HTMLAttributes: {
						class: 'text-accent underline cursor-pointer'
					}
				})
			],
			content: initialContent || content || '',
			editorProps: {
				attributes: {
					class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] text-main/80'
				}
			},
			onUpdate: ({ editor }) => {
				content = editor.getJSON();
			},
			onTransaction: () => {
				editor = editor; 
			}
		});
	});

	// Fix: Watch for changes in initialContent to handle async data loading
	$effect(() => {
		if (editor && initialContent && !editor.isDestroyed) {
			// Check if content is different to avoid cursor jumping or loops
			// JSON.stringify is a cheap way to compare simple TipTap docs
			const currentContent = JSON.stringify(editor.getJSON());
			const newContent = JSON.stringify(initialContent);
			
			if (currentContent !== newContent && newContent !== JSON.stringify({ type: 'doc', content: [] })) {
				editor.commands.setContent(initialContent);
			}
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}
</script>

{#snippet toolbarButton(icon, label, onClick, isActive = false)}
	<button
		type="button"
		onclick={onClick}
		class="rounded p-2 text-main/60 transition-colors hover:bg-main/10 hover:text-main"
		class:bg-accent={isActive}
		class:text-main={isActive}
		title={label}
		aria-label={label}
	>
		<Icon {icon} width="20" />
	</button>
{/snippet}

<div class="rounded-xl border border-main/10 bg-light overflow-hidden shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-accent/50">
	{#if editor}
		<!-- Fixed Toolbar -->
		<div class="flex flex-wrap items-center gap-1 border-b border-main/10 bg-main/5 p-2">
			
			{@render toolbarButton(
				"mdi:format-header-2", 
				"Heading 2", 
				() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 
				editor.isActive('heading', { level: 2 })
			)}
			
			{@render toolbarButton(
				"mdi:format-header-3", 
				"Heading 3", 
				() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 
				editor.isActive('heading', { level: 3 })
			)}
			
			{@render toolbarButton(
				"mdi:format-paragraph", 
				"Paragraph", 
				() => editor.chain().focus().setParagraph().run(), 
				editor.isActive('paragraph')
			)}

			<div class="mx-2 h-5 w-px bg-main/20"></div>

			{@render toolbarButton(
				"mdi:format-bold", 
				"Bold", 
				() => editor.chain().focus().toggleBold().run(), 
				editor.isActive('bold')
			)}
			
			{@render toolbarButton(
				"mdi:format-italic", 
				"Italic", 
				() => editor.chain().focus().toggleItalic().run(), 
				editor.isActive('italic')
			)}

			<div class="mx-2 h-5 w-px bg-main/20"></div>

			{@render toolbarButton(
				"mdi:format-list-bulleted", 
				"Bullet List", 
				() => editor.chain().focus().toggleBulletList().run(), 
				editor.isActive('bulletList')
			)}
			
			{@render toolbarButton(
				"mdi:format-list-numbered", 
				"Ordered List", 
				() => editor.chain().focus().toggleOrderedList().run(), 
				editor.isActive('orderedList')
			)}

			<div class="mx-2 h-5 w-px bg-main/20"></div>

			{@render toolbarButton(
				"mdi:format-quote-close", 
				"Blockquote", 
				() => editor.chain().focus().toggleBlockquote().run(), 
				editor.isActive('blockquote')
			)}
			
			{@render toolbarButton(
				"mdi:link-variant", 
				"Link", 
				setLink, 
				editor.isActive('link')
			)}
			
			<button
				type="button"
				onclick={() => editor.chain().focus().unsetLink().run()}
				class="rounded p-2 text-main/60 transition-colors hover:bg-main/10 hover:text-main disabled:opacity-30"
				disabled={!editor.isActive('link')}
				title="Remove Link"
			>
				<Icon icon="mdi:link-variant-off" width="20" />
			</button>
		</div>
	{/if}

	<div bind:this={element} class="p-4"></div>
</div>