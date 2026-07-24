import React, { useEffect, useState } from "react";
import { BookOpen, Code, Database, Download, Search, TrendingUp } from "lucide-react";
import { apiGet } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge } from "../components/ui";
import { fonts } from "../config/fonts";


export function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadLearningMaterials() {
      const data = await apiGet<any[]>("/api/learning-materials").catch(() => []);
      if (!mounted) return;
      setResources((data || []).map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category?.toLowerCase() || "beginner",
        type: "Link",
        description: item.description || "Learning material added by the club.",
        size: null,
        downloads: 0,
        date: item.created_at ? item.created_at.slice(0, 10) : "",
        url: item.resource_url,
      })));
    }
    loadLearningMaterials();
    return () => {
      mounted = false;
    };
  }, []);

  const typeColors: Record<string, string> = {
    PDF: "bg-primary",
    Video: "bg-secondary",
    Link: "bg-highlight",
    Notebook: "bg-violet-600",
  };
  const typeTextColors: Record<string, string> = {
    PDF: "text-white",
    Video: "text-white",
    Link: "text-foreground",
    Notebook: "text-white",
  };

  const filtered = resources
    .filter(r => {
      const matchesCat = selectedCategory === "all" || r.category === selectedCategory;
      const matchesType = selectedType === "all" || r.type === selectedType;
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "popular") return b.downloads - a.downloads;
      if (sortOrder === "newest") return b.date.localeCompare(a.date);
      if (sortOrder === "oldest") return a.date.localeCompare(b.date);
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b-4 border-foreground pb-8">
        <BrutalBadge color="bg-primary" className="mb-4 inline-flex items-center gap-1">
          <BookOpen size={10} /> LEARNING MATERIALS
        </BrutalBadge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl uppercase leading-none mb-2" style={fonts.display}>Resources</h1>
            <p className="text-muted-foreground font-mono text-sm">{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              { val: resources.reduce((s, r) => s + r.downloads, 0).toLocaleString(), label: "Total Downloads", color: "bg-primary" },
              { val: resources.length.toString(), label: "Total Resources", color: "bg-secondary" },
            ].map(s => (
              <div key={s.label} className={`${s.color} border-2 border-foreground px-6 py-3 text-white`}>
                <div className="text-2xl font-bold" style={fonts.display}>{s.val}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-foreground p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-foreground font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="popular">Most Downloaded</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A â Z</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex gap-2 flex-wrap">
          {["all", "beginner", "intermediate", "advanced"].map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); resetPage(); }}
              className={`px-4 py-2 border-2 border-foreground font-bold uppercase tracking-widest text-xs transition-all ${
                selectedCategory === cat ? "bg-primary text-white" : "bg-white hover:bg-background"
              }`}
            >
              {cat === "all" ? "All Levels" : cat}
            </button>
          ))}
        </div>
        <div className="w-px bg-foreground mx-1 hidden sm:block" />
        <div className="flex gap-2 flex-wrap">
          {["all", "PDF", "Video", "Notebook", "Link"].map(type => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); resetPage(); }}
              className={`px-4 py-2 border-2 border-foreground font-bold uppercase tracking-widest text-xs transition-all ${
                selectedType === type ? "bg-foreground text-white" : "bg-white hover:bg-background"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-foreground">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>No resources found</p>
          <p className="text-sm font-mono text-slate-400 mt-2">Admin-added learning materials will appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {paginated.map(resource => (
            <BrutalCard key={resource.id} color="bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <BrutalBadge
                    color={resource.category === "beginner" ? "bg-green-500" : resource.category === "intermediate" ? "bg-highlight" : "bg-secondary"}
                    text={resource.category === "intermediate" ? "text-foreground" : "text-white"}
                  >
                    {resource.category.toUpperCase()}
                  </BrutalBadge>
                </div>
                <BrutalBadge color={typeColors[resource.type] || "bg-primary"} text={typeTextColors[resource.type] || "text-white"}>
                  {resource.type}
                </BrutalBadge>
              </div>
              <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{resource.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{resource.description}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  {resource.size && <span>{resource.size}</span>}
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {resource.downloads.toLocaleString()}
                  </span>
                </div>
                <BrutalButton
                  color="bg-primary"
                  text="text-white"
                  className="text-xs px-4 py-2"
                  onClick={() => {
                    if ((resource as any).url) window.open((resource as any).url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Download size={12} className="inline mr-1" />
                  {resource.type === "Link" ? "Open" : "Download"}
                </BrutalButton>
              </div>
            </BrutalCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-foreground font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-background transition-all"
          >
            â Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-foreground font-bold text-sm transition-all ${
                currentPage === page ? "bg-primary text-white" : "bg-white hover:bg-background"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-foreground font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-background transition-all"
          >
            Next â
          </button>
        </div>
      )}

      {/* External Links */}
      <div className="mt-16">
        <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Recommended Platforms</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <BrutalCard color="bg-secondary" className="text-white text-center">
            <Code size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Kaggle</h3>
            <p className="text-sm mb-4 opacity-90">Competitions & Datasets</p>
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-secondary border-2 border-foreground font-bold uppercase text-xs hover:bg-background transition-all">
              Visit Kaggle
            </a>
          </BrutalCard>
          <BrutalCard color="bg-violet-600" className="text-white text-center">
            <Database size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Coursera</h3>
            <p className="text-sm mb-4 opacity-90">Online Courses</p>
            <a href="https://coursera.org" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-violet-600 border-2 border-foreground font-bold uppercase text-xs hover:bg-background transition-all">
              Visit Coursera
            </a>
          </BrutalCard>
          <BrutalCard color="bg-primary" className="text-white text-center">
            <TrendingUp size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>GitHub</h3>
            <p className="text-sm mb-4 opacity-90">Code Repositories</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-primary border-2 border-foreground font-bold uppercase text-xs hover:bg-background transition-all">
              Visit GitHub
            </a>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
}
