/**
 * New Pages for Data Science Club Website
 * 
 * PAGES INCLUDED:
 * 1. Certificate Page - View/download certificates
 * 2. Team Page - Leadership, faculty, members
 * 3. Contact Page - Form + info
 * 4. Resources Page - Learning materials
 * 5. Gallery Page - Event photos
 * 6. User Profile Page - View/edit profile
 * 7. Achievements Page - Club milestones
 * 8. Partners Page - Sponsors like Bisup
 * 
 * COMPONENTS:
 * - Comment System (for blogs & projects)
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Award, Download, Calendar, Check, Users, Mail, Phone, MapPin, Globe,
  BookOpen, Code, Database, TrendingUp, Image, User, Edit, Save, X,
  Trophy, Star, Target, Zap, Heart, MessageSquare, Send, ThumbsUp,
  FileText, ExternalLink, Search, Filter, ChevronDown, Shield, GraduationCap,
  UserCheck, Crown
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

// ─── Shared Components ─────────────────────────────────────────────────────────

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text = "text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

const BrutalInput = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <input
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
      {...props}
    />
  </div>
);

const BrutalTextarea = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-none"
      rows={4}
      {...props}
    />
  </div>
);

// ─── COMMENT SYSTEM COMPONENT ──────────────────────────────────────────────────

export function CommentSection({ itemId, itemType }: { itemId: string, itemType: "blog" | "project" }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Jane Smith",
      role: "Club Member",
      avatar: "JS",
      text: "Great work! This is exactly what we needed.",
      timestamp: "2 hours ago",
      likes: 5
    },
    {
      id: 2,
      author: "Dr. Ram Kumar",
      role: "Teacher",
      avatar: "RK",
      text: "Impressive analysis. Have you considered using ensemble methods?",
      timestamp: "5 hours ago",
      likes: 12
    },
    {
      id: 3,
      author: "Sita Thapa",
      role: "Club Member",
      avatar: "ST",
      text: "Love the visualizations! Can you share the code?",
      timestamp: "1 day ago",
      likes: 8
    }
  ]);

  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: "You",
      role: "Member",
      avatar: "YO",
      text: newComment,
      timestamp: "Just now",
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const getRoleBadge = (role: string) => {
    if (role === "Teacher") {
      return <BrutalBadge color="bg-[#7C3AED]" className="text-[8px]">TEACHER</BrutalBadge>;
    }
    if (role === "Club Member") {
      return <BrutalBadge color="bg-[#2563EB]" className="text-[8px]">CLUB MEMBER</BrutalBadge>;
    }
    return <BrutalBadge color="bg-slate-400" className="text-[8px]">MEMBER</BrutalBadge>;
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={24} />
        <h3 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <BrutalCard className="mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full border-2 border-[#171717] p-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-none mb-4"
            rows={3}
          />
          <div className="flex justify-end">
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="text-sm">
              <Send size={14} className="inline mr-2" /> Post Comment
            </BrutalButton>
          </div>
        </form>
      </BrutalCard>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <BrutalCard key={comment.id}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-bold text-sm">{comment.author}</span>
                  {getRoleBadge(comment.role)}
                  <span className="text-xs text-slate-400 font-mono">• {comment.timestamp}</span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors">
                    <ThumbsUp size={14} />
                    {comment.likes}
                  </button>
                  <button className="text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

// ─── 1. CERTIFICATE PAGE ───────────────────────────────────────────────────────

export function CertificatePage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCertificates() {
      if (!isSupabaseConfigured || !supabase) {
        setCertificates([]);
        setIsLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!userData.user) {
        navigate("/login?redirect=/certificates");
        return;
      }

      const { data, error } = await supabase
        .from("certificates")
        .select("id,title,certificate_type,issuer_name,status,issued_at,certificate_url,thumbnail_url,description")
        .eq("recipient_id", userData.user.id)
        .order("issued_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setLoadError(error.message);
        setCertificates([]);
      } else {
        setCertificates(data || []);
      }
      setIsLoading(false);
    }

    loadCertificates();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleDownload = (cert: any) => {
    if (cert.certificate_url) {
      window.open(cert.certificate_url, "_blank", "noopener,noreferrer");
      return;
    }
    alert("Certificate file has not been uploaded yet.");
  };

  const availableCertificates = certificates.filter(c => c.status === "approved" || c.status === "published");
  const pendingCertificates = certificates.filter(c => c.status === "pending" || c.status === "submitted");
  const workshopCertificates = certificates.filter(c => c.certificate_type === "Workshop");
  const competitionCertificates = certificates.filter(c => c.certificate_type === "Competition");

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-flex items-center gap-1">
          <Award size={10} /> YOUR ACHIEVEMENTS
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Certificates
        </h1>
        <p className="text-lg text-slate-600">
          Download your completion certificates and showcase your achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <BrutalCard color="bg-[#2563EB]" className="text-white text-center">
          <div className="text-4xl font-bold mb-1" style={fonts.display}>
            {availableCertificates.length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-80">Available</div>
        </BrutalCard>
        <BrutalCard color="bg-[#FFE800]" className="text-center">
          <div className="text-4xl font-bold mb-1" style={fonts.display}>
            {pendingCertificates.length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Pending</div>
        </BrutalCard>
        <BrutalCard color="bg-[#FB7185]" className="text-white text-center">
          <div className="text-4xl font-bold mb-1" style={fonts.display}>
            {workshopCertificates.length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-80">Workshops</div>
        </BrutalCard>
        <BrutalCard color="bg-[#7C3AED]" className="text-white text-center">
          <div className="text-4xl font-bold mb-1" style={fonts.display}>
            {competitionCertificates.length}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-80">Competitions</div>
        </BrutalCard>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Loading your certificates...</p>
        </BrutalCard>
      ) : loadError ? (
        <BrutalCard color="bg-[#FB7185]" className="text-white">
          <p className="font-bold">Could not load certificates.</p>
          <p className="font-mono text-sm opacity-90 mt-2">{loadError}</p>
        </BrutalCard>
      ) : certificates.length === 0 ? (
        <BrutalCard color="bg-white" className="text-center">
          <Award size={40} className="mx-auto mb-4 text-[#2563EB]" />
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>No Certificates Yet</h3>
          <p className="text-slate-600 max-w-xl mx-auto">
            Certificates issued by the club will appear here after workshops, competitions, or approved activities.
          </p>
        </BrutalCard>
      ) : (
      <div className="grid md:grid-cols-2 gap-6">
        {certificates.map((cert) => {
          const isAvailable = cert.status === "approved" || cert.status === "published";
          return (
          <BrutalCard key={cert.id} color="bg-white">
            <div className="aspect-video bg-slate-200 border-2 border-[#171717] mb-4 overflow-hidden">
              {cert.thumbnail_url ? (
                <img src={cert.thumbnail_url} alt={cert.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#FFE800] flex items-center justify-center">
                  <Award size={56} className="text-[#171717]" />
                </div>
              )}
            </div>
            <div className="flex items-start justify-between mb-3">
              <BrutalBadge color={isAvailable ? "bg-green-500" : "bg-[#FFE800]"} text={isAvailable ? "text-white" : "text-[#171717]"}>
                {isAvailable ? "Available" : "Pending"}
              </BrutalBadge>
              <BrutalBadge color="bg-[#2563EB]">{cert.certificate_type}</BrutalBadge>
            </div>
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{cert.title}</h3>
            <div className="space-y-1 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span className="font-mono">{cert.issued_at || "Date pending"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{cert.issuer_name}</span>
              </div>
            </div>
            <BrutalButton
              color={isAvailable ? "bg-[#2563EB]" : "bg-slate-300"}
              text={isAvailable ? "text-white" : "text-slate-500"}
              className="w-full text-sm"
              onClick={() => handleDownload(cert)}
              disabled={!isAvailable}
            >
              <Download size={14} className="inline mr-2" />
              {isAvailable ? (cert.certificate_url ? "Download PDF" : "File Pending") : "Not Available Yet"}
            </BrutalButton>
          </BrutalCard>
          );
        })}
      </div>
      )}

      {/* Info Box */}
      <BrutalCard color="bg-[#F4EFEB]" className="mt-12">
        <div className="flex items-start gap-4">
          <Award size={24} className="flex-shrink-0 text-[#2563EB]" />
          <div>
            <h3 className="text-lg font-bold mb-2">How to Earn Certificates</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                <span>Complete workshops with at least 80% attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                <span>Participate in competitions and submit projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                <span>Certificates are processed within 7 days after event completion</span>
              </li>
            </ul>
          </div>
        </div>
      </BrutalCard>
    </div>
  );
}

// ─── 2. TEAM PAGE ──────────────────────────────────────────────────────────────

export function TeamPage() {
  const executives = [
    {
      name: "Jane Smith",
      position: "President",
      year: "4th Year",
      major: "Computer Science",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Leading the club towards innovation and excellence in data science.",
      linkedin: "https://linkedin.com/in/janesmith",
      github: "https://github.com/janesmith"
    },
    {
      name: "Sita Thapa",
      position: "Vice President",
      year: "3rd Year",
      major: "Statistics",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Passionate about machine learning and community building.",
      linkedin: "https://linkedin.com/in/sitathapa",
      github: "https://github.com/sitathapa"
    },
    {
      name: "Hari Prasad",
      position: "Secretary",
      year: "3rd Year",
      major: "Mathematics",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      bio: "Organizing events and workshops to empower our members.",
      linkedin: "https://linkedin.com/in/hariprasad",
      github: "https://github.com/hariprasad"
    }
  ];

  const faculty = [
    {
      name: "Dr. Ram Kumar",
      position: "Faculty Advisor",
      department: "School of Mathematical Sciences",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      expertise: "Machine Learning, Statistical Analysis",
      email: "ram.kumar@sms.tu.edu.np"
    },
    {
      name: "Prof. Maya Singh",
      position: "Co-Advisor",
      department: "Computer Science",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      expertise: "Data Visualization, Deep Learning",
      email: "maya.singh@sms.tu.edu.np"
    }
  ];

  return (
    <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 text-center">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <Users size={10} /> OUR TEAM
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Meet The Team
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          The passionate individuals driving our mission to empower students through data science
        </p>
      </div>

      {/* Executive Board */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl uppercase mb-8" style={fonts.display}>
          Executive Board
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {executives.map((exec, idx) => (
            <BrutalCard key={idx} color="bg-white">
              <div className="aspect-square bg-slate-200 border-2 border-[#171717] mb-4 overflow-hidden">
                <img src={exec.image} alt={exec.name} className="w-full h-full object-cover" />
              </div>
              <BrutalBadge color="bg-[#2563EB]" className="mb-3">{exec.position}</BrutalBadge>
              <h3 className="text-2xl font-bold uppercase mb-1" style={fonts.display}>{exec.name}</h3>
              <p className="text-sm text-slate-600 mb-1">{exec.year} • {exec.major}</p>
              <p className="text-sm text-slate-700 mb-4 italic">{exec.bio}</p>
              <div className="flex gap-2 pt-4 border-t-2 border-slate-200">
                <a
                  href={exec.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-[#171717] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all"
                >
                  <ExternalLink size={16} />
                </a>
                <a
                  href={exec.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-[#171717] bg-[#171717] text-white hover:bg-[#000] transition-all"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </BrutalCard>
          ))}
        </div>
      </div>

      {/* Faculty Advisors */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl uppercase mb-8" style={fonts.display}>
          Faculty Advisors
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faculty.map((fac, idx) => (
            <BrutalCard key={idx} color="bg-[#7C3AED]" className="text-white">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-white border-2 border-[#171717] overflow-hidden flex-shrink-0">
                  <img src={fac.image} alt={fac.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <BrutalBadge color="bg-white" text="text-[#171717]" className="mb-2 text-[8px]">
                    {fac.position}
                  </BrutalBadge>
                  <h3 className="text-2xl font-bold uppercase mb-1" style={fonts.display}>{fac.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{fac.department}</p>
                  <p className="text-xs opacity-80 mb-2">{fac.expertise}</p>
                  <a href={`mailto:${fac.email}`} className="text-xs font-mono opacity-80 hover:opacity-100 underline">
                    {fac.email}
                  </a>
                </div>
              </div>
            </BrutalCard>
          ))}
        </div>
      </div>

      {/* Team Photo */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl uppercase mb-8" style={fonts.display}>
          Our Community
        </h2>
        <BrutalCard color="bg-white" className="p-0 overflow-hidden">
          <div className="aspect-video bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop"
              alt="Team Photo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Data Science Club Family</h3>
            <p className="text-sm text-slate-600">
              Our incredible community at the Annual Data Science Summit 2024. Together, we're building the future of data-driven innovation.
            </p>
          </div>
        </BrutalCard>
      </div>

      {/* Join CTA */}
      <BrutalCard color="bg-[#FFE800]" className="text-center">
        <h3 className="text-3xl uppercase mb-4" style={fonts.display}>Want to Join Our Team?</h3>
        <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
          We're always looking for passionate individuals to help lead our community. Applications open at the start of each semester.
        </p>
        <BrutalButton
          color="bg-[#171717]"
          text="text-white"
          onClick={() => alert("Sorry, currently we're not accepting applications. We'll announce it when we'll accept it.")}
        >
          Apply Now
        </BrutalButton>
      </BrutalCard>
    </div>
  );
}

// ─── 3. CONTACT PAGE ───────────────────────────────────────────────────────────

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };
  
  const faqs = [
    {
      question: "How do I become a member?",
      answer: "Simply register on our website using any valid email address. Once registered, you can attend events, submit projects, and access exclusive resources. To become a verified Club Member, attend at least 3 events and submit one project."
    },
    {
      question: "Are events free for members?",
      answer: "Yes! All our workshops, talks, and regular events are completely free for registered members. Some special competitions may have nominal registration fees to cover logistics."
    },
    {
      question: "Do I need prior experience in data science?",
      answer: "Not at all! We welcome students from all backgrounds and skill levels. We have beginner-friendly workshops and resources to help you get started, as well as advanced sessions for experienced members."
    },
    {
      question: "How often do you organize events?",
      answer: "We typically organize 2-3 events per month, including workshops, guest lectures, hackathons, and social gatherings. Check our Events page for the latest schedule."
    },
    {
      question: "Can I collaborate on projects with other members?",
      answer: "Absolutely! We encourage collaboration. You can find teammates through our Discord server, project boards, or at our events. Many of our featured projects are team efforts."
    },
    {
      question: "What tools and technologies do you focus on?",
      answer: "We primarily focus on Python (NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch), R, SQL, and data visualization tools. We also cover ML/AI concepts, statistics, and real-world applications."
    },
    {
      question: "How can I contribute to the club?",
      answer: "There are many ways to contribute! Attend events, submit projects, help organize workshops, create content, mentor juniors, or apply for leadership positions. We value every contribution."
    },
    {
      question: "Do you offer certificates?",
      answer: "Yes! We provide completion certificates for workshops (with 80%+ attendance), competition participation, and project submissions. Certificates are available in your dashboard."
    }
  ];
  
  const FAQItem = ({ question, answer, isOpen, onClick }: any) => (
    <div className="border-2 border-[#171717] mb-4">
      <button
        onClick={onClick}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F4EFEB] transition-all text-left"
      >
        <span className="font-bold uppercase tracking-wide text-sm pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-[#F4EFEB] border-t-2 border-[#171717]">
          <p className="text-sm text-slate-700">{answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <Mail size={10} /> GET IN TOUCH
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Contact Form */}
        <BrutalCard>
          <h2 className="text-2xl uppercase mb-6" style={fonts.display}>Send Message</h2>
          <form onSubmit={handleSubmit}>
            <BrutalInput
              label="Your Name"
              type="text"
              value={formData.name}
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <BrutalInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <BrutalInput
              label="Subject"
              type="text"
              value={formData.subject}
              onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <BrutalTextarea
              label="Message"
              value={formData.message}
              onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full">
              <Send size={16} className="inline mr-2" /> Send Message
            </BrutalButton>
          </form>
        </BrutalCard>

        {/* Contact Info */}
        <div className="space-y-6">
          <BrutalCard color="bg-[#2563EB]" className="text-white">
            <div className="flex items-start gap-4">
              <Mail size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>Email</h3>
                <a href="mailto:contact@datascienceclub.sms.tu.edu.np" className="font-mono text-sm hover:underline">
                  contact@datascienceclub.sms.tu.edu.np
                </a>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard color="bg-[#7C3AED]" className="text-white">
            <div className="flex items-start gap-4">
              <Phone size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>Phone</h3>
                <a href="tel:+97714331976" className="font-mono text-sm hover:underline">
                  +977-1-4331976
                </a>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard color="bg-[#FB7185]" className="text-white">
            <div className="flex items-start gap-4">
              <MapPin size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>Address</h3>
                <p className="text-sm">
                  School of Mathematical Sciences<br />
                  Tribhuvan University<br />
                  Kirtipur, Kathmandu, Nepal
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard color="bg-[#FFE800]">
            <div className="flex items-start gap-4">
              <Globe size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>Office Hours</h3>
                <p className="text-sm text-slate-700">
                  Monday - Friday: 9:00 AM - 5:00 PM<br />
                  Saturday: 10:00 AM - 2:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>

      {/* Google Maps */}
      <BrutalCard className="p-0 overflow-hidden mb-12">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.0918791469647!2d85.28493631506186!3d27.678573882795844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19b579d7078b%3A0xa67876f87a8b2f8!2sTribhuvan%20University!5e0!3m2!1sen!2snp!4v1234567890123!5m2!1sen!2snp"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Data Science Club Location"
        />
      </BrutalCard>
      
      {/* FAQ Section */}
      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare size={32} />
          <h2 className="text-4xl md:text-5xl uppercase" style={fonts.display}>
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-lg text-slate-600 mb-8">
          Everything you need to know about joining and participating in our community
        </p>
        
        <div>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            />
          ))}
        </div>

        <BrutalCard color="bg-[#2563EB]" className="mt-8 text-white text-center">
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>Still Have Questions?</h3>
          <p className="mb-4 opacity-90">
            Feel free to use the contact form above or reach out directly. We're here to help!
          </p>
        </BrutalCard>
      </div>
    </div>
  );
}

// ─── 4. RESOURCES PAGE ─────────────────────────────────────────────────────────

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
      if (!isSupabaseConfigured || !supabase) return;
      const { data } = await supabase
        .from("learning_materials")
        .select("id,title,description,resource_url,category,status,created_at")
        .in("status", ["approved", "published"])
        .order("created_at", { ascending: false });
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
    PDF: "bg-[#2563EB]",
    Video: "bg-[#FB7185]",
    Link: "bg-[#FFE800]",
    Notebook: "bg-[#7C3AED]",
  };
  const typeTextColors: Record<string, string> = {
    PDF: "text-white",
    Video: "text-white",
    Link: "text-[#171717]",
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
      <div className="mb-12 border-b-4 border-[#171717] pb-8">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <BookOpen size={10} /> LEARNING MATERIALS
        </BrutalBadge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl uppercase leading-none mb-2" style={fonts.display}>Resources</h1>
            <p className="text-slate-600 font-mono text-sm">{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              { val: resources.reduce((s, r) => s + r.downloads, 0).toLocaleString(), label: "Total Downloads", color: "bg-[#2563EB]" },
              { val: resources.length.toString(), label: "Total Resources", color: "bg-[#FB7185]" },
            ].map(s => (
              <div key={s.label} className={`${s.color} border-2 border-[#171717] px-6 py-3 text-white`}>
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
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="popular">Most Downloaded</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex gap-2 flex-wrap">
          {["all", "beginner", "intermediate", "advanced"].map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                selectedCategory === cat ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {cat === "all" ? "All Levels" : cat}
            </button>
          ))}
        </div>
        <div className="w-px bg-[#171717] mx-1 hidden sm:block" />
        <div className="flex gap-2 flex-wrap">
          {["all", "PDF", "Video", "Notebook", "Link"].map(type => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                selectedType === type ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
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
                    color={resource.category === "beginner" ? "bg-green-500" : resource.category === "intermediate" ? "bg-[#FFE800]" : "bg-[#FB7185]"}
                    text={resource.category === "intermediate" ? "text-[#171717]" : "text-white"}
                  >
                    {resource.category.toUpperCase()}
                  </BrutalBadge>
                </div>
                <BrutalBadge color={typeColors[resource.type] || "bg-[#2563EB]"} text={typeTextColors[resource.type] || "text-white"}>
                  {resource.type}
                </BrutalBadge>
              </div>
              <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{resource.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{resource.description}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  {resource.size && <span>{resource.size}</span>}
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {resource.downloads.toLocaleString()}
                  </span>
                </div>
                <BrutalButton
                  color="bg-[#2563EB]"
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
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
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
            Next →
          </button>
        </div>
      )}

      {/* External Links */}
      <div className="mt-16">
        <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Recommended Platforms</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <BrutalCard color="bg-[#FB7185]" className="text-white text-center">
            <Code size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Kaggle</h3>
            <p className="text-sm mb-4 opacity-90">Competitions & Datasets</p>
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#FB7185] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit Kaggle
            </a>
          </BrutalCard>
          <BrutalCard color="bg-[#7C3AED]" className="text-white text-center">
            <Database size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Coursera</h3>
            <p className="text-sm mb-4 opacity-90">Online Courses</p>
            <a href="https://coursera.org" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#7C3AED] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit Coursera
            </a>
          </BrutalCard>
          <BrutalCard color="bg-[#2563EB]" className="text-white text-center">
            <TrendingUp size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>GitHub</h3>
            <p className="text-sm mb-4 opacity-90">Code Repositories</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#2563EB] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit GitHub
            </a>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
}

// Continue with Gallery, Profile, Achievements, and Partners pages...
// (Character limit reached - will continue in next section)
