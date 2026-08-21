const webpush = require("web-push");
const { readJson } = require("./_body");
const { sendJson, setCors } = require("./_cors");
const { env, requireAdmin, supabase } = require("./_supabase");

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.end();
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  if (!requireAdmin(req, res)) return;

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@gaveblue.com.br",
      env("VAPID_PUBLIC_KEY"),
      env("VAPID_PRIVATE_KEY")
    );

    const body = await readJson(req);
    if (!body.title || !body.body) {
      return sendJson(res, 400, { ok: false, error: "title_body_required" });
    }

    const audience = body.audience || "todos";
    const query = audience === "todos"
      ? "push_subscriptions?active=eq.true&select=id,endpoint,subscription"
      : `push_subscriptions?active=eq.true&or=(audience.eq.todos,audience.eq.${encodeURIComponent(audience)})&select=id,endpoint,subscription`;
    const subscriptions = await supabase(query, { method: "GET" });
    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      link: body.link || "/eventos",
      sentAt: new Date().toISOString()
    });

    const results = await Promise.allSettled(
      subscriptions.map((item) => webpush.sendNotification(item.subscription, payload))
    );

    const expiredIds = [];
    results.forEach((result, index) => {
      const status = result.reason?.statusCode;
      if (status === 404 || status === 410) expiredIds.push(subscriptions[index].id);
    });

    if (expiredIds.length) {
      await supabase(`push_subscriptions?id=in.(${expiredIds.join(",")})`, {
        method: "PATCH",
        body: JSON.stringify({ active: false, updated_at: new Date().toISOString() })
      });
    }

    await supabase("push_notifications", {
      method: "POST",
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        link: body.link || "/eventos",
        audience,
        sent_count: results.filter((result) => result.status === "fulfilled").length,
        failed_count: results.filter((result) => result.status === "rejected").length
      })
    });

    return sendJson(res, 200, {
      ok: true,
      total: subscriptions.length,
      sent: results.filter((result) => result.status === "fulfilled").length,
      failed: results.filter((result) => result.status === "rejected").length
    });
  } catch (error) {
    return sendJson(res, error.status || 500, { ok: false, error: "notify_failed", detail: error.data || error.message });
  }
};
