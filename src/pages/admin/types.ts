import type { SiteSettings } from "../../lib/siteSettings";

export type AdminTabItem = Record<string, any>;

export type AdminTabContext = Record<string, any> & {
  activeBlogs: AdminTabItem[];
  activeEvents: AdminTabItem[];
  activePartners: AdminTabItem[];
  activeProjects: AdminTabItem[];
  approvedGallery: AdminTabItem[];
  archivedBlogs: AdminTabItem[];
  archivedEvents: AdminTabItem[];
  archivedPartners: AdminTabItem[];
  contactMessages: AdminTabItem[];
  contentStatusStats: AdminTabItem[];
  eventUtilization: AdminTabItem[];
  filteredAuditLogs: AdminTabItem[];
  filteredUsers: AdminTabItem[];
  learningMaterials: AdminTabItem[];
  memberGrowth: AdminTabItem[];
  pendingBlogs: AdminTabItem[];
  pendingEventProposals: AdminTabItem[];
  pendingGallery: AdminTabItem[];
  pendingProjects: AdminTabItem[];
  pastEvents: AdminTabItem[];
  popularEvents: AdminTabItem[];
  projects: AdminTabItem[];
  recentAuditLogs: AdminTabItem[];
  rejectedEventProposals: AdminTabItem[];
  rejectedGallery: AdminTabItem[];
  rejectedProjects: AdminTabItem[];
  eventProposals: AdminTabItem[];
  siteSettings: SiteSettings;
  users: AdminTabItem[];
};
