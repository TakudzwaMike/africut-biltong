<script>
    import { enhance } from "$app/forms";
    import { toast } from "$lib/toast-service";
    import Icon from "@iconify/svelte";
    import { confetti } from "canvas-confetti";

    let { form } = $props();
    let isSubmitting = $state(false);
    let inviteLink = $state("");

    $effect(() => {
        if (form?.success) {
            toast.success(form.message);
            inviteLink = form.inviteLink;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        }
    });

    function copyToClipboard() {
        navigator.clipboard.writeText(inviteLink);
        toast.success("Link copied to clipboard!");
    }
</script>

<div class="p-8 max-w-2xl mx-auto">
    <div class="mb-8">
        <a
            href="/_/admin/users"
            class="text-sm font-bold text-main/60 hover:text-main flex items-center gap-1 mb-4 transition-colors"
        >
            <Icon icon="mdi:arrow-left" /> Back to Users
        </a>
        <h1 class="text-3xl font-bold tracking-tight text-main">
            Invite Team Member
        </h1>
        <p class="mt-2 text-base text-main/70">
            Send an invitation link to a new staff member.
        </p>
    </div>

    {#if inviteLink}
        <div
            class="bg-accent/10 border border-accent rounded-xl p-6 mb-8 transform transition-all animate-in fade-in slide-in-from-bottom-4"
        >
            <h3 class="font-bold text-accent mb-2 flex items-center gap-2">
                <Icon icon="mdi:check-circle" /> Invite Created Successfully!
            </h3>
            <p class="text-sm text-main/80 mb-4">
                Copy the link below and send it to the invitee:
            </p>

            <div class="flex gap-2">
                <input
                    type="text"
                    readonly
                    value={inviteLink}
                    class="flex-1 bg-white border-main/10 rounded-md px-3 py-2 text-sm font-mono text-main select-all"
                />
                <button
                    onclick={copyToClipboard}
                    class="bg-main text-light px-4 py-2 rounded-md font-bold text-sm hover:bg-main/90 transition-colors flex items-center gap-2"
                >
                    <Icon icon="mdi:content-copy" /> Copy
                </button>
            </div>

            <div class="mt-6 flex justify-between items-center">
                <button
                    onclick={() => (inviteLink = "")}
                    class="text-sm font-bold text-main/60 hover:text-main"
                >
                    Invite another person
                </button>
            </div>
        </div>
    {:else}
        <form
            method="POST"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    isSubmitting = false;
                    update();
                };
            }}
            class="space-y-6 bg-white border border-main/10 rounded-xl p-8 shadow-sm"
        >
            <div>
                <label for="email" class="label">Email Address</label>
                <div class="relative mt-1">
                    <div
                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                    >
                        <Icon icon="mdi:email-outline" class="text-main/40" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="colleague@vision-ai.tech"
                        class="input pl-10"
                    />
                </div>
                <p class="mt-2 text-xs text-main/50">
                    The user will use this email to create their account.
                </p>
            </div>

            <div>
                <label for="role" class="label">Assign Role</label>
                <select id="role" name="role" class="input mt-1">
                    <option value="content_editor">Content Editor</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="admin">Admin</option>
                </select>
                <p class="mt-2 text-xs text-main/50">
                    Roles determine what sections of the panel the user can
                    access.
                </p>
            </div>

            <div class="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="w-full flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-bold text-main shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isSubmitting}
                        <Icon icon="mdi:loading" class="animate-spin" />
                        Generating Invite...
                    {:else}
                        <Icon icon="mdi:email-send" />
                        Create Invite Link
                    {/if}
                </button>
            </div>
        </form>
    {/if}
</div>

<style>
    .label {
        @apply block text-sm font-bold text-main;
    }
    .input {
        @apply block w-full rounded-md border-main/10 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent sm:text-sm;
    }
</style>
