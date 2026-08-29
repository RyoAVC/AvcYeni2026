import { getPlatformDomainConfig } from "../../../../platform-domain-config.mjs";
import { readRuntimeEnv } from "../../../../runtime-env.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = await readRuntimeEnv();
  const domains = getPlatformDomainConfig(env);
  return Response.json({
    ok: true,
    format: "avci-control-plane.discovery.v1",
    ...domains,
    serverTime: new Date().toISOString(),
  }, {
    headers: {
      "cache-control": "public, max-age=60, s-maxage=300",
      "x-content-type-options": "nosniff",
    },
  });
}
