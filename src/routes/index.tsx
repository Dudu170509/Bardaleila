import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ItemStage } from "@/components/telao/ItemStage";
import { CurrentBidDisplay } from "@/components/telao/CurrentBidDisplay";
import { UpcomingItems } from "@/components/telao/UpcomingItems";
import { ArrematedOverlay } from "@/components/telao/ArrematedOverlay";
import { MOCK_ITEMS, MOCK_NAMES } from "@/lib/auction-mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leilão ao Vivo — Telão" },
      { name: "description", content: "Telão do leilão ao vivo. Lances em tempo real." },
    ],
  }),
  component: TelaoPage,
});

function TelaoPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const item = MOCK_ITEMS[activeIdx]!;

  const [amount, setAmount] = useState(item.startingPrice);
  const [leader, setLeader] = useState(MOCK_NAMES[0]!);
  const [bidCount, setBidCount] = useState(1);
  const [arremate, setArremate] = useState(false);

  // Reset on item change
  useEffect(() => {
    setAmount(item.startingPrice);
    setLeader(MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]!);
    setBidCount(1);
  }, [item.id, item.startingPrice]);

  // Simulated incoming bids
  useEffect(() => {
    if (arremate) return;
    const t = setInterval(() => {
      setAmount((a) => a + item.minIncrement * (1 + Math.floor(Math.random() * 4)));
      setLeader(MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]!);
      setBidCount((c) => c + 1);
    }, 2400);
    return () => clearInterval(t);
  }, [item.minIncrement, arremate]);

  const finalize = () => {
    setArremate(true);
    setTimeout(() => {
      setArremate(false);
      setActiveIdx((i) => (i + 1) % MOCK_ITEMS.length);
    }, 4500);
  };

  const upcoming = MOCK_ITEMS.filter((_, i) => i !== activeIdx);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Header bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rotate-45 border border-gold/60" />
          <div>
            <p className="font-display text-xl tracking-wide text-ivory">Maison d'Or</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-muted-foreground">
              Leilão · Edição XXVI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ivory/80">
            Ao vivo
          </p>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid h-full grid-cols-2 gap-0">
        <div className="relative">
          <ItemStage item={item} />
        </div>

        <div className="relative flex flex-col justify-center px-16">
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-gold/80">
              Lote n.º {item.order.toString().padStart(2, "0")}
            </p>
            <h1 className="mt-3 font-display text-6xl font-light leading-tight text-ivory">
              {item.title}
            </h1>
            <p className="mt-4 max-w-md font-display text-lg italic text-muted-foreground">
              {item.description}
            </p>
          </div>

          <CurrentBidDisplay amount={amount} leaderName={leader} bidCount={bidCount} />

          <button
            onClick={finalize}
            className="mt-12 self-start font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-gold transition-colors"
          >
            [ simular arremate ]
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-12 py-8">
        <UpcomingItems items={upcoming} />
        <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-muted-foreground">
          Lances em tempo real · Pagamento via PIX
        </p>
      </footer>

      {/* Decorative corners */}
      <div className="pointer-events-none absolute left-6 top-1/2 h-32 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
      <div className="pointer-events-none absolute right-6 top-1/2 h-32 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

      <ArrematedOverlay show={arremate} winner={leader} amount={amount} />
    </main>
  );
}
