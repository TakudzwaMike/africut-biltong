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
                Forgot your password?
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your
                password.
            </p>
        </div>

        {#if form?.success}
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
                            Check your email
                        </h3>
                        <p class="mt-1 text-sm text-green-700">
                            If an account exists with that email, we've sent a
                            password reset link. It will expire in 1 hour.
                        </p>
                    </div>
                </div>
            </div>
        {:else}
            <form
                class="mt-8 space-y-6"
                method="POST"
                use:enhance={handleSubmit}
            >
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

                {#if form?.message}
                    <div class="rounded-md bg-red-50 p-4" transition:fade>
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg
                                    class="h-5 w-5 text-red-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
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
                            Sending...
                        {:else}
                            Send reset link
                        {/if}
                    </button>
                </div>
            </form>
        {/if}

        <div class="text-center">
            <a
                href="/login"
                class="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
                ← Back to sign in
            </a>
        </div>
    </div>
</div>
