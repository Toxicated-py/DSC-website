import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { apiGet, userFriendlyErrorMessage } from "../lib/apiClient";
import { fonts } from "../config/fonts";

type VerifiedCertificate = {
  certificate_id: string;
  recipient_name: string;
  masked_email: string;
  certificate_type: string;
  event_name: string;
  issued_at: string;
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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

export function CertificateVerifyPage() {
  const { code = "" } = useParams();
  const [certificateId, setCertificateId] = useState(code);
  const [email, setEmail] = useState("");
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [status, setStatus] = useState<"idle" | "verified" | "not-found" | "error">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCertificateId(code);
  }, [code]);

  const verifyCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = certificateId.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedCode || !normalizedEmail) {
      setStatus("error");
      setMessage("Enter both certificate ID and email address.");
      return;
    }

    setLoading(true);
    setCertificate(null);
    setStatus("idle");
    setMessage("");
    try {
      const row = await apiGet<VerifiedCertificate>(
        `/api/certificates/verify/${encodeURIComponent(normalizedCode)}?email=${encodeURIComponent(normalizedEmail)}`
      );
      setCertificate(row);
      setStatus("verified");
    } catch (error: any) {
      if (error?.status === 404) {
        setStatus("not-found");
      } else {
        setStatus("error");
        setMessage(userFriendlyErrorMessage(error, "Could not verify certificate. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetResult = () => {
    setCertificate(null);
    setStatus("idle");
    setMessage("");
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-6 max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Verify Certificate
        </h1>
        <p className="text-slate-600">
          Enter the certificate ID and the email address it was issued to.
        </p>
      </div>

      <Card className="mb-8">
        <form onSubmit={verifyCertificate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Certificate ID</label>
            <input
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              placeholder="e.g. DSC-2026-001"
              className="w-full border-2 border-[#171717] p-3 font-mono text-sm uppercase focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter the recipient email"
              className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30"
            />
          </div>
          <Button type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={loading}>
            <Search size={16} className="inline mr-2" /> {loading ? "Verifying..." : "Verify Certificate"}
          </Button>
        </form>
      </Card>

      {status === "verified" && certificate && (
        <Card color="bg-[#DCFCE7]">
          <div className="flex items-start gap-4">
            <CheckCircle2 size={42} className="text-green-700 flex-shrink-0" />
            <div className="min-w-0">
              <span className="inline-block mb-4 border-2 border-[#171717] bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                Verified
              </span>
              <h2 className="text-4xl uppercase leading-none mb-4" style={fonts.display}>
                {certificate.recipient_name}
              </h2>
              <div className="grid gap-3 text-sm">
                <p><b>Masked Email:</b> {certificate.masked_email}</p>
                <p><b>Certificate Type:</b> {certificate.certificate_type}</p>
                <p><b>Event:</b> {certificate.event_name}</p>
                <p><b>Issued by:</b> Data Science Club, School of Mathematical Sciences, Tribhuvan University</p>
                <p><b>Issued Date:</b> {formatDate(certificate.issued_at)}</p>
              </div>
              <p className="mt-6 border-t-2 border-[#171717] pt-4 font-mono text-xs text-slate-600">
                DSC Certificate ID: {certificate.certificate_id}
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === "not-found" && (
        <Card color="bg-[#FEE2E2]">
          <AlertTriangle size={42} className="mb-4 text-[#FB7185]" />
          <h2 className="text-4xl uppercase leading-none mb-3" style={fonts.display}>Certificate Not Found</h2>
          <p className="mb-5 text-slate-700">
            No certificate was found matching that ID and email combination. Please check both fields and try again.
          </p>
          <Button type="button" onClick={resetResult}>Try Again</Button>
        </Card>
      )}

      {status === "error" && (
        <Card color="bg-[#FFE800]">
          <AlertTriangle size={38} className="mb-4" />
          <h2 className="text-3xl uppercase leading-none mb-3" style={fonts.display}>Verification Error</h2>
          <p className="mb-5 text-sm font-mono">{message || "Could not verify certificate. Please try again."}</p>
          <Button type="button" color="bg-white" onClick={resetResult}>Retry</Button>
        </Card>
      )}
    </div>
  );
}
