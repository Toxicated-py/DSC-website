import React from "react";
import { Link } from "react-router-dom";
import { fonts } from "../config/fonts";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-2 border-[#171717] bg-white p-5 md:p-6 brutal-shadow">
    <h2 className="text-2xl uppercase text-[#171717]" style={fonts.display}>{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700" style={fonts.sans}>{children}</div>
  </section>
);

function LegalShell({ label, title, intro, children }: { label: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F4EFEB] px-4 py-28 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-8 inline-flex text-sm font-bold uppercase tracking-widest text-[#2563EB] hover:text-[#171717]">
          Back Home
        </Link>
        <div className="mb-10">
          <span className="inline-flex border-2 border-[#171717] bg-[#FFE800] px-3 py-1 text-xs font-bold uppercase tracking-widest">
            {label}
          </span>
          <h1 className="mt-4 text-5xl uppercase leading-none text-[#171717] md:text-7xl" style={fonts.display}>{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 md:text-lg" style={fonts.sans}>{intro}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">Last updated: June 23, 2026</p>
        </div>
        <div className="space-y-5">{children}</div>
      </div>
    </main>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalShell
      label="Privacy"
      title="Privacy Policy"
      intro="This policy explains how Data Science Club, School of Mathematical Sciences, Tribhuvan University handles information submitted through this website."
    >
      <Section title="Information We Collect">
        <p>We may collect your name, email address, phone number, institution, profile details, event registrations, ticket information, certificate records, contact messages, and content you submit such as projects, blogs, or gallery uploads.</p>
      </Section>
      <Section title="How We Use It">
        <p>We use this information to manage club membership, event registration, ticket scanning, certificate verification, admin moderation, contact replies, and website security.</p>
      </Section>
      <Section title="Login And Services">
        <p>The website may use Supabase for authentication, database, and storage. If Google login is enabled, Google provides authentication information such as your name, email address, and profile picture according to Google's consent flow.</p>
      </Section>
      <Section title="Sharing">
        <p>We do not sell personal data. Information is shared only with authorized club administrators, event managers where needed, and service providers required to run the website.</p>
      </Section>
      <Section title="Your Choices">
        <p>You can contact the club to request correction or removal of your personal information where reasonable and permitted by club record needs, event records, and certificate verification requirements.</p>
      </Section>
      <Section title="Contact">
        <p>For privacy questions, contact the Data Science Club through the <Link to="/contact" className="font-bold text-[#2563EB]">contact page</Link>.</p>
      </Section>
    </LegalShell>
  );
}

export function TermsOfServicePage() {
  return (
    <LegalShell
      label="Terms"
      title="Terms Of Service"
      intro="These terms describe the basic rules for using the official Data Science Club website."
    >
      <Section title="Use Of The Website">
        <p>Use the website for legitimate club, academic, event, project, and community purposes. Do not misuse forms, scanner tools, admin areas, or certificate verification features.</p>
      </Section>
      <Section title="Accounts">
        <p>You are responsible for the information submitted through your account. Admin-only and event-manager features are restricted and may be changed or revoked by the club.</p>
      </Section>
      <Section title="Events And Tickets">
        <p>Event registration depends on capacity, deadlines, eligibility, and organizer decisions. Tickets and QR codes are for the registered participant or team and should not be misused.</p>
      </Section>
      <Section title="Submitted Content">
        <p>Projects, blogs, gallery uploads, and proposals should be your own work or content you have permission to share. The club may review, edit, reject, or remove submissions from public pages.</p>
      </Section>
      <Section title="Certificates">
        <p>Certificate records are issued by authorized club admins. Public verification is limited to confirming certificate validity and basic certificate details.</p>
      </Section>
      <Section title="Changes">
        <p>The club may update these terms as the website and club operations change. Continued use of the website means you accept the latest version.</p>
      </Section>
    </LegalShell>
  );
}
