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

export function BlogEditorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    tags: "",
    coverImage: "",
    content: "## Introduction\n\nWrite your post here...\n",
  });
  const [preview, setPreview] = useState(true);
  const [status, setStatus] = useState("");
  const [publishingPost, setPublishingPost] = useState(false);
  const [authorName, setAuthorName] = useState("Member");

  useEffect(() => {
    let mounted = true;
    async function loadAuthorName() {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.email ||
        "Member";
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setAuthorName(profile?.full_name || profile?.email || fallbackName);
    }

    loadAuthorName();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const publishPostForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publishingPost) return;
    if (!(await requireLoginForAction(navigate, "/blog/write"))) return;
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setStatus("Title, summary, and content are required before submitting.");
      return;
    }
    try {
      setPublishingPost(true);
      const result = await publishBlogPost({
        title: form.title,
        summary: form.summary,
        tags: form.tags.split(",").map((item: string) => item.trim()).filter(Boolean),
        cover_image_url: form.coverImage || null,
        content: form.content,
        status: "submitted",
      });
      setStatus(`Post submitted for admin review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit post. Please check the fields and try again."));
    } finally {
      setPublishingPost(false);
    }
  };

  const previewTags = form.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
  const previewBlocks = String(form.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const previewWords = `${form.summary || ""} ${form.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
  const previewReadTime = `${Math.max(1, Math.ceil(previewWords / 220))} min read`;
  const previewDate = new Date().toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog Editor</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Write a Post</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Draft, preview, and publish club updates, tutorials, and event recaps.</p>
      </div>

      <form onSubmit={publishPostForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <BrutalField label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Building Data Sarathi: A Neo-Brutalist Case Study" />
          <BrutalTextArea label="Summary" rows={3} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="Short excerpt for the blog listing." />
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Tags" value={form.tags} onChange={(value) => updateField("tags", value)} placeholder="Tutorial, Event, NLP" />
            <BrutalField label="Cover Image URL" value={form.coverImage} onChange={(value) => updateField("coverImage", value)} placeholder="https://..." />
          </div>
          <BrutalTextArea label="Markdown Content" rows={18} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl uppercase" style={fonts.display}>{preview ? "Final Preview" : "Preview"}</h2>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="px-3 py-2 border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold uppercase tracking-widest"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <article className="space-y-5">
                <div className="border-b-4 border-[#171717] pb-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(previewTags.length ? previewTags : ["Blog"]).map((tag: string) => (
                      <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
                    ))}
                  </div>
                  <h3 className="text-4xl md:text-5xl uppercase leading-none mb-4" style={fonts.display}>
                    {form.title || "Post Title"}
                  </h3>
                  <p className="text-lg text-slate-700" style={fonts.serif}>
                    {form.summary || "Post summary preview."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    <span>{authorName}</span>
                    <span>{previewDate}</span>
                    <span>{previewReadTime}</span>
                  </div>
                </div>

                {form.coverImage && (
                  <div className="border-2 border-[#171717] brutal-shadow overflow-hidden bg-[#2563EB]">
                    <img loading="lazy" src={form.coverImage} alt={form.title || "Blog cover"} className="w-full max-h-56 object-cover" />
                  </div>
                )}

                <div className="space-y-4 text-base leading-7 text-[#171717]" style={fonts.serif}>
                  {(previewBlocks.length ? previewBlocks : ["Write your post here..."]).map((block: string, index: number) => {
                    if (block.startsWith("## ")) {
                      return <h4 key={index} className="pt-2 text-2xl md:text-3xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h4>;
                    }
                    if (block.startsWith("# ")) {
                      return <h4 key={index} className="pt-2 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h4>;
                    }
                    return <p key={index} className="whitespace-pre-line">{block}</p>;
                  })}
                </div>
              </article>
            ) : (
              <p className="text-sm font-mono text-slate-700">Use preview to inspect your title, summary, tags, and markdown before publishing.</p>
            )}
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full" disabled={publishingPost}>
              {publishingPost ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

// BrutalField and BrutalTextArea imported from `./components/ui/brutal`
