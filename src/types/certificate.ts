export type CertificateStatus = "valid" | "revoked";

export interface SignatureData {
  name: string;
  title: string;
  signature_image_url: string;
}

export interface CertificateTemplateData {
  background_image_url?: string;
  recipient_x?: number;
  recipient_y?: number;
  recipient_font_size?: number;
  recipient_color?: string;
  detail_y?: number;
  detail_color?: string;
  show_title?: boolean;
  show_description?: boolean;
  show_event?: boolean;
  show_signatures?: boolean;
  show_verification?: boolean;
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
  template_data: CertificateTemplateData;
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
  template_data?: CertificateTemplateData;
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
  template_data: CertificateTemplateData;
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
