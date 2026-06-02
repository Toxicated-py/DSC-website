import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Certificate, PublicCertificate } from "../../types/certificate";

type RenderableCertificate = Certificate | PublicCertificate;

interface CertificateRendererProps {
  certificate: RenderableCertificate;
  className?: string;
}

const baseUrl = () =>
  import.meta.env.VITE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" })
    : "Date pending";

export const CertificateRenderer = forwardRef<HTMLDivElement, CertificateRendererProps>(
  ({ certificate, className = "" }, ref) => {
    const isModern = certificate.template === "modern";
    const verifyUrl = `${baseUrl()}/verify/${certificate.verification_code}`;
    const revoked = certificate.status === "revoked";
    const templateData = certificate.template_data || {};
    const hasCustomBackground = Boolean(templateData.background_image_url);
    const typeLabel = (certificate.certificate_type || "Participation").replace(/^of\s+/i, "");
    const heading = certificate.certificate_title?.toUpperCase().includes("CERTIFICATE")
      ? "CERTIFICATE"
      : certificate.certificate_title || "CERTIFICATE";

    if (hasCustomBackground) {
      const recipientX = templateData.recipient_x ?? 50;
      const recipientY = templateData.recipient_y ?? 45;
      const detailY = templateData.detail_y ?? 57;
      const recipientSize = templateData.recipient_font_size ?? 74;
      const recipientColor = templateData.recipient_color || "#0066B3";
      const detailColor = templateData.detail_color || "#073B91";
      const showTitle = templateData.show_title !== false;
      const showDescription = templateData.show_description !== false;
      const showEvent = templateData.show_event !== false;
      const showSignatures = templateData.show_signatures !== false;
      const showVerification = templateData.show_verification !== false;

      return (
        <div
          ref={ref}
          className={`certificate-renderer relative mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden bg-white text-[#073B91] ${className}`}
        >
          <img
            src={templateData.background_image_url}
            alt="Certificate template"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {revoked && (
            <div className="absolute inset-0 z-30 flex rotate-[-18deg] items-center justify-center text-8xl font-black uppercase tracking-widest text-red-600/25">
              Revoked
            </div>
          )}
          {showTitle && (
            <div
              className="absolute left-1/2 top-[15%] w-[60%] -translate-x-1/2 text-center"
              style={{ color: detailColor }}
            >
              <p className="text-[clamp(1.75rem,4.2vw,4.25rem)] font-black uppercase leading-none tracking-[0.08em]">
                {heading}
              </p>
              <p className="mt-2 text-[clamp(1rem,2.1vw,2.25rem)] italic uppercase">OF {typeLabel}</p>
            </div>
          )}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center leading-none"
            style={{
              left: `${recipientX}%`,
              top: `${recipientY}%`,
              color: recipientColor,
              fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
              fontSize: `clamp(2.2rem, ${recipientSize / 10}vw, ${recipientSize}px)`,
            }}
          >
            {certificate.recipient_name_snapshot}
          </div>
          <div
            className="absolute left-1/2 w-[72%] -translate-x-1/2 text-center"
            style={{ top: `${detailY}%`, color: detailColor }}
          >
            {showDescription && (
              <p className="text-[clamp(0.9rem,1.7vw,1.7rem)] leading-snug">{certificate.description}</p>
            )}
            {showEvent && (
              <p className="mt-3 text-[clamp(0.75rem,1.1vw,1.05rem)] font-bold uppercase tracking-wide">
                {certificate.event_title_snapshot} - {formatDate(certificate.issued_date)}
              </p>
            )}
          </div>
          {showSignatures && (
            <div className="absolute bottom-[8.3%] left-[14.2%] right-[9.2%] grid grid-cols-3 gap-[7%]">
              {(certificate.signature_data.length ? certificate.signature_data : [{ name: certificate.issuer_name, title: "ISSUER", signature_image_url: "" }])
                .slice(0, 3)
                .map((signature, index) => (
                <div key={`${signature.name}-${index}`} className="text-center" style={{ color: detailColor }}>
                  <div className="mx-auto mb-[3%] flex h-12 items-end justify-center">
                    {signature.signature_image_url ? (
                      <img src={signature.signature_image_url} alt={`${signature.name} signature`} className="max-h-12 max-w-[210px] object-contain" />
                    ) : null}
                  </div>
                  <div className="mx-auto mb-[4%] h-[2px] w-full" style={{ backgroundColor: detailColor }} />
                  <p className="text-[clamp(0.72rem,1.35vw,1.25rem)] font-medium uppercase leading-tight">{signature.name || "SIGNER_NAME"}</p>
                  <p className="mt-[2%] text-[clamp(0.62rem,1.1vw,1rem)] uppercase leading-tight">{signature.title || "SIGNER"}</p>
                </div>
              ))}
            </div>
          )}
          {showVerification && (
            <div className="absolute bottom-[2.4%] right-[3%] flex items-center gap-2 bg-white/80 p-1">
              <QRCodeCanvas value={verifyUrl} size={34} includeMargin />
              <p className="max-w-[240px] font-mono text-[8px] uppercase tracking-widest" style={{ color: detailColor }}>
                {certificate.verification_code}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`certificate-renderer relative mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden bg-white text-[#073B91] ${className}`}
      >
        <div className="absolute inset-0 bg-[#FBFDFF]" />
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-[-8%] top-[-19%] h-[26%] w-[24%] rounded-b-full bg-[#9FC4E2]" />
          <div className="absolute left-[6%] top-[-19%] h-[33%] w-[33%] rotate-45 rounded-[48px] bg-[#9FC4E2]" />
          <div className="absolute right-[-11%] top-[-14%] h-[30%] w-[30%] rotate-45 bg-[#0783C2]" />
          <div className="absolute right-[-7%] top-[8%] h-[24%] w-[18%] rounded-l-full bg-[#9FC4E2]" />
          <div className="absolute right-[8%] top-[8%] h-[88%] w-[5%] rotate-45 bg-[#E2F2FD]" />
          <div className="absolute right-[21%] top-[35%] h-[74%] w-[5%] rotate-45 bg-white/80" />
          <div className="absolute left-[-8%] bottom-[-20%] h-[34%] w-[12%] rotate-45 bg-[#0066B3]" />
          <div className="absolute left-[2%] bottom-[-28%] h-[40%] w-[11%] rotate-45 bg-[#0B85C8]" />
          <div className="absolute right-[13%] bottom-[-19%] h-[24%] w-[22%] rotate-45 rounded-[46px] bg-[#9FC4E2]" />
          {!isModern && <div className="absolute inset-[2.3%] border-[5px] border-[#073B91]/80" />}
        </div>

        {revoked && (
          <div className="absolute inset-0 z-30 flex rotate-[-18deg] items-center justify-center text-8xl font-black uppercase tracking-widest text-red-600/25">
            Revoked
          </div>
        )}

        <div className="relative z-10 h-full px-[10.2%] py-[6.8%] text-[#073B91]">
          <img
            src="/assets/dsc-logo.png"
            alt="Data Science Club logo"
            className="absolute left-[10.4%] top-[12%] h-[18%] w-[14%] object-contain"
          />
          <img
            src="/assets/sms-tu-logo.png"
            alt="SMS TU logo"
            className="absolute right-[10.7%] top-[11.2%] h-[17.5%] w-[13.5%] object-contain"
          />

          <div className="text-center">
            <h1
              className="mx-auto max-w-[50%] text-[clamp(2.5rem,5.7vw,5.25rem)] font-black uppercase leading-none text-[#073B91]"
              style={{ fontFamily: "Montserrat, Arial Black, Arial, sans-serif" }}
            >
              {heading}
            </h1>
            <p
              className="mt-[2.3%] text-[clamp(1.45rem,3.2vw,3.05rem)] italic uppercase leading-none text-[#0B65AE]"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              OF {typeLabel}
            </p>
          </div>

          <div className="mt-[7.4%] text-center">
            <p className="text-[clamp(1.05rem,2.35vw,2.35rem)] leading-none text-[#073B91]">
              This certificate is proudly presented to
            </p>
            <p
              className="mt-[4%] leading-none text-[#0066B3]"
              style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: "clamp(3.4rem, 8.8vw, 8.2rem)" }}
            >
              {certificate.recipient_name_snapshot}
            </p>
            <p className="mx-auto mt-[4.1%] max-w-[73%] text-[clamp(1.05rem,2.35vw,2.3rem)] leading-snug text-[#073B91]">
              {certificate.description}
            </p>
            <p className="mx-auto mt-[1.6%] max-w-[74%] text-[clamp(0.8rem,1.25vw,1.25rem)] font-bold uppercase text-[#073B91]">
              {certificate.event_title_snapshot} - {formatDate(certificate.issued_date)}
            </p>
          </div>

          <div className="absolute bottom-[8.3%] left-[14.2%] right-[9.2%] grid grid-cols-3 gap-[7%]">
            {(certificate.signature_data.length ? certificate.signature_data : [{ name: certificate.issuer_name, title: "ISSUER", signature_image_url: "" }])
              .slice(0, 3)
              .map((signature, index) => (
              <div key={`${signature.name}-${index}`} className="text-center text-[#0066B3]">
                <div className="mx-auto mb-[3%] flex h-12 items-end justify-center">
                  {signature.signature_image_url ? (
                    <img src={signature.signature_image_url} alt={`${signature.name} signature`} className="max-h-12 max-w-[210px] object-contain" />
                  ) : null}
                </div>
                <div className="mx-auto mb-[4%] h-[3px] w-full bg-[#0B65AE]" />
                <p className="text-[clamp(0.78rem,1.75vw,1.7rem)] font-medium uppercase leading-tight">{signature.name || "SIGNER_NAME"}</p>
                <p className="mt-[2%] text-[clamp(0.72rem,1.55vw,1.45rem)] uppercase leading-tight">{signature.title || "SIGNER"}</p>
              </div>
            ))}
          </div>

          <div className="absolute bottom-[2.4%] right-[3%] flex items-center gap-2 bg-white/80 p-1">
            <QRCodeCanvas value={verifyUrl} size={34} includeMargin />
            <p className="max-w-[240px] font-mono text-[8px] uppercase tracking-widest text-[#073B91]">
              {certificate.verification_code}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateRenderer.displayName = "CertificateRenderer";

export async function downloadCertificatePdf(element: HTMLElement, verificationCode: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    onclone: (_document, clonedElement) => {
      const root = clonedElement as HTMLElement;
      const clonedWindow = root.ownerDocument.defaultView;
      if (!clonedWindow) return;

      root.style.backgroundColor = "#ffffff";
      root.style.color = "#073B91";
      root.style.boxShadow = "none";

      root.querySelectorAll<HTMLElement>("*").forEach((node) => {
        const computed = clonedWindow.getComputedStyle(node);
        if (computed.color.includes("oklab")) node.style.color = "#073B91";
        if (computed.backgroundColor.includes("oklab")) node.style.backgroundColor = "transparent";
        if (computed.borderColor.includes("oklab")) node.style.borderColor = "#073B91";
        if (computed.boxShadow.includes("oklab")) node.style.boxShadow = "none";
      });
    },
  });
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(image, "PNG", 0, 0, 297, 210);
  pdf.save(`certificate-${verificationCode}.pdf`);
}

export function CertificatePrintStyles() {
  return (
    <style>{`
      @media print {
        @page { size: A4 landscape; margin: 0; }
        body * { visibility: hidden !important; }
        .certificate-renderer, .certificate-renderer * { visibility: visible !important; }
        .certificate-renderer {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          margin: 0 !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print { display: none !important; }
      }
    `}</style>
  );
}
