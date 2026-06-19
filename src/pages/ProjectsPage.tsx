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

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllProjects([]);
        setLoadingProjects(false);
        return;
      }
      const { data } = await supabase
        .from("projects")
        .select("id,slug,title,category,technologies,summary,published_at,submitted_at,status")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      const styles = [
        { color: "bg-[#F4EFEB]", text: "text-[#171717]" },
        { color: "bg-[#2563EB]", text: "text-white" },
        { color: "bg-[#FB7185]", text: "text-white" },
        { color: "bg-[#FFE800]", text: "text-[#171717]" },
        { color: "bg-[#7C3AED]", text: "text-white" },
        { color: "bg-[#171717]", text: "text-white" },
      ];
      setAllProjects((data || []).map((project, index) => {
        const style = styles[index % styles.length];
        const date = project.published_at || project.submitted_at;
        return {
          id: project.id,
          slug: project.slug,
          title: project.title,
          tags: project.technologies?.length ? project.technologies : [project.category || "Project"],
          author: "Club Member",
          year: date ? new Date(date).getFullYear() : new Date().getFullYear(),
          color: style.color,
          text: style.text,
          desc: project.summary || "Project details will be updated soon.",
        };
      }));
      setLoadingProjects(false);
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const allTags = ["all", ...Array.from(new Set(allProjects.flatMap((project) => project.tags)))];

  const filtered = allProjects
    .filter(p => {
      const matchesTag = activeTag === "all" || p.tags.includes(activeTag);
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.year - a.year || b.id.localeCompare(a.id);
      if (sortOrder === "oldest") return a.year - b.year || a.id.localeCompare(b.id);
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#171717] pb-8 mb-10 gap-6">
        <div>
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Student Projects</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Showcase</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <BrutalButton
          color="bg-[#FB7185]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/projects/submit")}
        >
          Submit Project
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, description, or tech..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A ? Z</option>
        </select>
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); resetPage(); }}
            className={`px-3 py-1.5 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] transition-all ${
              activeTag === tag ? "bg-[#FB7185] text-white" : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {tag === "all" ? "All Tech" : tag}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingProjects ? "Loading projects" : "No projects found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingProjects ? "Please wait..." : "Published projects will appear here after admin review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(proj => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.slug || proj.id}`)}
              className={`cursor-pointer border-2 border-[#171717] flex flex-col brutal-shadow brutal-shadow-hover transition-all group ${proj.color} ${proj.text}`}
            >
              <div className="w-full aspect-video border-b-2 border-[#171717] relative overflow-hidden flex items-center justify-center bg-black/10">
                <Database size={48} className="opacity-20" />
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/20 border border-white/30 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">{proj.year}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold uppercase leading-tight mb-2" style={fonts.display}>{proj.title}</h3>
                <p className="text-xs font-mono opacity-70 mb-3">By {proj.author}</p>
                <p className="text-sm opacity-80 leading-relaxed mb-4 flex-1" style={fonts.sans}>{proj.desc}</p>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-current/20">
                  {proj.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 border border-current/30 bg-white/10 text-[9px] font-bold uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ? Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next ?
          </button>
        </div>
      )}
    </div>
  );
}
