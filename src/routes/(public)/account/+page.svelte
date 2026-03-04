<script>
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import SubmitButton from "$lib/components/SubmitButton.svelte";

    let { form, data } = $props();
    const user = $page.data.user;
    const profileMedia = data.profileMedia;
    let isEditing = $state(false);
    let isSubmitting = $state(false);

    // Local state for form inputs
    let formData = $state({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
    });

    let previewUrl = $state(
        profileMedia?.displayUrl ||
            profileMedia?.originalUrl ||
            `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=f1f5f9&color=0f172a`,
    );

    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            previewUrl = URL.createObjectURL(file);
        }
    }
</script>

<svelte:head>
    <title>My Profile | Vision AI</title>
</svelte:head>

<div class="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
    <div
        class="flex items-center justify-between mb-8 border-b border-slate-100 pb-4"
    >
        <h2 class="text-2xl font-bold text-main">Profile Details</h2>
        {#if !isEditing}
            <button
                onclick={() => (isEditing = true)}
                class="text-sm font-bold text-accent hover:underline"
                >Edit</button
            >
        {/if}
    </div>

    {#if form?.success}
        <div
            class="mb-6 rounded-md bg-green-50 p-4 text-sm font-bold text-green-700 border border-green-200"
        >
            Profile updated successfully!
        </div>
    {/if}

    {#if !isEditing}
        <div class="space-y-6">
            <div class="flex items-center gap-6 mb-8">
                <img
                    src={previewUrl}
                    alt="Profile"
                    class="h-24 w-24 rounded-full object-cover ring-2 ring-slate-100"
                />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <span
                        class="block text-xs font-bold uppercase tracking-wider text-main/40"
                        >Name</span
                    >
                    <span class="text-lg font-medium text-main"
                        >{user?.firstName} {user?.lastName}</span
                    >
                </div>
                <div>
                    <span
                        class="block text-xs font-bold uppercase tracking-wider text-main/40"
                        >Email</span
                    >
                    <span class="text-lg font-medium text-main"
                        >{user?.email}</span
                    >
                </div>
            </div>
        </div>
    {:else}
        <form
            method="POST"
            action="?/updateProfile"
            enctype="multipart/form-data"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    await update();
                    isSubmitting = false;
                    isEditing = false;
                };
            }}
            class="space-y-6"
        >
            <div class="flex items-center gap-6 mb-8">
                <img
                    src={previewUrl}
                    alt="Profile Preview"
                    class="h-24 w-24 rounded-full object-cover ring-2 ring-accent/20"
                />
                <div>
                    <label
                        for="profileImage"
                        class="cursor-pointer rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-main shadow-sm hover:border-accent inline-block"
                    >
                        Change Photo
                    </label>
                    <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept="image/*"
                        class="hidden"
                        onchange={handleImageSelect}
                    />
                    <p class="mt-2 text-xs text-main/50">
                        JPG, PNG or WEBP. Max 5MB.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label class="block text-sm font-bold text-main/80 mb-2"
                        >First Name</label
                    >
                    <input
                        type="text"
                        name="firstName"
                        bind:value={formData.firstName}
                        class="w-full rounded-md border-slate-200 bg-slate-50 px-4 py-2 text-main focus:border-accent focus:ring-accent"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-main/80 mb-2"
                        >Last Name</label
                    >
                    <input
                        type="text"
                        name="lastName"
                        bind:value={formData.lastName}
                        class="w-full rounded-md border-slate-200 bg-slate-50 px-4 py-2 text-main focus:border-accent focus:ring-accent"
                        required
                    />
                </div>
            </div>

            <div>
                <label class="block text-sm font-bold text-main/80 mb-2"
                    >Email</label
                >
                <input
                    type="email"
                    name="email"
                    bind:value={formData.email}
                    class="w-full rounded-md border-slate-200 bg-slate-50 px-4 py-2 text-main focus:border-accent focus:ring-accent"
                    required
                />
            </div>

            <div class="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onclick={() => (isEditing = false)}
                    class="text-sm font-bold text-main/60 hover:text-main"
                    >Cancel</button
                >
                <SubmitButton loading={isSubmitting} class="bg-accent px-6 py-2"
                    >Save Changes</SubmitButton
                >
            </div>
        </form>
    {/if}
</div>
