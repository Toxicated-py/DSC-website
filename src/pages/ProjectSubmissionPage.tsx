import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


import { getPersistenceLabel, submitProject } from "../lib/contentApi";

import { userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalField, BrutalTextArea } from "../components/ui/brutal";
import { requireLoginForAction } from "../utils/authNavigation";
import { fonts } from "../config/fonts";

export function ProjectSubmissionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "Machine Learning",
    team: "",
    technologies: "",
    summary: "",
    thumbnailUrl: "",
    content: "# Problem\n\n# Methodology\n\n# Results\n",
  });
  const [status, setStatus] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const submitProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingProject) return;
    if (!(await requireLoginForAction(navigate, "/projects/submit"))) return;
    if (!form.title.trim() || !form.summary.trim()) {
      setStatus("Add a title and short summary before submitting.");
      return;
    }
    try {
      setSubmittingProject(true);
      const result = await submitProject({
        title: form.title,
        category: form.category,
        team: form.team,
        technologies: form.technologies.split(",").map((item: string) => item.trim()).filter(Boolean),
        summary: form.summary,
        thumbnail_url: form.thumbnailUrl || null,
        content: form.content,
        status: "submitted",
      });
      setStatus(`Project submitted for review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit project. Please check the fields and try again."));
    } finally {
      setSubmittingProject(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/projects")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Project Submission</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Submit Project</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Create a full project case study for the public gallery and submit it to the online review queue.</p>
      </div>

      <form onSubmit={submitProjectForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Project Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Kathmandu Air Quality Predictor" />
            <BrutalField label="Category" value={form.category} onChange={(value) => updateField("category", value)} placeholder="Machine Learning" />
          </div>
          <BrutalField label="Team Members" value={form.team} onChange={(value) => updateField("team", value)} placeholder="S. Sharma, B. Thapa" />
          <BrutalField label="Technologies" value={form.technologies} onChange={(value) => updateField("technologies", value)} placeholder="Python, XGBoost, Streamlit" />
          <BrutalField label="Project Image URL" value={form.thumbnailUrl} onChange={(value) => updateField("thumbnailUrl", value)} placeholder="https://..." />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="A 2-3 sentence summary for the gallery card." />
          <BrutalTextArea label="Full Case Study Markdown" rows={14} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4 mb-4">
              {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" className="mb-4 aspect-video w-full border-2 border-[#171717] object-cover" />}
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FB7185]">{form.category || "Category"}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Project title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your summary preview will appear here."}</p>
            </div>
            <p className="text-xs font-mono text-slate-700">Submissions are saved to the online review queue.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#FB7185]" text="text-white" className="w-full" disabled={submittingProject}>
              {submittingProject ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}
