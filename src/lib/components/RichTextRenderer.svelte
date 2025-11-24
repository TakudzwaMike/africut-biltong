<script>
	/**
	 * Renders TipTap JSON content.
	 * @type {{ content: object }}
	 */
	let { content } = $props();

	// Helper to handle text marks (bold, italic, link, etc.)
	function renderText(textNode) {
		if (!textNode.text) return '';
		
		let html = textNode.text;
		
		// Marks are applied in order
		if (textNode.marks) {
			textNode.marks.forEach(mark => {
				switch (mark.type) {
					case 'bold':
						html = `<strong>${html}</strong>`;
						break;
					case 'italic':
						html = `<em>${html}</em>`;
						break;
					case 'strike':
						html = `<span class="line-through">${html}</span>`;
						break;
					case 'code':
						html = `<code class="bg-main/10 rounded px-1 py-0.5 text-sm font-mono text-accent-dark">${html}</code>`;
						break;
					case 'link':
						const target = mark.attrs.target ? `target="${mark.attrs.target}"` : '';
						const rel = mark.attrs.target === '_blank' ? 'rel="noopener noreferrer"' : '';
						html = `<a href="${mark.attrs.href}" ${target} ${rel} class="text-accent underline hover:text-accent-dark transition-colors">${html}</a>`;
						break;
				}
			});
		}
		
		return html;
	}
</script>

{#if content && content.type === 'doc'}
	<div class="prose prose-lg max-w-none text-main/80 prose-headings:text-main prose-strong:text-main prose-blockquote:border-accent">
		{#each content.content as node}
			{@render nodeRenderer(node)}
		{/each}
	</div>
{/if}

{#snippet nodeRenderer(node)}
	{#if node.type === 'heading'}
		<!-- Headings -->
		{#if node.attrs.level === 1}
			<h1>{#each node.content || [] as child}{@html renderText(child)}{/each}</h1>
		{:else if node.attrs.level === 2}
			<h2>{#each node.content || [] as child}{@html renderText(child)}{/each}</h2>
		{:else if node.attrs.level === 3}
			<h3>{#each node.content || [] as child}{@html renderText(child)}{/each}</h3>
		{:else if node.attrs.level === 4}
			<h4>{#each node.content || [] as child}{@html renderText(child)}{/each}</h4>
		{/if}

	{:else if node.type === 'paragraph'}
		<!-- Paragraph -->
		<p>
			{#if node.content}
				{#each node.content as child}
					{@html renderText(child)}
				{/each}
			{:else}
				<br>
			{/if}
		</p>

	{:else if node.type === 'bulletList'}
		<!-- Unordered List -->
		<ul>
			{#each node.content || [] as child}
				{@render nodeRenderer(child)}
			{/each}
		</ul>

	{:else if node.type === 'orderedList'}
		<!-- Ordered List -->
		<ol>
			{#each node.content || [] as child}
				{@render nodeRenderer(child)}
			{/each}
		</ol>

	{:else if node.type === 'listItem'}
		<!-- List Item -->
		<li>
			{#each node.content || [] as child}
				{@render nodeRenderer(child)}
			{/each}
		</li>

	{:else if node.type === 'blockquote'}
		<!-- Blockquote -->
		<blockquote>
			{#each node.content || [] as child}
				{@render nodeRenderer(child)}
			{/each}
		</blockquote>

	{:else if node.type === 'horizontalRule'}
		<hr class="border-main/10" />

	{/if}
{/snippet}