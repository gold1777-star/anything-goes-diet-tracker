// Vercel Edge Middleware — password-gates the whole site with HTTP Basic Auth.
//
// The password is read from the SITE_PASSWORD environment variable that you set
// in the Vercel dashboard (Project → Settings → Environment Variables). It is
// intentionally NOT stored in this repo, so the code can stay public safely.
//
//   SITE_USER      optional username (defaults to "agd")
//   SITE_PASSWORD  required — the site returns 503 until this is set
//
// To change the password later: update SITE_PASSWORD in Vercel and redeploy.

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default function middleware(request) {
  const expectedUser = process.env.SITE_USER || "agd";
  const expectedPass = process.env.SITE_PASSWORD;

  // Fail closed: if no password is configured, deny access rather than
  // leaving the site wide open.
  if (!expectedPass) {
    return new Response(
      "Site password not configured. Set SITE_PASSWORD in the Vercel project settings.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(6));
      const idx = decoded.indexOf(":");
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === expectedUser && pass === expectedPass) {
        return; // credentials OK — allow the request through
      }
    } catch (_) {
      // fall through to the 401 below
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Anything Goes Diet", charset="UTF-8"',
    },
  });
}
