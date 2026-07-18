import { dotnet } from './_framework/dotnet.js'

const is_browser = typeof window != "undefined";
if (!is_browser) throw new Error(`Expected to be running in a browser`);

async function showError(message, error) {
    const div = document.getElementById('out');
    if (div) {
        div.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
            <h2>Failed to start</h2>
            <p>${message}</p>
            <pre style="white-space:pre-wrap;background:#fdd;padding:10px;border-radius:4px">${error?.stack || error || 'Unknown error'}</pre>
        </div>`;
    }
}

try {
    const dotnetRuntime = await dotnet
        .withDiagnosticTracing(false)
        .withApplicationArgumentsFromQuery()
        .create();

    const config = dotnetRuntime.getConfig();

    await dotnetRuntime.runMain(config.mainAssemblyName, [globalThis.location.href]);
} catch (err) {
    console.error('Avalonia WASM failed to start:', err);
    await showError('Application failed to initialize. Check console for details.', err);
}
