import React from "react";
import { Route, Routes } from "react-router-dom";
import { NewLoginPage } from "./AuthAndAdmin";
import { AdminRoute } from "./auth/AdminRoute";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./layout/Layout";

type RouteComponent = React.ComponentType;

export type AppRoutePages = {
  HomePage: RouteComponent;
  UpdatedAboutPage: RouteComponent;
  EventsPage: RouteComponent;
  EventProposalPage: RouteComponent;
  EventDetailPage: RouteComponent;
  ProjectsPage: RouteComponent;
  ProjectSubmissionPage: RouteComponent;
  ProjectDetailPage: RouteComponent;
  BlogPage: RouteComponent;
  BlogDetailPage: RouteComponent;
  BlogEditorPage: RouteComponent;
  DashboardPage: RouteComponent;
  ComprehensiveAdminPanel: RouteComponent;
  MyCertificates: RouteComponent;
  CertificateVerifyPage: RouteComponent;
  TeamPage: RouteComponent;
  ContactPage: RouteComponent;
  ResourcesPage: RouteComponent;
  GalleryPage: RouteComponent;
  UserProfilePage: RouteComponent;
  AchievementsPage: RouteComponent;
  PartnersPage: RouteComponent;
  TicketPage: RouteComponent;
  ScannerPage: RouteComponent;
};

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
        <Route index element={<HomePage />} />
        <Route path="about" element={<UpdatedAboutPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/propose" element={<EventProposalPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/submit" element={<ProjectSubmissionPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:id" element={<BlogDetailPage />} />
        <Route path="blog/write" element={<BlogEditorPage />} />
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="admin" element={<AdminRoute><ComprehensiveAdminPanel /></AdminRoute>} />
        <Route path="admin/:adminTab" element={<AdminRoute><ComprehensiveAdminPanel /></AdminRoute>} />
        <Route path="certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
        <Route path="verify" element={<CertificateVerifyPage />} />
        <Route path="verify/:code" element={<CertificateVerifyPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="ticket" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="ticket/:ticketId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="tickets" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="tickets/:ticketId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
      </Route>

      <Route path="/login" element={<NewLoginPage />} />
      <Route path="/register" element={<NewLoginPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
    </Routes>
  );
}
