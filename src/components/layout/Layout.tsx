import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UpdatedFooter } from "./UpdatedFooter";
import { GlobalStyles } from "../../app/styles/GlobalStyles";
import { Nav } from "./Nav";
import { prefersReducedMotion } from "../../utils/animations";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <GlobalStyles />
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:border-2 focus:border-foreground focus:bg-highlight focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest">
        Skip to content
      </a>
      <Nav />
      <main id="main-content" className="flex-1 pt-[68px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <UpdatedFooter />
    </div>
  );
}

