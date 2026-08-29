import { authorizeControlDesk, controlDeskJson } from "../../../../control-desk-auth.mjs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok:false, error:auth.error },auth.status,request);
  return controlDeskJson({ ok:true, format:"avci-control-desk.me.v1", user:{ email:auth.email, displayName:auth.displayName, actorType:auth.actorType, customerId:auth.customerId || null, roles:auth.roles, scopes:auth.scopes } },200,request);
}
