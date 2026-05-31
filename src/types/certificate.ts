export type CertificateStatus = "valid" | "revoked";

export interface SignatureData {
  name: string;
  title: string;
  signature_image_url: string;
}

export interface Certificate {
  id: string;
  member_id: string;
  event_id: string;
  certificate_title: string;
  certificate_type: string;
  template: "classic" | "modern" | string;
  description: string;
  issuer_name: string;
  issued_date: string;
  external_pdf_url: string | null;
  signature_data: SignatureData[];
  verification_code: string;
  event_title_snapshot: string;
  recipient_name_snapshot: string;
  status: CertificateStatus;
  created_at: string;
}

export interface CertificateFormData {
  member_id: string;
  event_id: string;
  certificate_title: string;
  certificate_type: string;
  template: "classic" | "modern" | string;
  description: string;
  issuer_name: string;
  issued_date: string;
  external_pdf_url?: string | null;
  signature_data: SignatureData[];
  event_title_snapshot?: string;
  recipient_name_snapshot?: string;
}

export interface PublicCertificate {
  id: string;
  certificate_title: string;
  certificate_type: string;
  template: "classic" | "modern" | string;
  description: string;
  issuer_name: string;
  issued_date: string;
  signature_data: SignatureData[];
  verification_code: string;
  event_title_snapshot: string;
  recipient_name_snapshot: string;
  status: CertificateStatus;
  created_at: string;
}

export interface CertificateIssueSummary {
  success: Certificate[];
  skipped: string[];
  failed: string[];
}
