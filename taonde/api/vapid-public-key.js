const { sendJson, setCors } = require("./_cors");

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.end();
  if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  return sendJson(res, 200, {
    ok: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || ""
  });
};
