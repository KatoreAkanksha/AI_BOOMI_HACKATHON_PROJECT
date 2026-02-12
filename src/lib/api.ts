export const apiFetch = async (
    url: string,
    options: RequestInit = {}
) => {
    const token = localStorage.getItem("token");

    const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : '');

    const res = await fetch(`${apiBase}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    // 🔴 AUTH FAILURE = HARD STOP & DATA PURGE
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("serenity-user");
        localStorage.removeItem("app_lifecycle_id"); // Force fresh lifecycle on next load
        window.location.href = "/"; // Instant clean redirect
        throw new Error("AUTH_EXPIRED");
    }

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error("INVALID_RESPONSE");
    }

    if (!res.ok) {
        throw new Error(data?.error || "REQUEST_FAILED");
    }

    return data;
};
