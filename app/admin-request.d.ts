export type AdminRequestFailure = {
  ok: false;
  status: number;
  error: string;
};

export type AdminRequestSuccess<T = Record<string, unknown>> = {
  ok: true;
  value: T;
};

export type AdminJsonResult<T = Record<string, unknown>> =
  | AdminRequestFailure
  | AdminRequestSuccess<T>;

export function validateAdminOrigin(request: Request): AdminRequestFailure | null;
export function validateAdminMutationRequest(request: Request): AdminRequestFailure | null;
export function validateAdminMultipartRequest(request: Request, maxBytes?: number): AdminRequestFailure | null;
export function readAdminJsonObject<T = Record<string, unknown>>(request: Request): Promise<AdminJsonResult<T>>;
