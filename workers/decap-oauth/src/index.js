import { OAuthClient } from "./oauth.js";

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function createOAuth(env) {
  return new OAuthClient({
    id: env.GITHUB_OAUTH_ID,
    secret: env.GITHUB_OAUTH_SECRET,
    target: {
      tokenHost: "https://github.com",
      tokenPath: "/login/oauth/access_token",
      authorizePath: "/login/oauth/authorize",
    },
  });
}

function repoScope(env) {
  const isPrivate =
    env.GITHUB_REPO_PRIVATE !== undefined && env.GITHUB_REPO_PRIVATE !== "0";
  return isPrivate ? "repo,user" : "public_repo,user";
}

async function handleAuth(url, env) {
  const provider = url.searchParams.get("provider");
  if (provider !== "github") {
    return new Response("Invalid provider", { status: 400 });
  }

  const oauth2 = createOAuth(env);
  const redirectUri = `https://${url.hostname}/callback?provider=github`;
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: redirectUri,
    scope: repoScope(env),
    state: randomHex(4),
  });

  return Response.redirect(authorizationUri, 302);
}

function callbackScriptResponse(status, token) {
  const payload = JSON.stringify({ token, provider: "github" });
  const message = `authorization:github:${status}:${payload}`;

  return new Response(
    `<!doctype html>
<html>
  <body>
    <p id="status">Authorizing Decap CMS…</p>
    <script>
      (function () {
        var authMessage = ${JSON.stringify(message)};

        function complete(origin) {
          if (!window.opener) {
            document.getElementById("status").textContent =
              "Authorization complete. Close this tab and return to the CMS.";
            return;
          }

          window.opener.postMessage(authMessage, origin || "*");
          window.close();
        }

        // Decap CMS sends "authorizing:github" to this popup; reply with the token.
        window.addEventListener("message", function (event) {
          if (event.data === "authorizing:github") {
            complete(event.origin);
          }
        });

        // Legacy handshake used by some OAuth proxies.
        if (window.opener) {
          window.opener.postMessage("authorizing:github", "*");
          window.addEventListener(
            "message",
            function (event) {
              complete(event.origin);
            },
            { once: true }
          );
        }
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
    }
  );
}

async function handleCallback(url, env) {
  const provider = url.searchParams.get("provider");
  if (provider !== "github") {
    return new Response("Invalid provider", { status: 400 });
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  try {
    const oauth2 = createOAuth(env);
    const redirectUri = `https://${url.hostname}/callback?provider=github`;
    const accessToken = await oauth2.getToken({
      code,
      redirect_uri: redirectUri,
    });
    return callbackScriptResponse("success", accessToken);
  } catch (error) {
    return callbackScriptResponse("error", error.message);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }

    return new Response("Decap CMS OAuth proxy is running.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
