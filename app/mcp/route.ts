import { ToolError, tools } from "@/lib/mcp";

// A stateless MCP server over Streamable HTTP: every request is a JSON-RPC message (or a batch of them) POSTed to /mcp, answered
// with a JSON response. There are no sessions, server-initiated messages or auth, since everything is public.
// Add it to a client as a remote server: https://kubespec.dev/mcp

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26"];

const INSTRUCTIONS =
  "kubespec.dev is an API reference for Kubernetes and popular CRD projects, across versions. " +
  "Start with list_projects or search_kinds to find a kind, then get_kind_schema for its fields and get_kind_changelog for how they changed between versions.";

type RpcMessage = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, any> };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
};

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: CORS });
const error = (id: RpcMessage["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function handle(message: RpcMessage) {
  const { id, method, params } = message;
  switch (method) {
    case "initialize": {
      const requested = params?.protocolVersion;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
          capabilities: { tools: {} },
          serverInfo: { name: "kubespec", title: "kubespec.dev", version: "1.0.0" },
          instructions: INSTRUCTIONS,
        },
      };
    }
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema, annotations: { readOnlyHint: true, openWorldHint: false } })),
        },
      };
    case "tools/call": {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) return error(id, -32602, `Unknown tool: ${params?.name}`);
      try {
        const text = await tool.run(params?.arguments ?? {});
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
      } catch (e) {
        // bad arguments are reported to the model so it can correct them
        if (e instanceof ToolError) return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: e.message }], isError: true } };
        throw e;
      }
    }
    default:
      return error(id, -32601, `Method not found: ${method}`);
  }
}

const isMessage = (m: unknown): m is RpcMessage =>
  !!m && typeof m === "object" && !Array.isArray(m) && (m as RpcMessage).jsonrpc === "2.0" && typeof (m as RpcMessage).method === "string";

// The response to one message, or undefined for a notification (e.g. notifications/initialized), which has no id and gets none
async function respond(message: unknown) {
  if (!isMessage(message)) return error(null, -32600, "Invalid request");
  if (message.id === undefined) return undefined;
  try {
    return await handle(message);
  } catch (e) {
    console.error("MCP request failed", e);
    return error(message.id, -32603, "Internal error");
  }
}

const accepted = () => new Response(null, { status: 202, headers: CORS });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(error(null, -32700, "Parse error"), 400);
  }

  // protocol version 2025-03-26 allows several messages in one request, answered together in an array
  if (Array.isArray(body)) {
    if (body.length === 0) return json(error(null, -32600, "Invalid request"), 400);
    const responses = (await Promise.all(body.map(respond))).filter((r) => r !== undefined);
    return responses.length > 0 ? json(responses) : accepted();
  }

  if (!isMessage(body)) return json(error(null, -32600, "Invalid request"), 400);
  const response = await respond(body);
  return response ? json(response) : accepted();
}

// MCP clients may GET to open a stream for server-initiated messages, which this server doesn't send.
// Anyone else is likely a person following the URL, so they're sent to the docs.
export function GET(request: Request) {
  if (request.headers.get("accept")?.includes("text/event-stream")) {
    return new Response("Method Not Allowed", { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
  }
  return new Response(null, { status: 307, headers: { Location: new URL("/docs/mcp", request.url).toString(), Vary: "Accept" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
