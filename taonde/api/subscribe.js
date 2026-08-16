const { sendJson, setCors } = require("./_cors");
const { readJson } = require("./_body");
const { supabase } = require("./_supabase");

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.end();
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });

  try {
    const body = await readJson(req);
    if (!body.subscription?.endpoint) {
      return sendJson(res, 400, { ok: false, error: "subscription_required" });
    }

    const payload = {
      endpoint: body.subscription.endpoint,
      subscription: body.subscription,
      city: body.city || "Pinheiros",
      state: body.state || "ES",
      audience: body.audience || "todos",
      user_agent: body.userAgent || req.headers["user-agent"] || "",
      active: true,
      updated_at: new Date().toISOString()
    };

    await supabase("push_subscriptions?on_conflict=endpoint", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload)
    });

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, error.status || 500, { ok: false, error: "subscribe_failed", detail: error.data || error.message });
  }
};
