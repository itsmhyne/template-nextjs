export type ResponseType =
  | { success: true; redirectTo: string }
  | { success: false; error: string };
