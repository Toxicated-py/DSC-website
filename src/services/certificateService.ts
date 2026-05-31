import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type {
  Certificate,
  CertificateFormData,
  CertificateIssueSummary,
  PublicCertificate,
  SignatureData,
} from "../types/certificate";

const CERTIFICATE_SELECT =
  "id,member_id,event_id,certificate_title,certificate_type,template,description,issuer_name,issued_date,external_pdf_url,signature_data,verification_code,event_title_snapshot,recipient_name_snapshot,status,created_at";

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
};

const normalizeCertificate = (row: any): Certificate => ({
  ...row,
  signature_data: Array.isArray(row.signature_data) ? row.signature_data : [],
});

const normalizePublicCertificate = (row: any): PublicCertificate => ({
  ...row,
  signature_data: Array.isArray(row.signature_data) ? row.signature_data : [],
});

export async function generateVerificationCode(): Promise<string> {
  const client = requireSupabase();
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await client
      .from("certificates")
      .select("verification_code")
      .like("verification_code", `CLUB-${year}-%`)
      .order("verification_code", { ascending: false })
      .limit(1);

    if (error) throw new Error(`Could not generate verification code: ${error.message}`);

    const latestCode = data?.[0]?.verification_code as string | undefined;
    const latestNumber = latestCode ? Number(latestCode.split("-").pop()) || 0 : 0;
    const candidate = `CLUB-${year}-${String(latestNumber + 1 + attempt).padStart(5, "0")}`;

    const { data: existing, error: collisionError } = await client
      .from("certificates")
      .select("id")
      .eq("verification_code", candidate)
      .maybeSingle();

    if (collisionError) throw new Error(`Could not check verification code uniqueness: ${collisionError.message}`);
    if (!existing) return candidate;
  }

  throw new Error("Could not generate a unique verification code. Please try again.");
}

export async function checkDuplicateCertificate(memberId: string, eventId: string): Promise<boolean> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("certificates")
    .select("id")
    .eq("member_id", memberId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(`Could not check duplicate certificate: ${error.message}`);
  return Boolean(data);
}

async function getEventTitle(eventId: string): Promise<string> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("events")
    .select("title")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw new Error(`Could not load event snapshot: ${error.message}`);
  return data?.title || "Event";
}

async function getRecipientName(memberId: string): Promise<string> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("full_name,email")
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw new Error(`Could not load recipient snapshot: ${error.message}`);
  return data?.full_name || data?.email || "Participant";
}

export async function issueSingleCertificate(formData: CertificateFormData): Promise<Certificate> {
  const client = requireSupabase();

  if (!formData.member_id || !formData.event_id) {
    throw new Error("Member and event are required.");
  }
  if (!formData.certificate_title || !formData.issuer_name || !formData.issued_date) {
    throw new Error("Certificate title, issuer, and issued date are required.");
  }

  const duplicate = await checkDuplicateCertificate(formData.member_id, formData.event_id);
  if (duplicate) {
    throw new Error("Certificate already issued to this person for this event.");
  }

  const [verificationCode, eventTitleDefault, recipientNameDefault] = await Promise.all([
    generateVerificationCode(),
    getEventTitle(formData.event_id),
    getRecipientName(formData.member_id),
  ]);
  const eventTitle = formData.event_title_snapshot?.trim() || eventTitleDefault;
  const recipientName = formData.recipient_name_snapshot?.trim() || recipientNameDefault;

  const payload = {
    member_id: formData.member_id,
    event_id: formData.event_id,
    certificate_title: formData.certificate_title,
    certificate_type: formData.certificate_type,
    template: formData.template,
    description: formData.description,
    issuer_name: formData.issuer_name,
    issued_date: formData.issued_date,
    external_pdf_url: formData.external_pdf_url || null,
    signature_data: formData.signature_data,
    verification_code: verificationCode,
    event_title_snapshot: eventTitle,
    recipient_name_snapshot: recipientName,
    status: "valid",
  };

  let { data, error } = await client
    .from("certificates")
    .insert(payload)
    .select(CERTIFICATE_SELECT)
    .single();

  if (
    error?.code === "23502" &&
    (error.message.includes("recipient_id") || error.message.includes("\"title\""))
  ) {
    const retry = await client
      .from("certificates")
      .insert({
        ...payload,
        recipient_id: formData.member_id,
        title: formData.certificate_title,
        template_style: formData.template,
        certificate_url: formData.external_pdf_url || null,
        issued_at: formData.issued_date,
      })
      .select(CERTIFICATE_SELECT)
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.code === "23505") {
      throw new Error("Certificate already issued to this person for this event.");
    }
    throw new Error(`Could not issue certificate: ${error.message}`);
  }

  return normalizeCertificate(data);
}

export async function issueCheckedInBulk(
  eventId: string,
  sharedFormData: Omit<CertificateFormData, "member_id" | "event_id">
): Promise<CertificateIssueSummary> {
  const client = requireSupabase();

  const { data: registrations, error } = await client
    .from("event_registrations")
    .select("user_id,status,checked_in_at,profiles:user_id(full_name,email)")
    .eq("event_id", eventId)
    .or("status.eq.checked_in,checked_in_at.not.is.null");

  if (error) throw new Error(`Could not load checked-in attendees: ${error.message}`);

  const success: Certificate[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const registration of registrations || []) {
    const memberId = registration.user_id;
    const profile = Array.isArray(registration.profiles) ? registration.profiles[0] : registration.profiles;
    const label = profile?.full_name || profile?.email || memberId || "Unknown attendee";

    if (!memberId) {
      failed.push(`${label}: missing member id`);
      continue;
    }

    try {
      const duplicate = await checkDuplicateCertificate(memberId, eventId);
      if (duplicate) {
        skipped.push(label);
        continue;
      }
      const certificate = await issueSingleCertificate({
        ...sharedFormData,
        member_id: memberId,
        event_id: eventId,
      });
      success.push(certificate);
    } catch (bulkError: any) {
      failed.push(`${label}: ${bulkError.message || "unknown error"}`);
    }
  }

  return { success, skipped, failed };
}

export async function getCertificatesByEvent(eventId: string): Promise<Certificate[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load event certificates: ${error.message}`);
  return (data || []).map(normalizeCertificate);
}

export async function getCertificatesByMember(memberId: string): Promise<Certificate[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load member certificates: ${error.message}`);
  return (data || []).map(normalizeCertificate);
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load certificate: ${error.message}`);
  return data ? normalizeCertificate(data) : null;
}

export async function getCertificateByVerificationCode(code: string): Promise<PublicCertificate | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("public_certificates")
    .select("*")
    .eq("verification_code", code.toUpperCase())
    .maybeSingle();

  if (error) throw new Error(`Could not verify certificate: ${error.message}`);
  if (!data || data.status === "revoked") return null;
  return normalizePublicCertificate(data);
}

export async function getPublicCertificateByVerificationCode(code: string): Promise<PublicCertificate | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("public_certificates")
    .select("*")
    .eq("verification_code", code.toUpperCase())
    .maybeSingle();

  if (error) throw new Error(`Could not verify certificate: ${error.message}`);
  return data ? normalizePublicCertificate(data) : null;
}

export async function revokeCertificate(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("certificates")
    .update({ status: "revoked" })
    .eq("id", id);

  if (error) throw new Error(`Could not revoke certificate: ${error.message}`);
}

export async function deleteCertificate(id: string): Promise<void> {
  const client = requireSupabase();
  const { data, error: loadError } = await client
    .from("certificates")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (loadError) throw new Error(`Could not check certificate status: ${loadError.message}`);
  if (!data) throw new Error("Certificate not found.");
  if (data.status !== "revoked") {
    throw new Error("Only revoked certificates can be deleted.");
  }

  const { error } = await client.from("certificates").delete().eq("id", id);
  if (error) throw new Error(`Could not delete certificate: ${error.message}`);
}

export async function updateCertificate(
  id: string,
  updates: Partial<CertificateFormData>
): Promise<Certificate> {
  const client = requireSupabase();
  const allowedUpdates: Record<string, unknown> = {};

  if (updates.certificate_title !== undefined) allowedUpdates.certificate_title = updates.certificate_title;
  if (updates.certificate_type !== undefined) allowedUpdates.certificate_type = updates.certificate_type;
  if (updates.template !== undefined) allowedUpdates.template = updates.template;
  if (updates.description !== undefined) allowedUpdates.description = updates.description;
  if (updates.issuer_name !== undefined) allowedUpdates.issuer_name = updates.issuer_name;
  if (updates.issued_date !== undefined) allowedUpdates.issued_date = updates.issued_date;
  if (updates.external_pdf_url !== undefined) allowedUpdates.external_pdf_url = updates.external_pdf_url;
  if (updates.signature_data !== undefined) allowedUpdates.signature_data = updates.signature_data;
  if (updates.event_title_snapshot !== undefined) allowedUpdates.event_title_snapshot = updates.event_title_snapshot;
  if (updates.recipient_name_snapshot !== undefined) allowedUpdates.recipient_name_snapshot = updates.recipient_name_snapshot;

  const { data, error } = await client
    .from("certificates")
    .update(allowedUpdates)
    .eq("id", id)
    .select(CERTIFICATE_SELECT)
    .single();

  if (error) throw new Error(`Could not update certificate: ${error.message}`);
  return normalizeCertificate(data);
}

export async function uploadSignatureImage(file: File): Promise<string> {
  const client = requireSupabase();
  const extension = file.name.split(".").pop() || "png";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await client.storage.from("signatures").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Could not upload signature image: ${error.message}`);

  const { data } = client.storage.from("signatures").getPublicUrl(path);
  return data.publicUrl;
}

export type { Certificate, CertificateFormData, PublicCertificate, SignatureData };
