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
const fonts = {
  display: { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0" },
  sans: { fontFamily: "'Inter', sans-serif" },
  serif: { fontFamily: "'Newsreader', serif" },
};

export function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPost() {
      setLoadingPost(true);
      if (!id || !isSupabaseConfigured || !supabase) {
        setPost(null);
        setLoadingPost(false);
        return;
      }

      const query = supabase
        .from("blog_posts")
        .select("id,slug,title,summary,tags,cover_image_url,content,published_at,status,profiles:author_id(full_name,email)")
        .in("status", ["approved", "published"]);
      const isUuid = /^[0-9a-f-]{36}$/i.test(id);
      const { data } = isUuid
        ? await query.eq("id", id).maybeSingle()
        : await query.eq("slug", id).maybeSingle();

      if (!mounted) return;
      setPost(data);
      setLoadingPost(false);
    }
    loadPost();
    return () => {
      mounted = false;
    };
  }, [id]);

  const author = post ? (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) : null;
  const words = post ? `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = `${Math.max(1, Math.ceil(words / 220))} min read`;
  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" })
    : "";
  const paragraphs = String(post?.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      {loadingPost ? (
        <BrutalCard color="bg-white">
          <p className="font-bold uppercase tracking-widest text-sm">Loading post...</p>
        </BrutalCard>
      ) : !post ? (
        <BrutalCard color="bg-white">
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Not Found</BrutalBadge>
          <h1 className="text-4xl md:text-6xl uppercase mb-4" style={fonts.display}>Post unavailable</h1>
          <p className="text-slate-600">This post is not published yet or has been removed.</p>
        </BrutalCard>
      ) : (
        <article>
          <div className="border-b-4 border-[#171717] pb-8 mb-8">
            <div className="flex flex-wrap gap-2 mb-5">
              {(post.tags || ["Blog"]).map((tag: string) => (
                <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
              ))}
            </div>
            <h1 className="text-5xl md:text-8xl uppercase leading-none mb-5" style={fonts.display}>{post.title}</h1>
            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl" style={fonts.serif}>{post.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-500">
              <span>{author?.full_name || author?.email || "Data Science Club"}</span>
              <span>{publishedDate}</span>
              <span>{readTime}</span>
            </div>
          </div>

          {post.cover_image_url && (
            <div className="mb-10 border-2 border-[#171717] brutal-shadow-lg overflow-hidden bg-[#2563EB]">
              <img src={post.cover_image_url} alt={post.title} className="w-full max-h-[480px] object-cover" />
            </div>
          )}

          <BrutalCard color="bg-white" className="max-w-none">
            <div className="space-y-6 text-lg leading-8 text-[#171717]" style={fonts.serif}>
              {paragraphs.map((block, index) => {
                if (block.startsWith("## ")) {
                  return <h2 key={index} className="pt-4 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h2>;
                }
                if (block.startsWith("# ")) {
                  return <h2 key={index} className="pt-4 text-4xl md:text-5xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h2>;
                }
                return <p key={index} className="whitespace-pre-line">{block}</p>;
              })}
            </div>
          </BrutalCard>
        </article>
      )}
    </div>
  );
}
