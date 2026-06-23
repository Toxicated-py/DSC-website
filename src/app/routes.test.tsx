import React from "react";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "./routes";
import type { AppRoutePages } from "../types/routes";

const Page = ({ name }: { name: string }) => <div>{name}</div>;

const pages: AppRoutePages = {
  HomePage: () => <Page name="home" />,
  UpdatedAboutPage: () => <Page name="about" />,
  EventsPage: () => <Page name="events" />,
  EventProposalPage: () => <Page name="event proposal" />,
  EventDetailPage: () => <Page name="event detail" />,
  ProjectsPage: () => <Page name="projects" />,
  ProjectSubmissionPage: () => <Page name="project submission" />,
  ProjectDetailPage: () => <Page name="project detail" />,
  BlogPage: () => <Page name="blog list" />,
  BlogDetailPage: () => <Page name="blog detail" />,
  BlogEditorPage: () => <Page name="blog editor" />,
  DashboardPage: () => <Page name="dashboard" />,
  ComprehensiveAdminPanel: () => <Page name="admin" />,
  MyCertificates: () => <Page name="certificates" />,
  CertificateVerifyPage: () => <Page name="verify" />,
  TeamPage: () => <Page name="team" />,
  ContactPage: () => <Page name="contact" />,
  ResourcesPage: () => <Page name="resources" />,
  GalleryPage: () => <Page name="gallery" />,
  UserProfilePage: () => <Page name="profile" />,
  PartnersPage: () => <Page name="partners" />,
  TicketPage: () => <Page name="ticket" />,
  ScannerPage: () => <Page name="scanner" />,
};

describe("AppRoutes", () => {
  it("matches /blog/write before the blog detail route", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/blog/write"]}>
          <AppRoutes pages={pages} />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText("blog editor")).toBeInTheDocument();
    expect(screen.queryByText("blog detail")).not.toBeInTheDocument();
  });
});
