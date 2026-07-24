import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Code, GitBranch, MapPin, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { BrutalButton, BrutalBadge } from "../components/ui";
import { apiGet } from "../lib/apiClient";
import { defaultSiteSettings, loadSiteSettings } from "../lib/siteSettings";
import { fonts } from "../config/fonts";
import { defaultViewport, fadeIn, fadeUp, prefersReducedMotion, slideLeft, slideRight, staggerContainer } from "../utils/animations";

const workCards = [
  {
    title: "Workshops",
    body: "We run sessions where you actually touch the data. Python, ML, SQL, visualization - hands-on, beginner-friendly, and taught by experts.",
    color: "bg-primary text-white",
    icon: <BookOpen size={28} />,
  },
  {
    title: "Hackathons",
    body: "Build something real in 48 hours with people you just met. No perfect setup needed - just curiosity, a laptop, and pressure that turns ideas into projects.",
    color: "bg-highlight text-foreground",
    icon: <Trophy size={28} />,
  },
  {
    title: "Student Projects",
    body: "Have an idea? Bring it. We help you scope it, find teammates, and ship it. Student ideas deserve more than a notebook.",
    color: "bg-secondary text-white",
    icon: <Code size={28} />,
  },
  {
    title: "Open Resources",
    body: "Every cheat sheet, dataset, and workshop recording we produce is shared for members. We learn in the open.",
    color: "bg-violet-600 text-white",
    icon: <BookOpen size={28} />,
  },
];

const identityCards = [
  {
    title: "Led by students",
    body: "Every event, every decision, every project - driven by students. We are not waiting for permission to learn.",
    icon: <Users size={22} />,
  },
  {
    title: "Open by default",
    body: "Our projects are public on GitHub. Our resources are free. If we learned it, we share it.",
    icon: <GitBranch size={22} />,
  },
  {
    title: "Rooted at SMS TU",
    body: "We are from Kirtipur - but the datasets we work with, the problems we tackle, and the skills we build are relevant everywhere.",
    icon: <MapPin size={22} />,
  },
];

export function HomePage() {
  const [homeSettings, setHomeSettings] = useState(defaultSiteSettings.home);
  const [homeEvents, setHomeEvents] = useState<any[]>([]);
  const [homeProject, setHomeProject] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function loadHomePageData() {
      const [summary, settings] = await Promise.all([
        apiGet<any>("/api/home-summary").catch(() => null),
        loadSiteSettings(),
      ]);

      if (!mounted) return;

      setHomeSettings(settings.home);
      const eventSource: any[] = summary?.upcoming_events?.length ? summary.upcoming_events : [summary?.next_event];
      const events = eventSource.filter(Boolean)
        .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
        .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")))
        .slice(0, 8);
      const colors = ["bg-primary", "bg-secondary", "bg-foreground", "bg-violet-600"];
      setHomeEvents(events.map((event, index) => {
        const start = event.start_time ? new Date(event.start_time) : null;
        return {
          id: event.id,
          slug: event.slug,
          num: start ? start.toLocaleDateString(undefined, { day: "2-digit" }) : "--",
          month: start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }).toUpperCase() : "DATE TBD",
          label: event.title,
          type: (event.event_type || "EVENT").toUpperCase(),
          time: start ? start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "TIME TBD",
          capacity: event.capacity,
          registeredCount: event.registeredCount || event.registered_count || 0,
          color: colors[index % colors.length],
        };
      }));
      setHomeProject(summary?.featured_project || null);
    }

    loadHomePageData();

    return () => {
      mounted = false;
    };
  }, []);

  const heroTitleLines = homeSettings.brandTitle.split(/\s+/).filter(Boolean);
  const nextEvent = homeEvents[0];

  return (
    <>
      <section className="relative overflow-hidden border-y-2 border-foreground bg-background">
        <div className="pointer-events-none absolute left-0 top-0 h-[430px] w-[720px] max-w-[90vw] bg-lavender/80" style={{ clipPath: "polygon(0 0, 88% 0, 100% 76%, 0 58%)" }} />
        <div className="pointer-events-none absolute left-0 top-0 h-[380px] w-[610px] max-w-[84vw] bg-white/60" style={{ clipPath: "polygon(0 0, 82% 0, 74% 100%, 0 80%)" }} />

        <div className="relative mx-auto max-w-[1450px] px-5 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="min-w-0">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <h1
                  className="relative max-w-[760px] text-6xl leading-[0.84] text-foreground sm:text-7xl md:text-[7.5rem] lg:text-[8.5rem] xl:text-[10rem]"
                  style={{ ...fonts.display, textShadow: "6px 6px 0 var(--color-primary), 12px 12px 0 var(--color-secondary)" }}
                >
                  {heroTitleLines.map((line, index) => (
                    <motion.span key={`${line}-${index}`} variants={fadeUp} className="block">
                      {line}
                    </motion.span>
                  ))}
                </h1>
              </motion.div>

              <div className="mt-8 max-w-2xl border-t-2 border-foreground pt-6">
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
                  className="text-xl leading-snug text-foreground sm:text-2xl"
                  style={fonts.serif}
                >
                  <em className="text-secondary">Sarathi</em> means guide. We are the student community at SMS TU that turns data science <em className="text-primary">from theory into practice.</em>
                </motion.p>
                <p className="mt-4 font-mono text-sm text-muted-foreground">Open to all students at SMS, TU.</p>
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
                  className="mt-6 flex flex-wrap gap-4"
                >
                  <Link to="/events"><BrutalButton color="bg-white">See Events</BrutalButton></Link>
                  <Link to="/about"><BrutalButton color="bg-foreground" text="text-white">Our Story</BrutalButton></Link>
                </motion.div>
              </div>
            </div>

            <motion.div
              variants={slideRight}
              initial="hidden"
              animate="visible"
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4 }}
              className="grid min-w-0 gap-4 lg:pt-4"
            >
              <Link
                to={nextEvent ? `/events/${nextEvent.slug || nextEvent.id}` : "/events"}
                className="block border-2 border-foreground bg-white p-5 brutal-shadow -rotate-1 transition-transform hover:-translate-y-1"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Next Up</span>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl leading-none text-primary" style={fonts.display}>{nextEvent?.num || "--"}</p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-widest text-muted-foreground">{nextEvent?.month || "No event yet"}</p>
                  </div>
                  <BrutalBadge color="bg-primary">{nextEvent?.type || "Event"}</BrutalBadge>
                </div>
                <p className="mt-5 text-xl uppercase text-foreground" style={fonts.display}>{nextEvent?.label || "No events yet"}</p>
                <p className="mt-2 flex items-center gap-2 font-mono text-sm text-slate-400">
                  <Users size={16} /> {nextEvent?.capacity ? `${nextEvent.registeredCount || 0}/${nextEvent.capacity} spots` : "Club event"}
                </p>
              </Link>

              <Link
                to={homeProject ? `/projects/${homeProject.slug || homeProject.id}` : "/projects"}
                className="block border-2 border-foreground bg-violet-600 p-5 text-white brutal-shadow rotate-1 transition-transform hover:-translate-y-1"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Projects</span>
                <p className="mt-4 text-2xl uppercase" style={fonts.display}>{homeProject?.title || "No projects yet"}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(homeProject?.technologies?.length ? homeProject.technologies : [homeProject?.category || "Admin approved"]).map((tag: string) => (
                    <span key={tag} className="border border-white/40 bg-white/10 px-3 py-1 text-xs font-bold uppercase">{tag}</span>
                  ))}
                </div>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80">
                  View Project <ArrowRight size={16} />
                </p>
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-[1450px] px-5 sm:px-8 md:px-12 lg:px-16">
          <BrutalBadge color="bg-secondary">What we do</BrutalBadge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_620px] lg:items-end">
            <motion.h2
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="max-w-[520px] text-5xl leading-[0.92] text-foreground sm:text-6xl lg:text-7xl"
              style={fonts.display}
            >
              THEORY ENDS IN CLASS.
            </motion.h2>
            <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
              Everything real - the projects, the collaboration, the skills that actually get you hired - starts here.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-10 grid border-2 border-foreground md:grid-cols-2 xl:grid-cols-4"
          >
            {workCards.map((card, index) => (
              <motion.div key={card.title} variants={fadeUp} className={`${card.color} min-h-[240px] border-b-2 border-foreground p-6 last:border-b-0 md:border-r-2 ${index % 2 === 1 ? "md:border-r-0" : ""} xl:border-b-0 xl:border-r-2 xl:last:border-r-0`}>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center border-2 border-current/40">{card.icon}</div>
                <h3 className="text-2xl uppercase" style={fonts.display}>{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed opacity-85">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-foreground py-16 text-white md:py-20">
        <div className="mx-auto max-w-[1450px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <BrutalBadge color="bg-highlight" text="text-foreground">Upcoming</BrutalBadge>
              <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={defaultViewport} className="mt-5 text-5xl leading-none sm:text-6xl lg:text-7xl" style={fonts.display}>EVENTS</motion.h2>
            </div>
            <Link to="/events" className="hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/55 hover:text-white sm:flex">
              All Events <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid border-2 border-white/15 md:grid-cols-3">
            {homeEvents.length ? homeEvents.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug || event.id}`}
                className="min-h-[220px] border-b-2 border-white/15 p-6 transition-colors hover:bg-white/5 md:border-b-0 md:border-r-2 md:last:border-r-0"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-6xl leading-none" style={fonts.display}>{event.num}</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/45">{event.month}</p>
                  </div>
                  <BrutalBadge color={event.color} text="text-white" className="text-xs">{event.type}</BrutalBadge>
                </div>
                <h3 className="mt-8 text-2xl uppercase" style={fonts.display}>{event.label}</h3>
                <p className="mt-3 font-mono text-sm text-white/50">{event.time}</p>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50">
                  Register <ArrowRight size={15} />
                </p>
              </Link>
            )) : (
              <div className="p-8 md:col-span-3">
                <p className="text-3xl uppercase" style={fonts.display}>No published events yet.</p>
                <p className="mt-2 font-mono text-sm text-white/50">New exicting events will be available soon.</p>
              </div>
            )}
          </div>

          <Link to="/events" className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white sm:hidden">
            All Events <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <BrutalBadge color="bg-highlight" text="text-foreground">Who we are</BrutalBadge>
            <motion.h2
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="mt-4 max-w-[470px] text-4xl leading-[0.92] text-foreground sm:text-5xl lg:text-6xl"
              style={fonts.display}
            >
              WE ARE THE STUDENTS WHO STAYED CURIOUS.
            </motion.h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={fonts.serif}>
              The BDS program at SMS gives you the foundation. Data Sarathi exists for everything else - the projects you want to build, the peers you want to learn with, and the portfolio that proves you can do the work. Anyone at SMS TU is welcome here.
            </p>
            <Link to="/about" className="mt-7 inline-block">
              <BrutalButton color="bg-highlight">Read Our Story</BrutalButton>
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="space-y-4 lg:pt-8"
          >
            {identityCards.map((card) => (
              <motion.div key={card.title} variants={fadeUp} className="flex gap-4 border-2 border-foreground bg-white p-5 brutal-shadow">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-highlight">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-widest">{card.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative border-y-2 border-foreground bg-primary py-20 text-center text-white md:py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-5">
          <BrutalBadge color="bg-white" text="text-primary">Open to all SMS TU students</BrutalBadge>
          <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={defaultViewport} className="mt-6 text-5xl leading-[0.92] sm:text-6xl md:text-7xl" style={fonts.display}>YOUR SARATHI IS WAITING.</motion.h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed opacity-90" style={fonts.serif}>
            Data Sarathi is new. The community is still forming. This is the moment to show up - before it becomes something you wish you had joined earlier.
          </p>
          <p className="mt-6 font-mono text-sm text-white/70">Free to join - Open to all SMS TU students - No prior experience needed.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/events"><BrutalButton color="bg-highlight">See Events</BrutalButton></Link>
            <Link to="/contact"><BrutalButton color="bg-white" text="text-primary">Get In Touch</BrutalButton></Link>
          </div>
        </div>
      </section>
    </>
  );
}
