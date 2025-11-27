<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import Icon from '@iconify/svelte';

	let { form } = $props();
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
		} else if (form?.message) {
			toast.error(form.message);
		}
	});
</script>

<div class="mx-auto max-w-3xl p-8">
	<div class="mb-8">
		<div class="flex items-center gap-4">
			<a href="/_/admin/products" class="text-main/60 hover:text-main">
				<Icon icon="mdi:arrow-left" width="24" />
			</a>
			<h1 class="text-3xl font-bold tracking-tight text-main">Import Products</h1>
		</div>
		<p class="mt-2 text-base text-main/70">
			Bulk update or create products using a CSV file.
		</p>
	</div>

	<div class="rounded-xl border border-main/10 bg-white p-8 shadow-sm">
		<div class="mb-8 rounded-md bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200">
			<p class="font-bold flex items-center gap-2">
				<Icon icon="mdi:information" />
				Instructions
			</p>
			<ul class="mt-2 list-disc pl-5 space-y-1">
				<li>Your CSV should match the export format.</li>
				<li><strong>Slug</strong> is used to identify Products.</li>
				<li><strong>SKU</strong> (or Variant Name) is used to identify Variants.</li>
				<li>Prices must be in <strong>Cents</strong> (e.g., 1000 = $10.00).</li>
				<li>Leaving an ID field empty will attempt to create a new record.</li>
			</ul>
			<div class="mt-4">
				<a href="/_/admin/products/export" class="text-blue-600 underline font-bold hover:text-blue-800">
					Download Template / Current Export
				</a>
			</div>
		</div>

		<form 
			method="POST" 
			enctype="multipart/form-data" 
			use:enhance={() => {
				isSubmitting = true;
				return ({ update }) => {
					isSubmitting = false;
					update();
				};
			}}
			class="space-y-6"
		>
			<div>
				<label for="csvFile" class="mb-2 block font-bold text-main">Select CSV File</label>
				<input 
					type="file" 
					id="csvFile" 
					name="csvFile" 
					accept=".csv"
					required
					class="w-full rounded-md border border-main/20 bg-main/5 p-2 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:font-bold file:text-main hover:file:bg-accent/80 cursor-pointer"
				/>
			</div>

			<div class="flex justify-end">
				<SubmitButton loading={isSubmitting} class="bg-accent px-8 py-3">
					Start Import
				</SubmitButton>
			</div>
		</form>
	</div>
</div>
