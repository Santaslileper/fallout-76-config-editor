export async function checkBackendStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        return data.status === 'online';
    } catch (e) {
        return false;
    }
}

export async function loadConfigFromBackend() {
    const response = await fetch('/api/load');
    return await response.json();
}

export async function saveConfigToBackend(data) {
    const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

export async function launchGameCommand() {
    const response = await fetch('/api/launch', { method: 'POST' });
    return await response.json();
}

export async function killGameCommand() {
    await fetch('/api/kill', { method: 'POST' });
}
