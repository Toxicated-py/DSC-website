import { BrutalCard } from "../../components/ui/brutal";

export const GlobalStyles = () => (
  <></>
);

export const PageLoadingFallback = () => (
  <div className="pt-32 pb-20 px-6 min-h-[60vh] flex items-center justify-center">
    <BrutalCard color="bg-white">
      <p className="font-mono text-sm text-slate-500">Loading page...</p>
    </BrutalCard>
  </div>
);
