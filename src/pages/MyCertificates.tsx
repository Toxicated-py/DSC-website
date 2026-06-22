import React, { useEffect, useState } from "react";
import { ArrowLeft, Award, Calendar, X } from "lucide-react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { userFriendlyErrorMessage } from "../lib/apiClient";
import { getCertificatesByMember } from "../services/certificateService";
import type { Certificate } from "../types/certificate";


import { BrutalButton, BrutalCard } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

const Badge = ({ children, color = "bg-[#2563EB]" }: any) => (
  <span className={`px-2 py-1 ${color} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest`}>
    {children}
  </span>
);

function formatDate(value?: string) {
  if (!value) return "Date pending";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date pending" : date.toLocaleDateString();
}

export function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto min-h-screen bg-[#F4EFEB]">
      <div className="mb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div>
          <Badge color="bg-[#2563EB] text-white">
            My Certificates
          </Badge>
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl uppercase leading-none break-words" style={fonts.display}>
          My Certificates
        </h1>
        <p className="font-mono text-sm text-slate-600">View certificates issued to you.</p>
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
                <Calendar size={14} /> {formatDate(certificate.issued_date)}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <BrutalCard className="w-full max-w-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <Badge color={selectedCertificate.status === "revoked" ? "bg-[#FB7185] text-white" : "bg-green-500 text-white"}>
                  {selectedCertificate.status}
                </Badge>
                <h2 className="mt-4 text-3xl uppercase leading-tight" style={fonts.display}>
                  {selectedCertificate.event_title_snapshot}
                </h2>
                <p className="text-sm text-slate-600">{selectedCertificate.certificate_title}</p>
              </div>
              <button type="button" onClick={() => setSelectedCertificate(null)} className="border-2 border-[#171717] bg-white p-2">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 font-mono text-sm">
              <p><span className="font-bold">Type:</span> {selectedCertificate.certificate_type}</p>
              <p><span className="font-bold">Event:</span> {selectedCertificate.event_title_snapshot}</p>
              <p><span className="font-bold">Issued date:</span> {formatDate(selectedCertificate.issued_date)}</p>
              <p><span className="font-bold">Certificate ID:</span> {selectedCertificate.verification_code}</p>
              <p><span className="font-bold">Issued by:</span> {selectedCertificate.issuer_name || "Data Science Club"}</p>
            </div>
            <BrutalButton color="bg-[#2563EB]" text="text-white" className="mt-6 w-full" onClick={() => setSelectedCertificate(null)}>
              Close
            </BrutalButton>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}
