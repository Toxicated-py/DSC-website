import React from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import { NewLoginPage } from "../components/auth/AuthAndAdmin";
import { AdminRoute } from "./auth/AdminRoute";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "../components/layout/Layout";
import type { AppRoutePages } from "../types/routes";

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] px-6 py-24 text-center">
      <h1 className="text-4xl font-black uppercase tracking-tight">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">This page does not exist or has moved.</p>
      <a href="/" className="mt-6 inline-flex border-2 border-[#171717] bg-[#FFE800] px-5 py-3 text-xs font-bold uppercase tracking-widest">
        Back Home
      </a>
    </div>
  );
}

function PageTitle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Helmet>
        <title>{title} — Data Sarathi</title>
      </Helmet>
      {children}
    </>
  );
}

export function AppRoutes({ pages }: { pages: AppRoutePages }) {
  const {
    HomePage,
    UpdatedAboutPage,
    EventsPage,
    EventProposalPage,
    EventDetailPage,
    ProjectsPage,
    ProjectSubmissionPage,
    ProjectDetailPage,
    BlogPage,
    BlogDetailPage,
    BlogEditorPage,
    DashboardPage,
    ComprehensiveAdminPanel,
    MyCertificates,
    CertificateVerifyPage,
    TeamPage,
    ContactPage,
    ResourcesPage,
    GalleryPage,
    UserProfilePage,
    AchievementsPage,
    PartnersPage,
    TicketPage,
    ScannerPage,
  } = pages;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PageTitle title="Home"><HomePage /></PageTitle>} />
        <Route path="about" element={<PageTitle title="About"><UpdatedAboutPage /></PageTitle>} />
        <Route path="events" element={<PageTitle title="Events"><EventsPage /></PageTitle>} />
        <Route path="events/propose" element={<PageTitle title="Propose Event"><EventProposalPage /></PageTitle>} />
        <Route path="events/:id" element={<PageTitle title="Event"><EventDetailPage /></PageTitle>} />
        <Route path="projects" element={<PageTitle title="Projects"><ProjectsPage /></PageTitle>} />
        <Route path="projects/submit" element={<PageTitle title="Submit Project"><ProjectSubmissionPage /></PageTitle>} />
        <Route path="projects/:id" element={<PageTitle title="Project"><ProjectDetailPage /></PageTitle>} />
        <Route path="blog" element={<PageTitle title="Blog"><BlogPage /></PageTitle>} />
        <Route path="blog/write" element={<PageTitle title="Write Blog"><BlogEditorPage /></PageTitle>} />
        <Route path="blog/:id" element={<PageTitle title="Blog Post"><BlogDetailPage /></PageTitle>} />
        <Route path="dashboard" element={<PageTitle title="Dashboard"><ProtectedRoute><DashboardPage /></ProtectedRoute></PageTitle>} />
        <Route path="admin" element={<PageTitle title="Admin"><AdminRoute><ComprehensiveAdminPanel /></AdminRoute></PageTitle>} />
        <Route path="admin/:adminTab" element={<PageTitle title="Admin"><AdminRoute><ComprehensiveAdminPanel /></AdminRoute></PageTitle>} />
        <Route path="certificates" element={<PageTitle title="Certificates"><ProtectedRoute><MyCertificates /></ProtectedRoute></PageTitle>} />
        <Route path="verify" element={<PageTitle title="Verify Certificate"><CertificateVerifyPage /></PageTitle>} />
        <Route path="verify/:code" element={<PageTitle title="Verify Certificate"><CertificateVerifyPage /></PageTitle>} />
        <Route path="team" element={<PageTitle title="Team"><TeamPage /></PageTitle>} />
        <Route path="contact" element={<PageTitle title="Contact"><ContactPage /></PageTitle>} />
        <Route path="resources" element={<PageTitle title="Resources"><ResourcesPage /></PageTitle>} />
        <Route path="gallery" element={<PageTitle title="Gallery"><GalleryPage /></PageTitle>} />
        <Route path="profile" element={<PageTitle title="Profile"><ProtectedRoute><UserProfilePage /></ProtectedRoute></PageTitle>} />
        <Route path="achievements" element={<PageTitle title="Achievements"><ProtectedRoute><AchievementsPage /></ProtectedRoute></PageTitle>} />
        <Route path="partners" element={<PageTitle title="Partners"><PartnersPage /></PageTitle>} />
        <Route path="ticket" element={<PageTitle title="Tickets"><ProtectedRoute><TicketPage /></ProtectedRoute></PageTitle>} />
        <Route path="ticket/:ticketId" element={<PageTitle title="Ticket"><ProtectedRoute><TicketPage /></ProtectedRoute></PageTitle>} />
        <Route path="tickets" element={<PageTitle title="Tickets"><ProtectedRoute><TicketPage /></ProtectedRoute></PageTitle>} />
        <Route path="tickets/:ticketId" element={<PageTitle title="Ticket"><ProtectedRoute><TicketPage /></ProtectedRoute></PageTitle>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/login" element={<PageTitle title="Login"><NewLoginPage /></PageTitle>} />
      <Route path="/register" element={<PageTitle title="Register"><NewLoginPage /></PageTitle>} />
      <Route path="/scanner" element={<PageTitle title="Scanner"><AdminRoute><ScannerPage /></AdminRoute></PageTitle>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
