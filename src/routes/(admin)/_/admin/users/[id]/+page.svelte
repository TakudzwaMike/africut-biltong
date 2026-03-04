<script>
    import { enhance } from "$app/forms";
    import SubmitButton from "$lib/components/SubmitButton.svelte";
    import Icon from "@iconify/svelte";

    let { form, data } = $props();
    const targetUser = data.targetUser;
    const profileMedia = data.profileMedia;
    let isSubmitting = $state(false);

    let previewUrl = $state(
        profileMedia?.displayUrl ||
            profileMedia?.originalUrl ||
            `https://ui-avatars.com/api/?name=${targetUser?.firstName}+${targetUser?.lastName}&background=f1f5f9&color=0f172a`,
    );

    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            previewUrl = URL.createObjectURL(file);
        }
    }
</script>

<div class="p-8">
    <div class="mb-8">
        <a
            href="/_/admin/users"
            class="flex items-center gap-1 text-sm font-bold text-main/60 hover:text-main mb-4 transition-colors"
        >
            <Icon icon="mdi:arrow-left" /> Back to Users
        </a>
        <h1 class="text-3xl font-bold tracking-tight text-main">Edit User</h1>
        <p class="mt-2 text-base text-main/70">
            Manage profile details and access roles for {targetUser.email}.
        </p>
    </div>

    {#if form?.success}
        <div
            class="mb-6 rounded-md bg-green-50 p-4 text-sm font-bold text-green-700 border border-green-200"
        >
            User profile updated successfully!
        </div>
    {/if}

    <div
        class="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 max-w-3xl"
    >
        <form
            method="POST"
            action="?/updateProfile"
            enctype="multipart/form-data"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    await update({ reset: false });
                    isSubmitting = false;
                };
            }}
            class="space-y-8"
        >
            <div class="flex items-center gap-6 pb-6 border-b border-slate-100">
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
                        value={targetUser.firstName || ""}
                        class="w-full rounded-md border-main/20 py-2 focus:border-accent focus:ring-accent"
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-main/80 mb-2"
                        >Last Name</label
                    >
                    <input
                        type="text"
                        name="lastName"
                        value={targetUser.lastName || ""}
                        class="w-full rounded-md border-main/20 py-2 focus:border-accent focus:ring-accent"
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-main/80 mb-2"
                        >Email Address</label
                    >
                    <input
                        type="email"
                        name="email"
                        required
                        value={targetUser.email}
                        class="w-full rounded-md border-main/20 py-2 focus:border-accent focus:ring-accent"
                    />
                </div>
                <div>
                    <label class="block text-sm font-bold text-main/80 mb-2"
                        >Access Role</label
                    >
                    <select
                        name="role"
                        value={targetUser.role}
                        class="w-full rounded-md border-main/20 py-2 focus:border-accent focus:ring-accent uppercase text-xs font-bold tracking-wide cursor-pointer"
                    >
                        <optgroup label="Staff">
                            <option value="admin">Admin</option>
                            <option value="store_manager">Store Manager</option>
                            <option value="content_editor"
                                >Content Editor</option
                            >
                        </optgroup>
                        <optgroup label="Users">
                            <option value="customer">Customer</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-100 flex justify-end">
                <SubmitButton
                    loading={isSubmitting}
                    defaultText="Save Changes"
                    loadingText="Saving..."
                    className="bg-accent text-main font-bold py-2.5 px-6 rounded-md hover:bg-accent/90 transition-colors shadow-sm"
                />
            </div>
        </form>
    </div>
</div>
