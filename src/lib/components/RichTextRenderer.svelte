<script>
	/**
	 * Renders Rich Text content.
	 * Supports both new TipTap JSON and legacy EditorJS JSON.
	 * @type {{ content: object }}
	 */
	let { content } = $props();

	// Helper to handle TipTap text marks
	function renderTipTapText(textNode) {
		if (!textNode.text) return '';
		let html = textNode.text;
		if (textNode.marks) {
			textNode.marks.forEach(mark => {
				switch (mark.type) {
					case 'bold': html = `<strong>${html}</strong>`; break;
					case 'italic': html = `<em>${html}</em>`; break;
					case 'strike': html = `<span class="line-through">${html}</span>`; break;
					case 'code': html = `<code class="bg-main/10 rounded px-1 py-0.5 text-sm font-mono text-accent-dark">${html}</code>`; break;
					case 'link':
						const target = mark.attrs?.target ? `target="${mark.attrs.target}"` : '';
						const rel = mark.attrs?.target === '_blank' ? 'rel="noopener noreferrer"' : '';
						html = `<a href="${mark.attrs?.href || '#'}" ${target} ${rel} class="text-accent underline hover:text-accent-dark transition-colors">${html}</a>`;
						break;
				}
			});
		}
		return html;
	}

	// Helper to extract text from EditorJS List Items (which might be objects)
	function getEditorJsListItem(item) {
		if (typeof item === 'string') return item;
		if (item && typeof item === 'object') {
			return item.content || item.text || '';
		}
		return '';
	}
</script>

<div class="prose prose-lg max-w-none text-main/80 prose-headings:text-main prose-strong:text-main prose-blockquote:border-accent">
	
	{#if !content}
		<!-- Empty State -->
	{:else if content.type === 'doc' && Array.isArray(content.content)}
		<!-- NEW: TipTap Renderer -->
		{#each content.content as node}
			{@render tiptapNode(node)}
		{/each}

	{:else if content.blocks && Array.isArray(content.blocks)}
		<!-- LEGACY: EditorJS Renderer -->
		{#each content.blocks as block}
			{@render editorJsBlock(block)}
		{/each}
	{/if}

</div>

<!-- TIPTAP SNIPPET -->
{#snippet tiptapNode(node)}
	{#if node.type === 'heading'}
		{#if node.attrs?.level === 1}
			<h1>{#each node.content || [] as child}{@html renderTipTapText(child)}{/each}</h1>
		{:else if node.attrs?.level === 2}
			<h2>{#each node.content || [] as child}{@html renderTipTapText(child)}{/each}</h2>
		{:else if node.attrs?.level === 3}
			<h3>{#each node.content || [] as child}{@html renderTipTapText(child)}{/each}</h3>
		{:else if node.attrs?.level === 4}
			<h4>{#each node.content || [] as child}{@html renderTipTapText(child)}{/each}</h4>
		{/if}

	{:else if node.type === 'paragraph'}
		<p>
			{#if node.content}
				{#each node.content as child}
					{@html renderTipTapText(child)}
				{/each}
			{:else}
				<br>
			{/if}
		</p>

	{:else if node.type === 'bulletList'}
		<ul>
			{#each node.content || [] as child}
				{@render tiptapNode(child)}
			{/each}
		</ul>

	{:else if node.type === 'orderedList'}
		<ol>
			{#each node.content || [] as child}
				{@render tiptapNode(child)}
			{/each}
		</ol>

	{:else if node.type === 'listItem'}
		<li>
			{#each node.content || [] as child}
				{@render tiptapNode(child)}
			{/each}
		</li>

	{:else if node.type === 'blockquote'}
		<blockquote>
			{#each node.content || [] as child}
				{@render tiptapNode(child)}
			{/each}
		</blockquote>

	{:else if node.type === 'horizontalRule'}
		<hr class="border-main/10" />
	{/if}
{/snippet}

<!-- EDITORJS SNIPPET -->
{#snippet editorJsBlock(block)}
	{#if block.type === 'header'}
		{#if block.data.level === 1}
			<h1>{@html block.data.text}</h1>
		{:else if block.data.level === 2}
			<h2>{@html block.data.text}</h2>
		{:else if block.data.level === 3}
			<h3>{@html block.data.text}</h3>
		{:else}
			<h4>{@html block.data.text}</h4>
		{/if}

	{:else if block.type === 'paragraph'}
		<p>{@html block.data.text}</p>

	{:else if block.type === 'list'}
		{#if block.data.style === 'ordered'}
			<ol>
				{#each block.data.items as item}
					<li>{@html getEditorJsListItem(item)}</li>
				{/each}
			</ol>
		{:else}
			<ul>
				{#each block.data.items as item}
					<li>{@html getEditorJsListItem(item)}</li>
				{/each}
			</ul>
		{/if}

	{:else if block.type === 'quote'}
		<blockquote>
			<p>{@html block.data.text}</p>
			{#if block.data.caption}
				<cite>{@html block.data.caption}</cite>
			{/if}
		</blockquote>

	{:else if block.type === 'delimiter'}
		<hr class="border-main/10" />
	{/if}
{/snippet}