import Anthropic from "@anthropic-ai/sdk";
import { guardPassword, json } from "../../lib/factory-auth.js";

const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수를 읽음
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// 페이지가 보낸 프롬프트를 Claude에 보내고, 글자를 받는 대로 그대로 흘려보냄(스트리밍).
export async function POST(request) {
  const auth = await guardPassword(request);
  if (!auth.ok) return json(auth.status, { code: auth.status === 401 ? "bad_password" : auth.status === 429 ? "too_many" : "server_config", message: auth.message });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { code: "server_config", message: "서버에 ANTHROPIC_API_KEY가 설정되지 않았어요." });

  let body;
  try { body = await request.json(); } catch { return json(400, { code: "invalid_request", message: "요청 형식이 잘못됐어요." }); }
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt.trim()) return json(400, { code: "invalid_request", message: "프롬프트가 비어 있어요." });
  if (prompt.length > 200000) return json(413, { code: "prompt_too_large", message: "내용이 너무 길어요." });
  const effort = body.tier === "quick" ? "low" : "medium";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = client.beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 32000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort },
            messages: [{ role: "user", content: prompt }],
          },
          { signal: request.signal },
        );
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\u0000ERR:refused"));
        else if (final.stop_reason === "max_tokens") controller.enqueue(encoder.encode("\n\u0000ERR:truncated"));
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) controller.enqueue(encoder.encode("\u0000ERR:rate_limited"));
        else if (err instanceof Anthropic.AuthenticationError) controller.enqueue(encoder.encode("\u0000ERR:bad_api_key"));
        else if (err instanceof Anthropic.APIUserAbortError) { /* 사용자가 중지 */ }
        else { console.error(err); controller.enqueue(encoder.encode("\u0000ERR:upstream_error")); }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}
