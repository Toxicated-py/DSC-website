/**
 * Additional New Pages - Part 2
 *
 * 5. Gallery Page
 * 6. User Profile Page
 * 7. Achievements Page
 * 8. Partners Page
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image, User, Edit, Save, Trophy, Star, Award, Target, Heart, Search, X, ChevronLeft, ChevronRight,
  Calendar, MapPin, Mail, Github, Linkedin, ExternalLink, Zap,
  TrendingUp, Users, Code, BookOpen, Shield, Crown, GraduationCap, UserCheck, Handshake
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";


import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

// âââ 5. GALLERY PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function AchievementsPage() {
  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-flex items-center gap-1">
          <Trophy size={10} /> OUR JOURNEY
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Achievements
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Celebrating our milestones and the incredible journey of our Data Science community
        </p>
      </div>

      <BrutalCard color="bg-white" className="text-center">
        <Trophy size={48} className="mx-auto mb-4 text-[#FFE800]" />
        <h2 className="text-3xl uppercase mb-3" style={fonts.display}>No achievements published yet</h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Verified club achievements will appear here after they are added by the admin team.
        </p>
      </BrutalCard>

      {/* Future Goals */}
      <BrutalCard color="bg-[#2563EB]" className="text-white text-center mt-16">
        <Target size={48} className="mx-auto mb-4" />
        <h3 className="text-3xl uppercase mb-4" style={fonts.display}>What's Next?</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Follow our events, projects, and announcements to see what the community is building next.
        </p>
        <BrutalButton color="bg-white" text="text-[#2563EB]">
          Join Our Journey
        </BrutalButton>
      </BrutalCard>
    </div>
  );
}

// âââ 8. PARTNERS PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
