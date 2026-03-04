<script>
    import { enhance } from "$app/forms";
    import { fade } from "svelte/transition";
    import { page } from "$app/stores";

    let { form } = $props();
    let isLoading = $state(false);
    let resetSuccess = $derived(
        $page.url.searchParams.get("reset") === "success",
    );

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
                Sign in to your account
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Or
                <a
                    href="/register"
                    class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                    create a new account
                </a>
            </p>
        </div>

        {#if resetSuccess}
            <div class="rounded-md bg-green-50 p-4" transition:fade>
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg
                            class="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">
                            Password reset successfully! Please sign in with
                            your new password.
                        </h3>
                    </div>
                </div>
            </div>
        {/if}

        <form class="mt-8 space-y-6" method="POST" use:enhance={handleSubmit}>
            <div class="rounded-md shadow-sm space-y-4">
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
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                        placeholder="you@example.com"
                    />
                </div>
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
                        autocomplete="current-password"
                        required
                        class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                        for="remember-me"
                        class="ml-2 block text-sm text-gray-900 cursor-pointer"
                    >
                        Remember me
                    </label>
                </div>

                <div class="text-sm">
                    <a
                        href="/forgot-password"
                        class="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Forgot your password?
                    </a>
                </div>
            </div>

            {#if form?.message}
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
                                {form.message}
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
                        Signing in...
                    {:else}
                        Sign in
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
