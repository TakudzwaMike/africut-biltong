<script>
    import "../../../app.css";
    let { children } = $props();
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="true"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

{@render children()}
