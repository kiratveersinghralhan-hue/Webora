export type StudioEvent =
  | "start_project_clicked"
  | "form_started"
  | "form_step_completed"
  | "enquiry_submitted"
  | "whatsapp_clicked"
  | "email_clicked"
  | "project_viewed"
  | "gift_package_selected";
// Integration point only. No external tracker, cookies or personal data.
export function track(
  event: StudioEvent,
  detail: Record<string, string | number> = {},
) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("webora:analytics", { detail: { event, ...detail } }),
    );
}
