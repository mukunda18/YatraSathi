import { NextRequest, NextResponse } from "next/server";

const getGoBackendBaseUrl = () => {
    const value = process.env.NEXT_PUBLIC_GO_BACKEND_URL;
    return value ? value.replace(/\/+$/, "") : "";
};

async function proxyToGoBackend(
    request: NextRequest,
    params: { path: string[] }
) {
    const goBackendBaseUrl = getGoBackendBaseUrl();
    if (!goBackendBaseUrl) {
        return NextResponse.json(
            { success: false, message: "Go backend URL is not configured" },
            { status: 500 }
        );
    }

    const token = request.cookies.get("yatrasathi")?.value;
    const forwardPath = `/${params.path.join("/")}`;
    const targetUrl = `${goBackendBaseUrl}${forwardPath}${request.nextUrl.search}`;

    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) {
        headers.set("Content-Type", contentType);
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const init: RequestInit = {
        method: request.method,
        headers,
        cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = await request.text();
    }

    try {
        const response = await fetch(targetUrl, init);
        const text = await response.text();
        const contentTypeHeader = response.headers.get("content-type") || "application/json";

        return new NextResponse(text, {
            status: response.status,
            headers: {
                "Content-Type": contentTypeHeader,
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Unable to reach backend service" },
            { status: 502 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyToGoBackend(request, await params);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyToGoBackend(request, await params);
}

