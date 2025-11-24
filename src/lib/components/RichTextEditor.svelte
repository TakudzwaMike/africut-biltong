<script>
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import BubbleMenu from '@tiptap/extension-bubble-menu';
	import Icon from '@iconify/svelte';

	let { content = $bindable(), initialContent = undefined } = $props();

	let editorEl = $state();
	let bubbleMenuEl = $state();
	let editor = $state();

	$effect(() => {
		if (!editorEl) return;

		const editorInstance = new Editor({
			element: editorEl,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false, // Don't open links in the editor
					autolink: true,     // Automatically detect links
				}),
				BubbleMenu.configure({
					element: bubbleMenuEl,
					tippyOptions: {
						duration: 100,
					},
				}),
			],
			content: initialContent || '',
			editorProps: {
				attributes: {
					class: 'prose max-w-none p-4 min-h-[200px] focus:outline-none overflow-y-auto',
				},
			},
			onUpdate: ({ editor }) => {
				content = editor.getJSON();
			},
		});

		editor = editorInstance;

		return () => {
			editorInstance.destroy();
		};
	});

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		if (url === null) return; // User cancelled
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}
</script>

<div class="rounded-md border border-main/20 bg-main/5">
	{#if editor}
		<!-- Fixed Toolbar for Block Elements -->
		<div class="flex flex-wrap items-center gap-1 border-b border-main/20 p-2">
			<!-- Headings -->
			<button
				type="button"
				class:is-active={editor.isActive('heading', { level: 2 })}
				on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Icon icon="mdi:format-header-2" />
			</button>
			<button
				type="button"
				class:is-active={editor.isActive('heading', { level: 3 })}
				on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				<Icon icon="mdi:format-header-3" />
			</button>
			<button
				type="button"
				class:is-active={editor.isActive('paragraph')}
				on:click={() => editor.chain().focus().setParagraph().run()}
			>
				<Icon icon="mdi:format-paragraph" />
			</button>

			<div class="mx-2 h-5 w-px bg-main/20"></div>

			<!-- Lists -->
			<button
				type="button"
				class:is-active={editor.isActive('bulletList')}
				on:click={() => editor.chain().focus().toggleBulletList().run()}
			>
				<Icon icon="mdi:format-list-bulleted" />
			</button>
			<button
				type="button"
				class:is-active={editor.isActive('orderedList')}
				on:click={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<Icon icon="mdi:format-list-numbered" />
			</button>

			<div class="mx-2 h-5 w-px bg-main/20"></div>

			<!-- Blockquote -->
			<button
				type="button"
				class:is-active={editor.isActive('blockquote')}
				on:click={() => editor.chain().focus().toggleBlockquote().run()}
			>
				<Icon icon="mdi:format-quote-close" />
			</button>
		</div>

		<!-- Bubble Menu (Floating Toolbar) for Inline Elements -->
		<div bind:this={bubbleMenuEl} class="bubble-menu">
			<button
				type="button"
				class:is-active={editor.isActive('bold')}
				on:click={() => editor.chain().focus().toggleBold().run()}
			>
				<Icon icon="mdi:format-bold" />
			</button>
			<button
				type="button"
				class:is-active={editor.isActive('italic')}
				on:click={() => editor.chain().focus().toggleItalic().run()}
			>
				<Icon icon="mdi:format-italic" />
			</button>
			<button
				type="button"
				class:is-active={editor.isActive('link')}
				on:click={setLink}
			>
				<Icon icon="mdi:link-variant" />
			</button>
		</div>
	{/if}

	<!-- The element where TipTap will mount the editor -->
	<div bind:this={editorEl}></div>
</div>

<style>
	.bubble-menu {
		display: flex;
		background-color: var(--color-main);
		padding: 0.2rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	button {
		@apply rounded p-2 text-main/60 transition-colors hover:bg-main/10 hover:text-main;
	}

	button.is-active {
		@apply bg-accent text-main;
	}

	/* Style for bubble menu buttons */
	.bubble-menu button {
		@apply p-2 text-light/70 hover:bg-light/20 hover:text-light;
	}

	.bubble-menu button.is-active {
		@apply text-accent;
	}
</style>