import type React from "react";

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
  PartnersPage: RouteComponent;
  TicketPage: RouteComponent;
  ScannerPage: RouteComponent;
};
