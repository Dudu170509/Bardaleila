import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ItemStage } from "@/components/telao/ItemStage";
import { CurrentBidDisplay } from "@/components/telao/CurrentBidDisplay";
import { UpcomingItems } from "@/components/telao/UpcomingItems";
import { ArrematedOverlay } from "@/components/telao/ArrematedOverlay";
import { JoinQR } from "@/components/telao/JoinQR";
import { useAuctionState } from "@/hooks/useAuctionState";
import type { Bid, Participant } from "@/lib/auction-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leilão do Boteco 🍻 — ao vivo" },
      { name: "description", content: "Telão do leilão do bar. Lances em tempo real." },
    ],
  }),
  component: TelaoPage,
});

function TelaoPage() {
  const { auction, items, bids, participants, currentItem, currentBids, topBid, leader, loading } = useAuctionState();
  const [joinUrl, setJoinUrl] = useState("");
  const [lastClosed, setLastClosed] = useState<string | null>(null);
  const [showArremate, setShowArremate] = useState<{
    name: string;
    avatar: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join`);
    }
  }, []);

  // Detecta arremate
  useEffect(() => {
    const justClosed = items.find((i) => i.status === "CLOSED" && i.id !== lastClosed && i.winner_bid_id);
    if (!justClosed || !justClosed.winner_bid_id) return;
    setLastClosed(justClosed.id);
    // Acha o lance vencedor pelo id — busca em TODOS os bids (não só currentBids,
    // pois quando o item fecha o currentBids já aponta pro próximo item)
    const winnerBid = bids.find((b) => b.id === justClosed.winner_bid_id);
    if (winnerBid) {
      const participant = participants.find((p) => p.id === winnerBid.participant_id);
      setShowArremate({
        name: participant?.name ?? "Arrematante",
        avatar: participant?.avatar ?? "🎉",
        amount: winnerBid.amount,
      });
      // Auto-dismiss após 6 segundos
      setTimeout(() => setShowArremate(null), 6000);
    }
  }, [items, lastClosed, bids, participants]);

  const upcoming = items.filter((i) => i.status === "PENDING");
  const leaderName = leader?.name ?? "—";
  const leaderAvatar = leader?.avatar ?? "🙂";
  const amount = topBid?.amount ?? currentItem?.starting_price ?? 0;

  if (loading) {
    return (
      <main className="grid h-screen w-screen place-items-center">
        <p className="font-hand text-3xl text-mango">Preparando o leilão... 🍻</p>
      </main>
    );
  }

  if (!auction || auction.status === "DRAFT") {
    return <WaitingScreen joinUrl={joinUrl} itemCount={items.length} />;
  }

  if (auction.status === "FINISHED") {
    return <FinishedScreen items={items} />;
  }

  if (!currentItem) {
    return (
      <main className="grid h-screen w-screen place-items-center">
        <p className="font-hand text-3xl text-mango">Aguardando próximo item... 🎲</p>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden dotted-bg">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-8 py-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            🍻
          </motion.div>
          <div>
            <p className="font-display text-2xl font-extrabold leading-none text-cream">
              Leilão do <span className="text-party-gradient">Boteco</span>
            </p>
            <p className="font-hand text-base text-mango">{auction.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full border-2 border-cherry bg-card/60 px-3 py-1.5 backdrop-blur">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cherry opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cherry" />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-cream">
            AO VIVO
          </p>
        </div>
      </header>

      {/* Grid principal — pt-24 e pb-36 evitam sobreposição com header/footer */}
      <div className="grid h-full grid-cols-1 gap-0 pt-24 pb-36 lg:grid-cols-[1fr_1fr]">
        <div className="relative">
          <ItemStage item={currentItem} />
        </div>

        <div className="relative flex flex-col justify-center px-10">
          <div className="mb-6">
            <span className="inline-block rotate-1 rounded-xl bg-grape px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cream">
              ◉ Em pregão agora
            </span>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] text-cream xl:text-6xl">
              {currentItem.title}
            </h1>
            {currentItem.description && (
              <p className="mt-2 max-w-md font-hand text-2xl text-lime">
                {currentItem.description}
              </p>
            )}
          </div>

          <CurrentBidDisplay
            amount={amount}
            leaderName={leaderName}
            leaderAvatar={leaderAvatar}
            bidCount={currentBids.length}
          />
        </div>
      </div>

      {/* Footer — agora com QR de entrada à esquerda */}
      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 px-8 py-5">
        <div className="flex items-end gap-4">
          {joinUrl && <JoinQR url={joinUrl} />}
          <div className="hidden md:block">
            <UpcomingItems items={upcoming} />
          </div>
        </div>
        <p className="font-hand text-xl text-mango animate-wobble">
          paga no PIX, fácil! 💸
        </p>
      </footer>

      <ArrematedOverlay
        show={!!showArremate}
        winner={showArremate?.name ?? ""}
        avatar={showArremate?.avatar ?? ""}
        amount={showArremate?.amount ?? 0}
      />
    </main>
  );
}

function WaitingScreen({ joinUrl, itemCount }: { joinUrl: string; itemCount: number }) {
  return (
    <main className="relative grid h-screen w-screen place-items-center overflow-hidden dotted-bg">
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-9xl"
        >
          🍻
        </motion.div>
        <h1 className="mt-6 font-display text-7xl font-extrabold text-party-gradient">
          Leilão do Boteco
        </h1>
        <p className="mt-4 font-hand text-4xl text-mango">tá quase começando!</p>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item preparado" : "itens preparados"}
        </p>
        <div className="mt-10 inline-block">{joinUrl && <JoinQR url={joinUrl} />}</div>
      </div>
    </main>
  );
}

function FinishedScreen({ items }: { items: import("@/lib/auction-types").Item[] }) {
  const arrematados = items.filter((i) => i.status === "CLOSED" && i.winner_bid_id);
  return (
    <main className="grid min-h-screen place-items-center px-8 py-12">
      <div className="text-center">
        <p className="text-8xl">🎉</p>
        <h1 className="mt-4 font-display text-6xl font-extrabold text-party-gradient">
          Acabou!
        </h1>
        <p className="mt-3 font-hand text-3xl text-mango">
          Foram {arrematados.length} arremate{arrematados.length !== 1 && "s"}. Valeu, galera!
        </p>
      </div>
    </main>
  );
}
