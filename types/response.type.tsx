export type ResponseType =
  | { success: true; redirectTo: string; data?: [] }
  | { success: false; error: string };
