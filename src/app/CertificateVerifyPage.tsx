import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, Download, Eye, Shield, X } from "lucide-react";
import { getPublicCertificateByVerificationCode } from "../services/certificateService";
import type { PublicCertificate } from "../types/certificate";
import { CertificatePrintStyles, CertificateRenderer, downloadCertificatePdf } from "./components/CertificateRenderer";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
};

const Button = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, color = "bg-white", className = "" }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`}>{children}</div>
);

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" }) : "Date pending";

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    if (name.startsWith("og:")) tag.setAttribute("property", name);
    else tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export function CertificateVerifyPage() {
  const { code = "" } = useParams();
  const [certificate, setCertificate] = useState<PublicCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const row = await getPublicCertificateByVerificationCode(code);
        if (!mounted) return;
        setCertificate(row);
        document.title = row ? `Verify ${row.certificate_title}` : "Certificate not found";
        setMetaTag("og:title", row ? `${row.certificate_title} - Data Science Club` : "Certificate not found");
        setMetaTag(
          "og:description",
          row
            ? `Certificate issued to ${row.recipient_name_snapshot} for ${row.event_title_snapshot}.`
            : "No Data Science Club certificate was found for this verification code."
        );
      } catch (verifyError: any) {
        if (mounted) setError(verifyError.message || "Could not verify certificate.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, [code]);

  const downloadCertificate = async () => {
    if (!certificate || !certificateRef.current) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf(certificateRef.current, certificate.verification_code);
    } finally {
      setDownloading(false);
    }
  };

  const isRevoked = certificate?.status === "revoked";

  return (
    <div className="pt-16 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
      <CertificatePrintStyles />
      {loading ? (
        <Card>
          <p className="font-mono text-sm text-slate-500">Verifying certificate...</p>
        </Card>
      ) : error ? (
        <Card color="bg-[#FB7185]" className="text-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Verification unavailable</h1>
          <p className="font-mono text-sm">{error}</p>
        </Card>
      ) : !certificate ? (
        <Card>
          <Award size={42} className="mb-4 text-[#FB7185]" />
          <h1 className="text-5xl uppercase mb-3" style={fonts.display}>Certificate not found</h1>
          <p className="text-slate-600">Check the verification code and try again.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <Card color={isRevoked ? "bg-[#FB7185]" : "bg-green-500"} className="text-white">
            <Shield size={52} className="mb-6" />
            <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
              {isRevoked ? "Certificate Revoked" : "Certificate Verified"}
            </h1>
            <p className="text-lg opacity-90">
              {isRevoked
                ? "This certificate was issued by Data Science Club but has been revoked."
                : "This certificate is valid and was issued by Data Science Club."}
            </p>
          </Card>

          <Card>
            <div className="space-y-4 text-sm">
              <p><b>Recipient:</b><br />{certificate.recipient_name_snapshot}</p>
              <p><b>Event:</b><br />{certificate.event_title_snapshot}</p>
              <p><b>Type:</b><br />{certificate.certificate_type}</p>
              <p><b>Issued:</b><br />{formatDate(certificate.issued_date)}</p>
              <p><b>Issuer:</b><br />{certificate.issuer_name}</p>
              <p><b>Code:</b><br /><span className="font-mono break-all">{certificate.verification_code}</span></p>
              {certificate.signature_data.length > 0 && (
                <div>
                  <b>Signed by:</b>
                  <div className="mt-2 space-y-1">
                    {certificate.signature_data.map((signature, index) => (
                      <p key={index} className="text-xs font-mono">
                        {signature.name || "Signer"} - {signature.title || "Title"}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <Button color="bg-[#2563EB]" text="text-white" className="w-full" onClick={() => setShowCertificate(true)}>
                <Eye size={16} className="inline mr-2" /> View Full Certificate
              </Button>
              <Button color="bg-[#FFE800]" className="w-full" onClick={downloadCertificate} disabled={downloading}>
                <Download size={16} className="inline mr-2" /> {downloading ? "Preparing..." : "Download PDF"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {certificate && (
        <div className={`${showCertificate ? "fixed" : "absolute pointer-events-none opacity-0"} inset-0 z-50 bg-black/70 p-4 md:p-8 overflow-y-auto`}>
          {showCertificate && (
            <div className="no-print mx-auto mb-4 flex max-w-7xl justify-end">
              <Button color="bg-white" onClick={() => setShowCertificate(false)}>
                <X size={16} className="inline mr-2" /> Close
              </Button>
            </div>
          )}
          <CertificateRenderer ref={certificateRef} certificate={certificate} />
        </div>
      )}
    </div>
  );
}
