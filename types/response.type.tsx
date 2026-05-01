export type ResponseType<T = any> =
  | { success: true; redirectTo: string; data?: T }
  | { success: false; error: string };
