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

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProject() {
      if (!isSupabaseConfigured || !supabase || !id) {
        setProject(null);
        setLoadingProject(false);
        return;
      }
      const query = supabase
        .from("projects")
        .select("id,slug,title,category,technologies,summary,content,thumbnail_url,published_at,status")
        .in("status", ["approved", "published"]);
      const isUuid = /^[0-9a-f-]{36}$/i.test(id);
      const { data } = isUuid
        ? await query.eq("id", id).maybeSingle()
        : await query.eq("slug", id).maybeSingle();
      if (!mounted) return;
      setProject(data);
      setLoadingProject(false);
    }
    loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {loadingProject ? (
        <BrutalCard><p className="font-mono text-sm text-slate-500">Loading project...</p></BrutalCard>
      ) : !project ? (
        <BrutalCard><p className="font-bold uppercase">Project not found or not published yet.</p></BrutalCard>
      ) : (
        <>
        <div className="w-full aspect-video bg-[#2563EB] border-4 border-[#171717] brutal-shadow-lg mb-12 flex items-center justify-center overflow-hidden">
          {project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <h1 className="text-5xl md:text-8xl text-white uppercase text-center p-8" style={fonts.display}>{project.title}</h1>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {(project.technologies?.length ? project.technologies : [project.category || "Project"]).map((tag: string) => (
            <BrutalBadge key={tag}>{tag}</BrutalBadge>
          ))}
        </div>

        <div className="prose prose-lg max-w-none text-[#171717]">
          <p className="text-2xl font-serif italic mb-8">{project.summary || "Project details will be updated soon."}</p>
          <div className="whitespace-pre-wrap text-base leading-relaxed">{project.content || project.summary}</div>
        </div>
        </>
      )}
    </div>
  );
}
