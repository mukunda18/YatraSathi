export type GoApiResult = {
    success: boolean;
    message: string;
    redirectTo?: string;
};

export type GoApiJSONResult<T> = GoApiResult & {
    trip?: T | null;
};

const buildProxyUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/api/go${normalizedPath}`;
};

export async function postGoApi(path: string): Promise<GoApiResult> {
    try {
        const response = await fetch(buildProxyUrl(path), {
            method: "POST",
            credentials: "include",
        });

        const payload = await response.json().catch(() => null) as GoApiResult | null;
        if (!payload) {
            return { success: false, message: "Invalid response from backend" };
        }
        return payload;
    } catch {
        return { success: false, message: "Unable to reach backend service" };
    }
}

export async function getGoApi<T>(path: string): Promise<GoApiJSONResult<T>> {
    try {
        const response = await fetch(buildProxyUrl(path), {
            method: "GET",
            credentials: "include",
        });

        const payload = await response.json().catch(() => null) as GoApiJSONResult<T> | null;
        if (!payload) {
            return { success: false, message: "Invalid response from backend", trip: null };
        }
        return payload;
    } catch {
        return { success: false, message: "Unable to reach backend service", trip: null };
    }
}
