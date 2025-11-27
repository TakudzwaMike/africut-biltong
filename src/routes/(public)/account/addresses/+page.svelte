<script>
    import { enhance } from '$app/forms';
    import { fade, slide } from 'svelte/transition';
    import SubmitButton from '$lib/components/SubmitButton.svelte';
    import Icon from '@iconify/svelte';

    let { data, form } = $props();
    // data.addresses automatically updates after a successful form action
    let addresses = $derived(data.addresses || []);

    let mode = $state('list'); // 'list', 'add', 'edit'
    let activeAddress = $state(null);
    let isSubmitting = $state(false);

    const emptyForm = {
        id: '', label: 'Home', firstName: '', lastName: '',
        address: '', city: '', state: '', zipCode: '',
        country: 'Zimbabwe', isDefault: false
    };

    function startAdd() {
        activeAddress = { ...emptyForm };
        mode = 'add';
    }

    function startEdit(addr) {
        activeAddress = { ...addr };
        mode = 'edit';
    }

    function cancel() {
        mode = 'list';
        activeAddress = null;
    }

    // Handle the form submission result
    function handleSave() {
        isSubmitting = true;
        return async ({ update, result }) => {
            await update();
            isSubmitting = false;
            if (result.type === 'success') {
                mode = 'list';
            }
        };
    }
</script>

<svelte:head>
	<title>Address Book | Vision AI</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 class="text-2xl font-bold text-main">Addresses</h2>
        {#if mode === 'list'}
            <button onclick={startAdd} class="text-sm font-bold text-accent hover:underline flex items-center gap-1">
                <Icon icon="mdi:plus" /> Add New
            </button>
        {/if}
    </div>

    {#if mode === 'list'}
        {#if addresses.length === 0}
             <div class="rounded-xl bg-slate-50 p-12 text-center border border-dashed border-slate-300" in:fade>
                <p class="text-main/60 mb-4">You haven't saved any addresses yet.</p>
                <button onclick={startAdd} class="rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-main shadow-sm hover:border-accent">
                    Add Address
                </button>
            </div>
        {:else}
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2" in:fade>
                {#each addresses as addr}
                    <div class="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md">
                        {#if addr.isDefault}
                            <span class="absolute right-4 top-4 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Default</span>
                        {/if}
                        
                        <div class="flex items-center gap-2 mb-4">
                            <Icon icon="mdi:map-marker" class="text-main/40" />
                            <h3 class="font-bold text-main">{addr.label}</h3>
                        </div>

                        <div class="text-sm text-main/70 mb-6 leading-relaxed">
                            <p class="font-bold text-main">{addr.firstName} {addr.lastName}</p>
                            <p>{addr.address}</p>
                            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p>{addr.country}</p>
                        </div>

                        <div class="flex items-center gap-4 border-t border-slate-50 pt-4">
                            <button onclick={() => startEdit(addr)} class="text-xs font-bold text-main hover:text-accent">Edit</button>
                            
                            <!-- Delete Form -->
                            <form method="POST" action="?/delete" use:enhance>
                                <input type="hidden" name="id" value={addr.id} />
                                <button type="submit" class="text-xs font-bold text-red-500 hover:text-red-700" onclick={(e) => !confirm('Delete this address?') && e.preventDefault()}>
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <!-- Add/Edit Form -->
        <div class="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5" transition:slide>
            <h3 class="text-lg font-bold text-main mb-6">{mode === 'add' ? 'Add New Address' : 'Edit Address'}</h3>
            
            <form method="POST" action="?/save" use:enhance={handleSave} class="space-y-6">
                <input type="hidden" name="id" value={activeAddress.id || ''} />

                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-bold text-main/60 mb-1">Label</label>
                        <input type="text" name="label" bind:value={activeAddress.label} placeholder="e.g. Home" required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                    <div class="md:col-span-2 grid grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-bold text-main/60 mb-1">First Name</label>
                            <input type="text" name="firstName" bind:value={activeAddress.firstName} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-main/60 mb-1">Last Name</label>
                            <input type="text" name="lastName" bind:value={activeAddress.lastName} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-main/60 mb-1">Address</label>
                        <input type="text" name="address" bind:value={activeAddress.address} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-main/60 mb-1">City</label>
                        <input type="text" name="city" bind:value={activeAddress.city} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-main/60 mb-1">State/Province</label>
                        <input type="text" name="state" bind:value={activeAddress.state} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-main/60 mb-1">Zip Code</label>
                        <input type="text" name="zipCode" bind:value={activeAddress.zipCode} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-main/60 mb-1">Country</label>
                        <input type="text" name="country" bind:value={activeAddress.country} required class="w-full rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-accent focus:ring-accent" />
                    </div>
                </div>

                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isDefault" checked={activeAddress.isDefault} class="rounded text-accent focus:ring-accent" />
                    <span class="text-sm font-bold text-main">Set as default shipping address</span>
                </label>

                {#if form?.message}
                    <p class="text-sm font-bold text-red-500">{form.message}</p>
                {/if}

                <div class="flex justify-end gap-4 border-t border-slate-100 pt-6">
                    <button type="button" onclick={cancel} class="text-sm font-bold text-main/60 hover:text-main">Cancel</button>
                    <SubmitButton loading={isSubmitting} class="bg-accent px-6 py-2">Save Address</SubmitButton>
                </div>
            </form>
        </div>
    {/if}
</div>