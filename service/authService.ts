const API_URL = "/api/auth";

export async function signup(name: string, email: string, password: string, phone: string) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password,
            phone,
        }),
    });
    const data = await response.json();
    return data;
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });
    const data = await response.json();
    return data;
}


