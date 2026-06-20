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

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
