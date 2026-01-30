import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['src/routes/**/*.server.js', 'src/routes/**/*.server.ts'],
		rules: {
			'no-restricted-imports': ['error', {
				patterns: [{
					group: ['$lib/server/db', '$lib/server/db/schema*'],
					message: 'Controllers must not directly import the database. Use Services instead following the three-tier architecture (Controller → Service → Repository).'
				}, {
					group: ['$lib/server/repositories/*'],
					message: 'Controllers must not directly import Repositories. Use Services instead following the three-tier architecture (Controller → Service → Repository).'
				}]
			}]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js'],
		languageOptions: { parserOptions: { svelteConfig } }
	}
];
