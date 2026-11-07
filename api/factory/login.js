import { checkPassword, json } from "../../lib/factory-auth.js";

export async function POST(request) {
  const auth = checkPassword(request);
  if (!auth.ok) return json(auth.status, { code: auth.status === 401 ? "bad_password" : "server_config", message: auth.message });
  return json(200, { ok: true, ai: Boolean(process.env.ANTHROPIC_API_KEY) });
}
