import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { AppRoutes } from "./routes";
import { PageLoadingFallback } from "./styles/GlobalStyles";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const UpdatedAboutPage = lazy(() => import("../pages/UpdatedAboutPage").then((module) => ({ default: module.UpdatedAboutPage })));
const TeamPage = lazy(() => import("../pages/TeamPage").then((module) => ({ default: module.TeamPage })));
const MyCertificates = lazy(() => import("../pages/MyCertificates").then((module) => ({ default: module.MyCertificates })));
const CertificateVerifyPage = lazy(() => import("../pages/CertificateVerifyPage").then((module) => ({ default: module.CertificateVerifyPage })));
const ContactPage = lazy(() => import("../pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const ResourcesPage = lazy(() => import("../pages/ResourcesPage").then((module) => ({ default: module.ResourcesPage })));
const GalleryPage = lazy(() => import("../pages/GalleryPage").then((module) => ({ default: module.GalleryPage })));
const UserProfilePage = lazy(() => import("../pages/UserProfilePage").then((module) => ({ default: module.UserProfilePage })));
const AchievementsPage = lazy(() => import("../pages/AchievementsPage").then((module) => ({ default: module.AchievementsPage })));
const PartnersPage = lazy(() => import("../pages/PartnersPage").then((module) => ({ default: module.PartnersPage })));
const ComprehensiveAdminPanel = lazy(() => import("../pages/AdminPage").then((module) => ({ default: module.ComprehensiveAdminPanel })));
const EventsPage = lazy(() => import("../pages/EventsPage").then((module) => ({ default: module.EventsPage })));
const EventDetailPage = lazy(() => import("../pages/EventDetailPage").then((module) => ({ default: module.EventDetailPage })));
const EventProposalPage = lazy(() => import("../pages/EventProposalPage").then((module) => ({ default: module.EventProposalPage })));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage").then((module) => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import("../pages/ProjectDetailPage").then((module) => ({ default: module.ProjectDetailPage })));
const ProjectSubmissionPage = lazy(() => import("../pages/ProjectSubmissionPage").then((module) => ({ default: module.ProjectSubmissionPage })));
const BlogPage = lazy(() => import("../pages/BlogPage").then((module) => ({ default: module.BlogPage })));
const BlogDetailPage = lazy(() => import("../pages/BlogDetailPage").then((module) => ({ default: module.BlogDetailPage })));
const BlogEditorPage = lazy(() => import("../pages/BlogEditorPage").then((module) => ({ default: module.BlogEditorPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const TicketPage = lazy(() => import("../pages/TicketPage").then((module) => ({ default: module.TicketPage })));
const ScannerPage = lazy(() => import("../pages/ScannerPage").then((module) => ({ default: module.ScannerPage })));

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoadingFallback />}>
        <AppRoutes
          pages={{
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
          }}
        />
      </Suspense>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
