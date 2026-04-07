export function getToken(): string | null {
    return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
    localStorage.setItem("auth_token", token);
}

export function limparToken(): void {
    localStorage.removeItem("auth_token");
}

export async function fetchComAuth(
    input: RequestInfo,
    init: RequestInit = {}
): Promise<Response> {
    const token = getToken();

    const headers = new Headers(init.headers);
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
}