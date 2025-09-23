/**
 * Renders TipTap's JSON output to a basic HTML string.
 * Supports paragraphs, headings, bold, italic, lists, blockquotes, links, and more.
 * @param {object | null | undefined} richText
 * @returns {string}
 */
function renderRichTextToHtml(richText) {
	if (!richText?.content) return '';

	const renderNode = (node) => {
		const textContent = node.content?.map(renderNode).join('') || '';

		switch (node.type) {
			case 'paragraph':
				return `<p>${textContent || '<br>'}</p>`;
			case 'heading':
				const level = node.attrs?.level || 1;
				return `<h${level}>${textContent}</h${level}>`;
			case 'bulletList':
				return `<ul>${textContent}</ul>`;
			case 'orderedList':
				return `<ol>${textContent}</ol>`;
			case 'listItem':
				return `<li>${textContent}</li>`;
			case 'blockquote':
				return `<blockquote>${textContent}</blockquote>`;
			case 'horizontalRule':
				return `<hr />`;
			case 'hardBreak':
				return `<br />`;
			case 'codeBlock':
				return `<pre><code>${textContent}</code></pre>`;
			case 'bold':
				return `<strong>${textContent}</strong>`;
			case 'italic':
				return `<em>${textContent}</em>`;
			case 'underline':
				return `<u>${textContent}</u>`;
			case 'strike':
				return `<s>${textContent}</s>`;
			case 'link':
				const href = node.attrs?.href || '#';
				const target = node.attrs?.target ? ` target="${node.attrs.target}"` : '';
				return `<a href="${href}"${target}>${textContent}</a>`;
			case 'text':
				return escapeHtml(node.text || '');
			default:
				// For unsupported or unknown node types
				return textContent;
		}
	};

	return richText.content.map(renderNode).join('');
}

/**
 * Escapes basic HTML characters in text nodes to prevent injection.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

