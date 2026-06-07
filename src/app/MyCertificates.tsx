import React, { useEffect, useRef, useState } from "react";
import { Award, Calendar, Download, Printer, X } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { userFriendlyErrorMessage } from "../lib/apiClient";
import { getCertificatesByMember } from "../services/certificateService";
import type { Certificate } from "../types/certificate";
import { CertificatePrintStyles, CertificateRenderer, downloadCertificatePdf } from "./components/CertificateRenderer";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
};

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, color = "bg-[#2563EB]" }: any) => (
  <span className={`px-2 py-1 ${color} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest`}>
    {children}
  </span>
);

export function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCertificates() {
      try {
        if (!isSupabaseConfigured || !supabase) throw new Error("Supabase is not configured.");
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) throw new Error("You must be logged in to view certificates.");

        const rows = await getCertificatesByMember(userData.user.id);
        if (mounted) setCertificates(rows);
      } catch (loadError: any) {
        if (mounted) setError(userFriendlyErrorMessage(loadError, "Could not load certificates. Please refresh and try again."));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCertificates();
    return () => {
      mounted = false;
    };
  }, []);

  const downloadSelected = async () => {
    if (!selectedCertificate || !certificateRef.current || selectedCertificate.status === "revoked") return;
    setDownloading(true);
    try {
      await downloadCertificatePdf(certificateRef.current, selectedCertificate.verification_code);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto min-h-screen">
      <CertificatePrintStyles />
      <div className="mb-12">
        <Badge color="bg-[#FFE800]">
          <Award size={10} className="inline mr-1" /> My Certificates
        </Badge>
        <h1 className="mt-4 text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
          Certificates
        </h1>
        <p className="mt-3 text-lg text-slate-600">View, print, and download certificates issued to you.</p>
      </div>

      {loading ? (
        <BrutalCard>
          <p className="font-mono text-sm text-slate-500">Loading certificates...</p>
        </BrutalCard>
      ) : error ? (
        <BrutalCard color="bg-[#FB7185]" className="text-white">
          <p className="font-bold">{error}</p>
        </BrutalCard>
      ) : certificates.length === 0 ? (
        <BrutalCard className="text-center">
          <Award size={42} className="mx-auto mb-4 text-[#2563EB]" />
          <h2 className="text-3xl uppercase mb-2" style={fonts.display}>No certificates yet</h2>
          <p className="text-slate-600">Certificates will appear here after they are issued by the club.</p>
        </BrutalCard>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <button
              key={certificate.id}
              type="button"
              onClick={() => setSelectedCertificate(certificate)}
              className="text-left border-2 border-[#171717] bg-white p-5 brutal-shadow brutal-shadow-hover transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <Badge color={certificate.status === "revoked" ? "bg-[#FB7185] text-white" : "bg-green-500 text-white"}>
                  {certificate.status}
                </Badge>
                <Badge>{certificate.certificate_type}</Badge>
              </div>
              <h2 className="text-2xl uppercase leading-tight" style={fonts.display}>{certificate.event_title_snapshot}</h2>
              <p className="mt-2 text-sm text-slate-600">{certificate.certificate_title}</p>
              <p className="mt-4 flex items-center gap-2 font-mono text-xs text-slate-500">
                <Calendar size={14} /> {certificate.issued_date || "Date pending"}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 md:p-8 overflow-y-auto">
          <div className="no-print mx-auto max-w-7xl">
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-white">
                <h2 className="text-3xl uppercase" style={fonts.display}>{selectedCertificate.certificate_title}</h2>
                {selectedCertificate.status === "revoked" && <p className="text-[#FB7185] font-bold uppercase">This certificate has been revoked.</p>}
              </div>
              <div className="flex gap-3 flex-wrap">
                <BrutalButton
                  color="bg-[#2563EB]"
                  text="text-white"
                  onClick={downloadSelected}
                  disabled={selectedCertificate.status === "revoked" || downloading}
                >
                  <Download size={16} className="inline mr-2" /> {downloading ? "Preparing..." : "Download PDF"}
                </BrutalButton>
                <BrutalButton
                  color="bg-[#FFE800]"
                  onClick={() => window.print()}
                  disabled={selectedCertificate.status === "revoked"}
                >
                  <Printer size={16} className="inline mr-2" /> Print
                </BrutalButton>
                <BrutalButton color="bg-white" onClick={() => setSelectedCertificate(null)}>
                  <X size={16} className="inline mr-2" /> Close
                </BrutalButton>
              </div>
            </div>
          </div>
          <CertificateRenderer ref={certificateRef} certificate={selectedCertificate} />
        </div>
      )}
    </div>
  );
}
