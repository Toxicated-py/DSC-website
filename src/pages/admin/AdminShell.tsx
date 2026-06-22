import { Shield } from "lucide-react";
import { fonts } from "../../config/fonts";
import { BrutalBadge, BrutalCard } from "./AdminPrimitives";

export function AdminAccessDenied({ navigate }: any) {
  return (
    <div className="pt-32 pb-20 px-4 md:px-6 max-w-4xl mx-auto min-h-screen bg-[#F4EFEB]">
      <BrutalCard>
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
          <Shield size={10} /> ACCESS REQUIRED
        </BrutalBadge>
        <h1 className="text-4xl md:text-6xl uppercase leading-none" style={fonts.display}>
          Admin access required
        </h1>
        <p className="mt-4 text-slate-600">
          Your account is logged in, but it does not have an admin, president, or event manager role yet.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border-2 border-[#171717] bg-[#FFE800] hover:bg-white transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
          >
            View Site
          </button>
        </div>
      </BrutalCard>
    </div>
  );
}

export function AdminShellHeader({ isFullAdmin, navigate }: any) {
  return (
    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
          <Shield size={10} /> {isFullAdmin ? "ADMIN ACCESS" : "EVENT MANAGER ACCESS"}
        </BrutalBadge>
        <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none" style={fonts.display}>
          {isFullAdmin ? "Admin Panel" : "Event Manager Panel"}
        </h1>
        <p className="mt-4 font-mono text-xs md:text-sm text-slate-500">
          {isFullAdmin ? "Manage all aspects of your Data Science Club website" : "Manage your events, projects, blogs, and check-ins"}
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
        >
          View Site
        </button>
      </div>
    </div>
  );
}

export function AdminTabs({ visibleTabs, activeTab, openAdminTab }: any) {
  return (
    <div className="mb-8 flex gap-2 border-b-2 border-[#171717] pb-2 overflow-x-auto">
      {visibleTabs.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => openAdminTab(tab.id)}
          className={`px-4 md:px-6 py-3 font-bold uppercase tracking-widest text-xs md:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.id
              ? "bg-[#171717] text-white border-2 border-[#171717]"
              : "bg-white text-[#171717] border-2 border-transparent hover:border-[#171717]"
          }`}
        >
          {tab.icon}
          <span className="text-[10px] md:text-xs leading-tight">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
