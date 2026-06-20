export const getRoleSet = (profile: any) => {
  const roles = new Set<string>();
  if (typeof profile?.role === "string") roles.add(profile.role.toLowerCase());
  if (Array.isArray(profile?.roles)) {
    profile.roles.forEach((role: unknown) => {
      if (typeof role === "string") roles.add(role.toLowerCase());
    });
  }
  return roles;
};

export const isFullAdminProfile = (profile: any) => {
  const roles = getRoleSet(profile);
  return roles.has("admin") || roles.has("president");
};

export const isOrganizerProfile = (profile: any) => {
  const roles = getRoleSet(profile);
  return roles.has("organizer") || roles.has("event_manager");
};

const isCertificateSchemaError = (message = "") =>
  ["verification_code", "recipient_name_snapshot", "event_title_snapshot", "template_style", "revoked_at", "signature_data"].some((field) =>
    message.includes(field)
  );

export const formatCertificateError = (message: string) =>
  isCertificateSchemaError(message)
    ? "Certificate verification is not installed in Supabase yet. Run the latest certificate migration, then try again."
    : message.toLowerCase().includes("row-level security")
      ? "Certificate issuing is blocked by Supabase permissions. Run the latest certificate event-manager policy migration, then try again."
      : message;

export const certificateTemplateOptions = [
  { value: "modern", label: "Modern", accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]" },
  { value: "classic", label: "Classic", accent: "bg-[#FFE800]", surface: "bg-white", text: "text-[#171717]" },
  { value: "custom-image", label: "Custom Image", accent: "bg-[#7C3AED]", surface: "bg-white", text: "text-[#171717]" },
];

export const assignableRoleOptions = ["member", "student", "teacher", "event_manager", "organizer", "president", "admin"];

export const toDatetimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

export const fromDatetimeLocalValue = (value: string) =>
  value ? new Date(value).toISOString() : null;

export const hasDatePassed = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
};

export const isEventRegistrationOpen = (event: any) =>
  Boolean(event?.registration_open) && !hasDatePassed(event?.registration_deadline);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
