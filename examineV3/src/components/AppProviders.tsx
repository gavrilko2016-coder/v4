import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { Command } from "cmdk";

export function AppProviders({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isShortcut = isMac ? e.metaKey && isK : e.ctrlKey && isK;
      if (!isShortcut) return;

      e.preventDefault();
      setCommandOpen((v) => !v);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMac]);

  return (
    <>
      {children}

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className:
            "glass border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        }}
      />

      {commandOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-24"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
          onMouseDown={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl overflow-hidden glass"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-[10px] tracking-[0.22em] font-semibold text-white/50">
                {isMac ? "COMMAND" : "CONTROL"}+K
              </p>
            </div>

            <Command className="bg-transparent text-white">
              <Command.Input
                autoFocus
                placeholder="Search games, wallet, deposit…"
                className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-white/35"
              />
              <Command.List className="max-h-80 overflow-auto px-2 pb-2">
                <Command.Empty className="px-3 py-10 text-center text-sm text-white/40">
                  Nothing found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-white/40">
                  <Command.Item
                    className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm text-white/80 aria-selected:bg-white/[0.06]"
                    onSelect={() => setCommandOpen(false)}
                  >
                    Open Games
                    <span className="text-[10px] text-white/30">G</span>
                  </Command.Item>
                  <Command.Item
                    className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm text-white/80 aria-selected:bg-white/[0.06]"
                    onSelect={() => setCommandOpen(false)}
                  >
                    Open Wallet
                    <span className="text-[10px] text-white/30">W</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
