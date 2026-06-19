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

export function BlogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      setLoadingPosts(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllPosts([]);
        setLoadingPosts(false);
        return;
      }
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title,summary,tags,content,cover_image_url,published_at,status,profiles:author_id(full_name,email)")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      setAllPosts((data || []).map((post) => {
        const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const date = post.published_at;
        const words = `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          date: date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "",
          dateSort: date ? new Date(date).toISOString().slice(0, 10) : "",
          category: (post.tags?.[0] || "NEWS").toUpperCase(),
          author: author?.full_name || author?.email || "Club Member",
          readTime: `${Math.max(1, Math.ceil(words / 220))} min`,
          excerpt: post.summary || post.content?.slice(0, 180) || "Post details will be updated soon.",
          coverImageUrl: post.cover_image_url,
        };
      }));
      setLoadingPosts(false);
    }
    loadPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ["all", ...Array.from(new Set(allPosts.map((post) => post.category)))];
  const categoryColors: Record<string, string> = {
    TUTORIAL: "bg-[#2563EB]",
    EVENT: "bg-[#FB7185]",
    DESIGN: "bg-[#7C3AED]",
    NEWS: "bg-[#FFE800] text-[#171717]",
    OPINION: "bg-[#171717]",
  };

  const filtered = allPosts
    .filter(p => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.dateSort.localeCompare(a.dateSort);
      if (sortOrder === "oldest") return a.dateSort.localeCompare(b.dateSort);
      if (sortOrder === "readtime") return parseInt(a.readTime) - parseInt(b.readTime);
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
          <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Club Blog</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <BrutalButton
          color="bg-[#171717]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/blog/write")}
        >
          Write a Post
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts by title, author, or content..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#171717]/20 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="readtime">Shortest Read</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); resetPage(); }}
            className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
              activeCategory === cat
                ? "bg-[#171717] text-white"
                : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {cat === "all" ? "All Posts" : cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingPosts ? "Loading posts" : "No posts found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingPosts ? "Please wait..." : "Published blog posts will appear here after review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-0 border-2 border-[#171717]">
          {paginated.map((post, i) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/blog/${post.slug || post.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/blog/${post.slug || post.id}`);
                }
              }}
              className={`p-8 cursor-pointer group hover:bg-[#171717] hover:text-white transition-all border-[#171717] ${
                i % 2 === 0 && i < paginated.length - 1 ? "border-r-2" : ""
              } ${i < paginated.length - 2 ? "border-b-2" : ""} ${
                paginated.length % 2 !== 0 && i === paginated.length - 1 ? "md:col-span-2 md:border-r-0" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 border-2 border-[#171717] text-[9px] font-bold uppercase tracking-widest group-hover:border-white/50 ${
                  categoryColors[post.category] || "bg-[#2563EB] text-white"
                }`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white/60">{post.readTime} read</span>
              </div>
              <h2
                className="text-2xl md:text-3xl uppercase leading-tight mb-3 group-hover:text-white transition-colors"
                style={fonts.display}
              >
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 group-hover:text-white/80 mb-6 transition-colors" style={fonts.sans}>
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400 group-hover:text-white/60">
                  {post.author} � {post.date}
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
