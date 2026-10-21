import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendUrl, SESSION_COOKIE } from "@/lib/server";

const allowedPath = /^(auth\/(login|register|logout|me)|workshops(?:\/[a-fA-F0-9]{24})?|registrations(?:\/[a-fA-F0-9]{24})?)$/;
const isMutation = (method: string) => !["GET", "HEAD"].includes(method);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  if (!allowedPath.test(path)) {
    return NextResponse.json({ success: false, error: "Route not found" }, { status: 404 });
  }

  // Browser writes must originate from this site; cookie auth must not create a CSRF path.
  const origin = request.headers.get("origin");
  // Next can normalize nextUrl's hostname to localhost. Host retains the browser's
  // destination (e.g. 127.0.0.1); do not trust arbitrary forwarded-host headers.
  const expectedOrigin = `${request.nextUrl.protocol}//${request.headers.get("host")}`;
  if ((isMutation(request.method) || path === "auth/logout") && origin !== expectedOrigin) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (path === "auth/logout") {
    // Upstream bearer JWTs are stateless: logout is discarding our local credential.
    jar.delete(SESSION_COOKIE);
    return NextResponse.json({ success: true, data: {} });
  }
  try {
    const upstream = await fetch(`${backendUrl()}/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isMutation(request.method) ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const body = await upstream.json();
    if (upstream.ok && ["auth/login", "auth/register"].includes(path)) {
      const { token: credential, ...user } = body.data;
      jar.set(SESSION_COOKIE, credential, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
        path: "/",
        // Session cookie: backend JWT expiry is still checked on every protected call.
      });
      body.data = user;
    }
    if (upstream.status === 401 && token) jar.delete(SESSION_COOKIE);
    // Don't forward upstream Set-Cookie, stack traces or internal response headers.
    delete body.stack;
    if (!upstream.ok && /E11000.*email/i.test(String(body.error))) {
      return NextResponse.json({ success: false, error: "This email is already registered. Please log in." }, { status: 409 });
    }
    if (upstream.status >= 500) body.error = "The workshop service could not complete this request. Please try again shortly.";
    return NextResponse.json(body, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "The workshop service is unavailable. Please try again shortly." }, { status: 503 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
