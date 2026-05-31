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

    return (
      <div
        ref={ref}
        className={`certificate-renderer relative mx-auto aspect-[1.414/1] w-full max-w-6xl overflow-hidden bg-white text-[#073B91] ${className}`}
      >
        {isModern ? (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8FCFF] to-[#EAF6FF]" />
        ) : (
          <div className="absolute inset-0 border-[18px] border-double border-[#073B91] bg-[#FFFEFA]" />
        )}

        {isModern && (
          <>
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#9FC4E2]" />
            <div className="absolute -bottom-36 -left-28 h-72 w-72 rotate-45 bg-[#0066B3]" />
            <div className="absolute -bottom-40 left-10 h-80 w-80 rotate-45 bg-[#0B85C8]" />
            <div className="absolute -top-40 -right-20 h-80 w-80 rotate-45 bg-[#0783C2]" />
            <div className="absolute -right-28 top-28 h-64 w-64 rounded-full bg-[#9FC4E2]" />
            <div className="absolute right-20 top-24 h-[120%] w-20 rotate-45 bg-[#E2F2FD]" />
            <div className="absolute right-64 -bottom-28 h-[95%] w-16 rotate-45 bg-white/80" />
          </>
        )}

        {revoked && (
          <div className="absolute inset-0 z-30 flex rotate-[-18deg] items-center justify-center text-8xl font-black uppercase tracking-widest text-red-600/25">
            Revoked
          </div>
        )}

        <div className={`relative z-10 flex h-full flex-col px-[7%] py-[5%] ${isModern ? "" : "text-[#171717]"}`}>
          <div className="flex items-start justify-between gap-6">
            <img src="/assets/dsc-logo.png" alt="Data Science Club logo" className="h-24 w-32 object-contain" />
            <div className="text-center">
              <h1 className={`uppercase leading-none ${isModern ? "text-7xl font-black tracking-[0.12em] text-[#073B91]" : "text-6xl tracking-widest text-[#171717]"}`}>
                {certificate.certificate_title}
              </h1>
              <p className={`${isModern ? "mt-2 text-3xl italic text-[#0B65AE]" : "mt-4 text-xl tracking-[0.25em] text-[#073B91]"} uppercase`}>
                {certificate.certificate_type}
              </p>
            </div>
            <img src="/assets/sms-tu-logo.png" alt="SMS TU logo" className="h-28 w-28 object-contain" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className={`${isModern ? "text-3xl" : "text-2xl"} text-[#073B91]`}>This is to certify that</p>
            <p className={`${isModern ? "mt-8 text-8xl text-[#0066B3]" : "mt-7 text-7xl text-[#171717]"} leading-none font-serif italic`}>
              {certificate.recipient_name_snapshot}
            </p>
            <p className={`${isModern ? "mt-10 max-w-4xl text-3xl" : "mt-8 max-w-3xl text-2xl"} leading-snug text-[#073B91]`}>
              {certificate.description}
            </p>
            <p className="mt-5 text-lg font-bold uppercase tracking-widest text-[#0B65AE]">
              {certificate.event_title_snapshot} - {formatDate(certificate.issued_date)}
            </p>
            <p className="mt-3 text-sm uppercase tracking-widest text-slate-600">
              Issued by {certificate.issuer_name}
            </p>
          </div>

          <div className={`grid gap-8 ${certificate.signature_data.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {certificate.signature_data.slice(0, 3).map((signature, index) => (
              <div key={`${signature.name}-${index}`} className="text-center">
                <div className="mx-auto mb-2 flex h-14 items-end justify-center">
                  {signature.signature_image_url ? (
                    <img src={signature.signature_image_url} alt={`${signature.name} signature`} className="max-h-14 max-w-[220px] object-contain" />
                  ) : null}
                </div>
                <div className="mx-auto mb-3 h-0.5 w-[80%] bg-[#0B65AE]" />
                <p className="text-xl font-semibold uppercase tracking-wider text-[#0066B3]">{signature.name || "SIGNER_NAME"}</p>
                <p className="mt-1 text-base uppercase text-[#073B91]">{signature.title || "SIGNER"}</p>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 right-6 flex items-center gap-2 rounded bg-white/80 p-1">
            <QRCodeCanvas value={verifyUrl} size={42} includeMargin />
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#073B91]">
              Verify: {verifyUrl}
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
