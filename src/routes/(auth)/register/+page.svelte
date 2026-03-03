<script>
    import { enhance } from "$app/forms";
    import { fade } from "svelte/transition";

    let { form } = $props();
    let isLoading = $state(false);

    function handleSubmit() {
        isLoading = true;
        return async ({ update }) => {
            isLoading = false;
            await update();
        };
    }
</script>

<div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
>
    <div
        class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100"
    >
        <div class="text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
                Vision AI
            </h1>
            <h2 class="mt-2 text-2xl font-bold text-gray-900">
                Create your account
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Already have an account?
                <a
                    href="/login"
                    class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                    Sign in here
                </a>
            </p>
        </div>

        <form class="mt-8 space-y-6" method="POST" use:enhance={handleSubmit}>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label
                        for="firstName"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >First Name</label
                    >
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autocomplete="given-name"
                        required
                        value={form?.data?.firstName || ""}
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label
                        for="lastName"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Last Name</label
                    >
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autocomplete="family-name"
                        required
                        value={form?.data?.lastName || ""}
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Email address</label
                >
                <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    value={form?.data?.email || ""}
                    class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="you@example.com"
                />
            </div>

            <div class="rounded-md shadow-sm space-y-4">
                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Password</label
                    >
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="••••••••"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                        Must be at least 8 characters
                    </p>
                </div>
                <div>
                    <label
                        for="confirmPassword"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Confirm Password</label
                    >
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {#if form?.error}
                <div class="rounded-md bg-red-50 p-4" transition:fade>
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <!-- Heroicon name: solid/x-circle -->
                            <svg
                                class="h-5 w-5 text-red-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                {form.error}
                            </h3>
                        </div>
                    </div>
                </div>
            {/if}

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isLoading}
                        <svg
                            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            ></circle>
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Creating Account...
                    {:else}
                        Create Account
                    {/if}
                </button>
            </div>

            <p class="text-xs text-center text-gray-500">
                By creating an account, you agree to our <a
                    href="/terms"
                    class="underline text-gray-400 hover:text-gray-900">Terms</a
                >
                and
                <a
                    href="/privacy"
                    class="underline text-gray-400 hover:text-gray-900"
                    >Privacy Policy</a
                >.
            </p>
        </form>
    </div>
</div>
