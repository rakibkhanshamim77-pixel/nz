export type ActionResult<T = undefined, F extends string = string> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<F, string>> };
