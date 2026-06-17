import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { UpdatedFooter } from "../UpdatedFooter";
import { GlobalStyles } from "../styles/GlobalStyles";
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
      <Nav />
      <main className="flex-1 pt-[68px]">
        <Outlet />
      </main>
      <UpdatedFooter />
    </div>
  );
}
