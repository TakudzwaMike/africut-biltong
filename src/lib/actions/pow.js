/**
 * A Svelte Action to protect forms with Proof-of-Work.
 * 
 * Usage: <form use:pow on:pow-verified={() => ...}>
 */
export function pow(node) {
	let worker;
	let verified = false;
	let working = false;

	// Create the worker code as a Blob so we don't need a separate file
	const workerCode = `
		self.onmessage = async (e) => {
			const { salt, difficulty } = e.data;
			const encoder = new TextEncoder();
			const prefix = "0".repeat(difficulty);
			let nonce = 0;

			while (true) {
				const input = encoder.encode(salt + nonce);
				const hashBuffer = await crypto.subtle.digest('SHA-256', input);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

				if (hashHex.startsWith(prefix)) {
					self.postMessage({ nonce });
					break;
				}
				nonce++;
			}
		};
	`;

	const startSolver = async () => {
		if (verified || working) return;
		working = true;

		// 1. Dispatch generic 'loading' event (e.g. to disable submit button)
		node.dispatchEvent(new CustomEvent('pow-solving'));

		try {
			// 2. Fetch Challenge
			const res = await fetch('/api/challenge');
			const { salt, difficulty } = await res.json();

			// 3. Initialize Worker
			const blob = new Blob([workerCode], { type: 'application/javascript' });
			worker = new Worker(URL.createObjectURL(blob));

			// 4. Listen for result
			worker.onmessage = (e) => {
				const { nonce } = e.data;
				
				// 5. Inject Hidden Fields
				addHiddenInput(node, 'pow_salt', salt);
				addHiddenInput(node, 'pow_nonce', nonce);

				verified = true;
				working = false;
				
				// 6. Dispatch success
				node.dispatchEvent(new CustomEvent('pow-verified'));
				worker.terminate();
			};

			// 7. Start Work
			worker.postMessage({ salt, difficulty });

		} catch (error) {
			console.error('PoW Failed:', error);
			working = false;
		}
	};

	const addHiddenInput = (form, name, value) => {
		let input = form.querySelector(`input[name="${name}"]`);
		if (!input) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = name;
			form.appendChild(input);
		}
		input.value = value;
	};

	const handleInteraction = () => startSolver();

	node.addEventListener('focusin', handleInteraction);
	node.addEventListener('click', handleInteraction);

	return {
		destroy() {
			node.removeEventListener('focusin', handleInteraction);
			node.removeEventListener('click', handleInteraction);
			if (worker) worker.terminate();
		}
	};
}