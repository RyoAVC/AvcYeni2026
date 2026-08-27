import { clearCustomerSessionCookie } from "../../../customer-session.mjs";
import { redirectResponse, requestIsHttps } from "../../../form-post.mjs";

export async function GET(request: Request) {
  return redirectResponse(
    request,
    "/musteri-panel/giris",
    clearCustomerSessionCookie(requestIsHttps(request)),
  );
}

export async function POST(request: Request) {
  return GET(request);
}
