export class OAuthClient {
  constructor(config) {
    this.clientConfig = config;
  }

  authorizeURL({ redirect_uri, scope, state }) {
    const { tokenHost, authorizePath } = this.clientConfig.target;
    const { id } = this.clientConfig;

    return `${tokenHost}${authorizePath}?response_type=code&client_id=${id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  }

  async getToken({ code, redirect_uri }) {
    const { tokenHost, tokenPath } = this.clientConfig.target;
    const { id, secret } = this.clientConfig;

    const response = await fetch(`${tokenHost}${tokenPath}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: id,
        client_secret: secret,
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub token exchange failed: ${response.status} ${text}`);
    }

    const json = await response.json();
    if (json.error || !json.access_token) {
      throw new Error(
        json.error_description || json.error || "Missing access_token"
      );
    }
    return json.access_token;
  }
}
