import { clearAdminSessionCookie } from "../../../admin-session.mjs";
import { withBasePath } from "../../../base-path";

export async function GET(request: Request) {
  const headers = new Headers({
    Location: new URL(withBasePath("/yonetim/giris"), request.url).toString(),
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", clearAdminSessionCookie(new URL(request.url).protocol === "https:"));
  return new Response(null, { status: 303, headers });
}

export async function POST(request: Request) {
  return GET(request);
}
