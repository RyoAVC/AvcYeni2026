import { clearAdminSessionCookie } from "../../../admin-session.mjs";
import { redirectResponse, requestIsHttps } from "../../../form-post.mjs";

export async function GET(request: Request) {
  return redirectResponse(
    request,
    "/yonetim/giris",
    clearAdminSessionCookie(requestIsHttps(request)),
  );
}

export async function POST(request: Request) {
  return GET(request);
}
