const { sendJson } = require("./_cors");

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

async function supabase(path, options = {}) {
  const url = `${env("SUPABASE_URL").replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
      Authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const error = new Error("Supabase request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function requireAdmin(req, res) {
  const expected = env("ADMIN_PUSH_TOKEN");
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || token !== expected) {
    sendJson(res, 401, { ok: false, error: "admin_token_invalid" });
    return false;
  }
  return true;
}

module.exports = { env, requireAdmin, supabase };
