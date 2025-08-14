import { writable } from 'svelte/store';

export const toasts = writable([]);

/**
 * Adds a new toast to the list.
 * @param {object} options - The toast options.
 * @param {'success' | 'error' | 'info'} [options.type='info'] - The type of toast.
 * @param {string} options.message - The message to display.
 * @param {number} [options.duration=3000] - How long the toast should be visible.
 */
export function addToast({ type = 'info', message, duration = 3000 }) {
	const id = Math.random().toString(36).slice(2, 9);

	// Add the new toast to the store
	toasts.update((all) => [{ id, type, message }, ...all]);

	// Set a timer to automatically remove it
	if (duration > 0) {
		setTimeout(() => removeToast(id), duration);
	}

	return id;
}

/**
 * Removes a toast from the list by its ID.
 * @param {string} id - The ID of the toast to remove.
 */
export function removeToast(id) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}

// Create a convenient export for easy calling
export const toast = {
	success: (message, options) => addToast({ type: 'success', message, ...options }),
	error: (message, options) => addToast({ type: 'error', message, ...options }),
	info: (message, options) => addToast({ type: 'info', message, ...options })
};