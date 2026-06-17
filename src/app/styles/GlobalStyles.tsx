import { BrutalCard } from "../components/ui/brutal";

export const GlobalStyles = () => (
  <style>{`
    @keyframes scan {
      0%, 100% { top: 0%; }
      50% { top: 100%; }
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .brutal-shadow {
      box-shadow: 6px 6px 0px #171717;
    }
    .brutal-shadow-hover:hover {
      box-shadow: 2px 2px 0px #171717;
      transform: translate(4px, 4px);
    }
    .brutal-shadow-lg {
      box-shadow: 12px 12px 0px #171717;
    }
    .mobile-menu-panel {
      top: var(--dsc-header-height, 88px);
      max-height: calc(100dvh - var(--dsc-header-height, 88px));
      overscroll-behavior: contain;
    }
    @media (max-width: 767px) {
      .brutal-shadow {
        box-shadow: 4px 4px 0px #171717;
      }
      .brutal-shadow-hover:hover {
        box-shadow: 2px 2px 0px #171717;
        transform: translate(2px, 2px);
      }
      .brutal-shadow-lg {
        box-shadow: 6px 6px 0px #171717;
      }
      .mobile-readable-title {
        font-size: clamp(3.75rem, 22vw, 6.5rem);
      }
      .mobile-section-title {
        font-size: clamp(2.75rem, 13vw, 4.5rem);
      }
    }
  `}</style>
);

export const PageLoadingFallback = () => (
  <div className="pt-32 pb-20 px-6 min-h-[60vh] flex items-center justify-center">
    <BrutalCard color="bg-white">
      <p className="font-mono text-sm text-slate-500">Loading page...</p>
    </BrutalCard>
  </div>
);
