<script>
    import { enhance } from "$app/forms";
    import { toast } from "$lib/toast-service";
    import Icon from "@iconify/svelte";

    let { form, data } = $props();
    let isSubmitting = $state(false);

    $effect(() => {
        if (form?.message && !form.success) {
            toast.error(form.message);
        }
    });
</script>

<div class="flex min-h-screen items-center justify-center bg-light p-6">
    <div class="w-full max-w-md">
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold tracking-tight text-main">
                Complete Your Account
            </h1>
            <p class="mt-2 text-main/60">
                Set up your profile to join the Vision AI team.
            </p>
        </div>

        <form
            method="POST"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    isSubmitting = false;
                    update();
                };
            }}
            class="space-y-4 rounded-2xl border border-main/10 bg-white p-8 shadow-sm"
        >
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="firstName" class="label">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        class="input"
                        placeholder="Jane"
                        value={form?.data?.firstName ?? ""}
                    />
                </div>
                <div>
                    <label for="lastName" class="label">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        class="input"
                        placeholder="Doe"
                        value={form?.data?.lastName ?? ""}
                    />
                </div>
            </div>

            <div>
                <label for="username" class="label">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    minlength="3"
                    class="input"
                    placeholder="janedoe"
                    value={form?.data?.username ?? ""}
                />
            </div>

            <div>
                <label for="password" class="label">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minlength="6"
                    class="input"
                    placeholder="••••••••"
                />
            </div>

            <div class="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="flex w-full items-center justify-center gap-2 rounded-md bg-main px-4 py-3 font-bold text-light shadow-sm transition hover:bg-main/90 disabled:opacity-50"
                >
                    {#if isSubmitting}
                        <Icon icon="mdi:loading" class="animate-spin" />
                        Creating Account...
                    {:else}
                        Join Team
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    @reference "../../../../app.css";
    .label {
        @apply mb-1 block text-sm font-bold text-main/80;
    }
    .input {
        @apply w-full rounded-md border-main/10 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent sm:text-sm;
    }
</style>
