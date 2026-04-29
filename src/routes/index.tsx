import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ItemStage } from "@/components/telao/ItemStage";
import { CurrentBidDisplay } from "@/components/telao/CurrentBidDisplay";
import { UpcomingItems } from "@/components/telao/UpcomingItems";
import { ArrematedOverlay } from "@/components/telao/ArrematedOverlay";
import { MOCK_ITEMS, MOCK_NAMES } from "@/lib/auction-mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leilão do Bar 🍻 — ao vivo" },
      { name: "description", content: "Telão do leilão do bar. Lances em tempo real, na cara dura." },
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

  useEffect(() => {
    setAmount(item.startingPrice);
    setLeader(MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]!);
    setBidCount(1);
  }, [item.id, item.startingPrice]);

  useEffect(() => {
    if (arremate) return;
    const t = setInterval(() => {
      setAmount((a) => a + item.minIncrement * (1 + Math.floor(Math.random() * 4)));
      setLeader(MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]!);
      setBidCount((c) => c + 1);
    }, 2200);
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
    <main className="relative h-screen w-screen overflow-hidden dotted-bg">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            🍻
          </motion.div>
          <div>
            <p className="font-display text-3xl font-extrabold leading-none text-cream">
              Leilão do <span className="text-party-gradient">Boteco</span>
            </p>
            <p className="font-hand text-xl text-mango">edição quinta-feira animada</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full border-2 border-cherry bg-card/60 px-4 py-2 backdrop-blur">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cherry opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cherry" />
          </span>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-cream">
            AO VIVO
          </p>
        </div>
      </header>

      {/* Grid principal */}
      <div className="grid h-full grid-cols-2 gap-0 pt-20 pb-32">
        <div className="relative">
          <ItemStage item={item} />
        </div>

        <div className="relative flex flex-col justify-center px-12">
          <div className="mb-8">
            <span className="inline-block rotate-1 rounded-xl bg-grape px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cream">
              ◉ Em pregão agora
            </span>
            <h1 className="mt-4 font-display text-7xl font-extrabold leading-[0.9] text-cream">
              {item.title}
            </h1>
            <p className="mt-3 max-w-md font-hand text-3xl text-lime">
              {item.description}
            </p>
          </div>

          <CurrentBidDisplay amount={amount} leaderName={leader} bidCount={bidCount} />

          <button
            onClick={finalize}
            className="mt-8 self-start rounded-full border-2 border-border bg-card/40 px-4 py-2 font-mono text-xs uppercase text-muted-foreground backdrop-blur transition-all hover:border-mango hover:text-mango"
          >
            [ simular arremate ]
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-10 py-6">
        <UpcomingItems items={upcoming} />
        <p className="font-hand text-2xl text-mango animate-wobble">
          paga no PIX, fácil! 💸
        </p>
      </footer>

      <ArrematedOverlay show={arremate} winner={leader} amount={amount} />
    </main>
  );
}
