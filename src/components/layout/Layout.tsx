import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { UpdatedFooter } from "./UpdatedFooter";
import { GlobalStyles } from "../../app/styles/GlobalStyles";
import { Nav } from "./Nav";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F4EFEB] text-[#171717] flex flex-col">
      <GlobalStyles />
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:border-2 focus:border-[#171717] focus:bg-[#FFE800] focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest">
        Skip to content
      </a>
      <Nav />
      <main id="main-content" className="flex-1 pt-[68px]">
        <Outlet />
      </main>
      <UpdatedFooter />
    </div>
  );
}

