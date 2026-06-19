import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Database, Users, ArrowRight, ArrowLeft, Search, Camera, Check, Calendar, MapPin, Tag, QrCode, Trophy, TrendingUp, Bell, Zap, Target, Star, Award, Clock, BookOpen, Code, GitBranch, Home, Mail, UserCheck, GraduationCap, User, FileText } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { getPersistenceLabel, publishBlogPost, submitEventProposal, submitProject } from "../lib/contentApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalField, BrutalTextArea } from "../components/ui/brutal";
import { requireLoginForAction } from "../utils/authNavigation";
import { fonts } from "../config/fonts";

export function EventProposalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    type: "WORKSHOP",
    proposedDate: "",
    proposedTime: "",
    venue: "",
    capacity: "40",
    host: "",
    coordinators: "",
    summary: "",
    prerequisites: "",
    outcomes: "",
  });
  const [status, setStatus] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const submitProposal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingProposal) return;
    if (!(await requireLoginForAction(navigate, "/events/propose"))) return;
    if (!form.title.trim() || !form.summary.trim() || !form.host.trim()) {
      setStatus("Title, host, and summary are required before submitting.");
      return;
    }
    const coordinatorEmails = form.coordinators
      .split(/[,\n]/)
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean);
    const invalidCoordinator = coordinatorEmails.find((email: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidCoordinator) {
      setStatus(`Invalid coordinator email: ${invalidCoordinator}`);
      return;
    }
    try {
      setSubmittingProposal(true);
      const result = await submitEventProposal({
        title: form.title,
        event_type: form.type,
        proposed_date: form.proposedDate || null,
        proposed_time: form.proposedTime || null,
        venue: form.venue,
        capacity: Number(form.capacity) || null,
        host: form.host,
        coordinator_emails: coordinatorEmails,
        summary: form.summary,
        prerequisites: form.prerequisites,
        outcomes: form.outcomes,
        status: "pending",
      });
      setStatus(`Event proposal submitted. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit proposal. Please check the fields and try again."));
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-block">Event Proposal</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Propose Event</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Suggest a workshop, seminar, competition, or community session for Data Science Club.</p>
      </div>

      <form onSubmit={submitProposal} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Event Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Intro to Computer Vision" />
            <BrutalField label="Event Type" value={form.type} onChange={(value) => updateField("type", value)} placeholder="Workshop, seminar, competition..." />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <BrutalField label="Proposed Date" type="date" value={form.proposedDate} onChange={(value) => updateField("proposedDate", value)} />
            <BrutalField label="Time" type="time" value={form.proposedTime} onChange={(value) => updateField("proposedTime", value)} />
            <BrutalField label="Capacity" type="number" value={form.capacity} onChange={(value) => updateField("capacity", value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Venue" value={form.venue} onChange={(value) => updateField("venue", value)} placeholder="SMS Lab 3" />
            <BrutalField label="Host / Speaker" value={form.host} onChange={(value) => updateField("host", value)} placeholder="Your name or proposed speaker" />
          </div>

          <BrutalTextArea
            label="Event Coordinators"
            rows={3}
            value={form.coordinators}
            onChange={(value) => updateField("coordinators", value)}
            placeholder="Add coordinator emails, separated by commas or new lines. Non-members are allowed."
          />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="What is this event about and who should attend?" />
          <BrutalTextArea label="Prerequisites" rows={4} value={form.prerequisites} onChange={(value) => updateField("prerequisites", value)} placeholder="Python basics, laptop required, dataset links..." />
          <BrutalTextArea label="Expected Outcomes" rows={5} value={form.outcomes} onChange={(value) => updateField("outcomes", value)} placeholder="Students will build..., understand..., submit..." />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Proposal Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">{form.type}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Event title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your event summary preview will appear here."}</p>
              <div className="mt-4 text-xs font-mono text-slate-500">
                {form.proposedDate || "Date TBD"} {form.proposedTime && `at ${form.proposedTime}`} � {form.venue || "Venue TBD"}
              </div>
            </div>
            <p className="mt-4 text-xs font-mono text-slate-700">Submissions are saved to the online review queue.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingProposal}>
              {submittingProposal ? "Submitting..." : "Submit Proposal"}
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}
