import { withBasePath } from "../../../base-path";
import { clearCustomerSessionCookie } from "../../../customer-session.mjs";

export async function GET(request: Request) {
  const headers = new Headers({
    Location: new URL(withBasePath("/musteri-panel/giris"), request.url).toString(),
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", clearCustomerSessionCookie(new URL(request.url).protocol === "https:"));
  return new Response(null, { status: 303, headers });
}

export async function POST(request: Request) {
  return GET(request);
}
