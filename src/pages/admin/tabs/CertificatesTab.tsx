import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Edit, FileUp, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../../../lib/apiClient";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput } from "../AdminPrimitives";

type CertificateRow = {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  certificate_type: string;
  event_id?: string | null;
  event_name: string;
  issued_at: string;
  created_at: string;
};

type CsvRow = {
  required_email: string;
  required_name: string;
  required_certificate_id: string;
};

type EventOption = {
  id: string;
  title: string;
};

const certificateTypes = [
  "Certificate of Participation",
  "Certificate of Completion",
  "Certificate of Achievement",
  "Certificate of Excellence",
];

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [] as string[], rows: [] as CsvRow[] };
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const headerMap = new Map(headers.map((header, index) => [header, index]));
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return {
      required_email: cells[headerMap.get("required_email") ?? -1] || "",
      required_name: cells[headerMap.get("required_name") ?? -1] || "",
      required_certificate_id: cells[headerMap.get("required_certificate_id") ?? -1] || "",
    };
  }).filter((row) => row.required_email || row.required_name || row.required_certificate_id);
  return { headers, rows };
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function relativeTime(value?: string) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function CertificatesTab() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventQuery, setEventQuery] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [certificateType, setCertificateType] = useState(certificateTypes[0]);
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [editRow, setEditRow] = useState<CertificateRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      setCertificates(await apiGet<CertificateRow[]>("/api/admin/certificates", { auth: true }));
    } catch (error) {
      toast.error(userFriendlyErrorMessage(error, "Could not load certificates."));
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (events.length) return;
    try {
      const rows = await apiGet<EventOption[]>("/api/events?status=all", { auth: "optional" });
      setEvents(rows);
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const matchingEvents = events
    .filter((event) => event.title.toLowerCase().includes(eventQuery.toLowerCase()))
    .slice(0, 8);
  const eventSuggestions = matchingEvents.length ? matchingEvents : events.slice(0, 8);

  const validHeaders = ["required_email", "required_name", "required_certificate_id"];
  const headersOk = validHeaders.every((header) => csvHeaders.includes(header));
  const canImport = headersOk && csvRows.length > 0 && eventName.trim() && certificateType.trim();
  const importBlocker = !headersOk
    ? "Upload a CSV with the required headers first."
    : csvRows.length === 0
      ? "Upload a CSV with at least one certificate row."
      : !eventName.trim()
        ? "Choose or type an event name."
        : !certificateType.trim()
          ? "Enter a certificate type."
          : "";

  const stats = useMemo(() => {
    const eventCount = new Set(certificates.map((row) => row.event_name).filter(Boolean)).size;
    const lastImported = certificates
      .map((row) => row.created_at)
      .filter(Boolean)
      .sort()
      .at(-1);
    return { eventCount, lastImported };
  }, [certificates]);

  const filteredCertificates = certificates.filter((row) => {
    const haystack = `${row.certificate_id} ${row.recipient_name} ${row.recipient_email}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const groupedCertificates = filteredCertificates.reduce<Record<string, CertificateRow[]>>((groups, row) => {
    const key = row.event_name || "Unassigned";
    groups[key] = [...(groups[key] || []), row];
    return groups;
  }, {});

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Upload a .csv file.");
      return;
    }
    const parsed = parseCsv(await file.text());
    setCsvHeaders(parsed.headers);
    setCsvRows(parsed.rows);
    if (!validHeaders.every((header) => parsed.headers.includes(header))) {
      setCsvError(`Invalid columns. Expected: ${validHeaders.join(", ")}. Found: ${parsed.headers.join(", ") || "none"}`);
    } else {
      setCsvError("");
    }
  };

  const importCertificates = async () => {
    if (!canImport) return;
    setImporting(true);
    try {
      const result = await apiPost<{ upserted: number; event_name: string }>(
        "/api/admin/certificates/import",
        {
          rows: csvRows,
          event_id: eventId,
          event_name: eventName,
          certificate_type: certificateType,
          issued_at: issuedAt,
        },
        { auth: true }
      );
      toast.success(`Imported ${result.upserted} certificates for ${result.event_name}`);
      setCsvRows([]);
      setCsvHeaders([]);
      setCsvError("");
      await loadCertificates();
    } catch (error) {
      toast.error(userFriendlyErrorMessage(error, "Could not import certificates."));
    } finally {
      setImporting(false);
    }
  };

  const saveEdit = async () => {
    if (!editRow) return;
    setSavingEdit(true);
    try {
      await apiPatch(`/api/admin/certificates/${editRow.id}`, {
        data: {
          recipient_name: editRow.recipient_name,
          recipient_email: editRow.recipient_email,
          certificate_type: editRow.certificate_type,
          event_name: editRow.event_name,
          issued_at: editRow.issued_at,
        },
      }, { auth: true });
      toast.success("Certificate updated.");
      setEditRow(null);
      await loadCertificates();
    } catch (error) {
      toast.error(userFriendlyErrorMessage(error, "Could not update certificate."));
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteCertificate = async (row: CertificateRow) => {
    if (!window.confirm(`Delete certificate ${row.certificate_id} for ${row.recipient_name}?`)) return;
    setDeletingId(row.id);
    try {
      await apiDelete(`/api/admin/certificates/${row.id}`, { auth: true });
      toast.success("Certificate deleted.");
      await loadCertificates();
    } catch (error) {
      toast.error(userFriendlyErrorMessage(error, "Could not delete certificate."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <BrutalCard>
          <p className="text-4xl font-bold">{certificates.length}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total certificates issued</p>
        </BrutalCard>
        <BrutalCard>
          <p className="text-4xl font-bold">{stats.eventCount}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Events with certificates</p>
        </BrutalCard>
        <BrutalCard>
          <p className="text-4xl font-bold">{relativeTime(stats.lastImported)}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Last imported</p>
        </BrutalCard>
      </div>

      <BrutalCard>
        <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Import Certificates from CSV</h2>
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <BrutalButton
            type="button"
            onClick={() => downloadText(
              "dsc-certificates-template.csv",
              "required_email,required_name,required_certificate_id\nstudent@example.com,Full Name Here,DSC-2026-001\n"
            )}
          >
            <Download size={16} /> Download CSV Template
          </BrutalButton>
          <div className="border-2 border-[#171717] bg-[#F4EFEB] p-3 font-mono text-xs">
            Required headers: <b>required_email</b>, <b>required_name</b>, <b>required_certificate_id</b>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="relative">
            <BrutalInput
              label="Event"
              value={eventQuery}
              onFocus={loadEvents}
              onChange={(event: any) => {
                setEventQuery(event.target.value);
                setEventName(event.target.value);
                setEventId(null);
                loadEvents();
              }}
              placeholder="Search or type event name"
            />
            {eventQuery && (
              <div className="absolute z-20 -mt-3 w-full border-2 border-[#171717] bg-white brutal-shadow max-h-64 overflow-y-auto">
                {eventSuggestions.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      setEventId(event.id);
                      setEventName(event.title);
                      setEventQuery(event.title);
                    }}
                    className="block w-full border-b-2 border-[#171717] px-3 py-2 text-left text-xs font-bold uppercase hover:bg-[#FFE800]"
                  >
                    {event.title}
                  </button>
                ))}
                {!matchingEvents.length && events.length > 0 && (
                  <div className="border-b-2 border-[#171717] bg-[#F4EFEB] px-3 py-2 text-[10px] font-bold uppercase text-slate-500">
                    No exact match. Showing available events.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEventId(null);
                    setEventName(eventQuery);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs font-bold uppercase hover:bg-[#FFE800]"
                >
                  Use: {eventQuery}
                </button>
              </div>
            )}
          </div>
          <div>
            <BrutalInput
              label="Certificate Type"
              list="certificate-type-options"
              value={certificateType}
              onChange={(event: any) => setCertificateType(event.target.value)}
            />
            <datalist id="certificate-type-options">
              {certificateTypes.map((type) => <option key={type} value={type} />)}
            </datalist>
          </div>
          <BrutalInput
            label="Issued Date"
            type="date"
            value={issuedAt}
            onChange={(event: any) => setIssuedAt(event.target.value)}
          />
        </div>

        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-[#171717] bg-[#F4EFEB] p-8 text-center brutal-shadow-hover">
          <FileUp size={32} className="text-[#2563EB]" />
          <span className="font-bold uppercase tracking-widest">Upload CSV</span>
          <span className="font-mono text-xs text-slate-500">Click here and select a .csv file</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>

        {csvHeaders.length > 0 && (
          <div className="mt-5">
            {csvError ? (
              <div className="border-2 border-[#171717] bg-[#FB7185] p-3 text-sm font-bold text-white">{csvError}</div>
            ) : (
              <div className="flex items-center gap-2 border-2 border-[#171717] bg-[#DCFCE7] p-3 text-sm font-bold">
                <CheckCircle2 size={18} /> Columns look good
              </div>
            )}
            <p className="mt-3 font-mono text-sm">{csvRows.length} certificates ready to import</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[680px] border-2 border-[#171717] text-sm">
                <thead className="bg-[#171717] text-white">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Cert ID</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 5).map((row, index) => (
                    <tr key={`${row.required_certificate_id}-${index}`} className="border-t-2 border-[#171717]">
                      <td className="p-2">{row.required_name}</td>
                      <td className="p-2">{row.required_email}</td>
                      <td className="p-2 font-mono">{row.required_certificate_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importBlocker && (
          <p className="mt-4 border-2 border-[#171717] bg-[#FFE800] p-3 text-xs font-bold uppercase tracking-widest">
            {importBlocker}
          </p>
        )}
        <BrutalButton
          type="button"
          className={`mt-5 w-full ${!canImport || importing ? "cursor-not-allowed opacity-50 brutal-shadow-none hover:translate-x-0 hover:translate-y-0" : ""}`}
          color="bg-[#2563EB]"
          text="text-white"
          onClick={importCertificates}
          disabled={!canImport || importing}
        >
          {importing ? "Importing..." : `Import ${csvRows.length} Certificates`}
        </BrutalButton>
      </BrutalCard>

      <BrutalCard>
        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-3xl uppercase" style={fonts.display}>Certificate List</h2>
          <BrutalButton type="button" onClick={() => downloadCsv("dsc-certificates.csv", [
            ["certificate_id", "recipient_name", "recipient_email", "certificate_type", "event_name", "issued_at"],
            ...certificates.map((row) => [row.certificate_id, row.recipient_name, row.recipient_email, row.certificate_type, row.event_name, row.issued_at]),
          ])}>
            Export All as CSV
          </BrutalButton>
        </div>
        <BrutalInput
          label="Search"
          value={search}
          onChange={(event: any) => setSearch(event.target.value)}
          placeholder="Search by name, email, or certificate ID"
        />
        {loading ? (
          <p className="font-mono text-sm text-slate-500">Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <div className="border-2 border-dashed border-[#171717] p-8 text-center">
            <p className="font-bold uppercase tracking-widest text-sm">No certificates imported yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCertificates).map(([group, rows]) => (
              <div key={group}>
                <div className="mb-2 flex items-center gap-2">
                  <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{group}</BrutalBadge>
                  <span className="font-mono text-xs text-slate-500">{rows.length} certificate{rows.length === 1 ? "" : "s"}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-2 border-[#171717] text-sm">
                    <thead className="bg-[#171717] text-white">
                      <tr>
                        {["Certificate ID", "Recipient Name", "Email", "Type", "Event", "Issued Date", "Actions"].map((heading) => (
                          <th key={heading} className="p-2 text-left">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-t-2 border-[#171717]">
                          <td className="p-2 font-mono">{row.certificate_id}</td>
                          <td className="p-2">{row.recipient_name}</td>
                          <td className="p-2">{row.recipient_email}</td>
                          <td className="p-2">{row.certificate_type}</td>
                          <td className="p-2">{row.event_name}</td>
                          <td className="p-2">{row.issued_at ? new Date(row.issued_at).toLocaleDateString() : ""}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditRow({ ...row, issued_at: row.issued_at?.slice(0, 10) || "" })}
                              className="border-2 border-[#171717] bg-white px-3 py-1 font-bold uppercase hover:bg-[#FFE800]"
                            >
                              <Edit size={14} className="inline mr-1" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCertificate(row)}
                              disabled={deletingId === row.id}
                              className="border-2 border-[#171717] bg-[#FB7185] px-3 py-1 font-bold uppercase text-white hover:bg-[#F43F5E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={14} className="inline mr-1" /> {deletingId === row.id ? "Deleting" : "Delete"}
                            </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </BrutalCard>

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <BrutalCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-3xl uppercase" style={fonts.display}>Edit Certificate</h2>
              <button type="button" onClick={() => setEditRow(null)} className="border-2 border-[#171717] bg-white p-2">
                <X size={18} />
              </button>
            </div>
            <BrutalInput label="Recipient Name" value={editRow.recipient_name} onChange={(event: any) => setEditRow({ ...editRow, recipient_name: event.target.value })} />
            <BrutalInput label="Recipient Email" value={editRow.recipient_email} onChange={(event: any) => setEditRow({ ...editRow, recipient_email: event.target.value })} />
            <BrutalInput label="Certificate Type" value={editRow.certificate_type} onChange={(event: any) => setEditRow({ ...editRow, certificate_type: event.target.value })} />
            <BrutalInput label="Event Name" value={editRow.event_name} onChange={(event: any) => setEditRow({ ...editRow, event_name: event.target.value })} />
            <BrutalInput label="Issued Date" type="date" value={editRow.issued_at} onChange={(event: any) => setEditRow({ ...editRow, issued_at: event.target.value })} />
            <BrutalButton type="button" color="bg-[#2563EB]" text="text-white" className="w-full" onClick={saveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save Certificate"}
            </BrutalButton>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}
