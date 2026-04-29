import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuctionState, useParticipantSession } from "@/hooks/useAuctionState";
import { formatBRL } from "@/lib/auction-types";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [{ title: "Dar lance — Leilão do Boteco" }],
  }),
  component: PlayPage,
});

function PlayPage() {
  const navigate = useNavigate();
  const { me, clear } = useParticipantSession();
  const { auction, currentItem, currentBids, topBid, leader, participants } = useAuctionState();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  if (!me) {
    if (typeof window !== "undefined") navigate({ to: "/join" });
    return null;
  }

  const amILeader = topBid?.participant_id === me.id;
  const currentAmount = topBid?.amount ?? currentItem?.starting_price ?? 0;
  const minNext = topBid
    ? topBid.amount + (currentItem?.min_increment ?? 5)
    : currentItem?.starting_price ?? 0;

  const placeBid = async (amount: number) => {
    if (!currentItem) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("bids")
        .insert({ item_id: currentItem.id, participant_id: me.id, amount });
      if (error) throw error;
      setToast({ msg: `Lance de ${formatBRL(amount)} enviado!`, kind: "ok" });
      // vibração
      if ("vibrate" in navigator) navigator.vibrate(50);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao dar lance.";
      setToast({ msg, kind: "err" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden dotted-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-border/50 bg-background/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{me.avatar}</span>
          <div>
            <p className="font-hand text-base text-mango leading-none">você é</p>
            <p className="font-display text-lg font-extrabold leading-tight text-cream">{me.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-full border-2 border-border bg-card/40 px-3 py-1 font-mono text-[10px] uppercase text-muted-foreground">
            telão
          </Link>
          <button
            onClick={() => {
              clear();
              navigate({ to: "/join" });
            }}
            className="rounded-full border-2 border-border bg-card/40 px-3 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:border-cherry hover:text-cherry"
          >
            sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 py-5">
        {/* Auction state */}
        {!auction || auction.status === "DRAFT" ? (
          <WaitingCard text="Aguardando o leilão começar... 🍻" />
        ) : auction.status === "FINISHED" ? (
          <WaitingCard text="O leilão acabou! Valeu! 🎉" />
        ) : !currentItem ? (
          <WaitingCard text="Aguardando próximo item..." />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
              >
                {/* Item card */}
                <div className="relative overflow-hidden rounded-3xl border-4 border-lime bg-card p-5 shadow-pop">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-mango text-5xl">
                      {currentItem.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-md bg-grape px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-cream">
                        Lote {currentItem.order.toString().padStart(2, "0")}
                      </span>
                      <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-cream">
                        {currentItem.title}
                      </h1>
                      {currentItem.description && (
                        <p className="mt-1 font-hand text-lg text-lime">{currentItem.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lance atual */}
                <div className="mt-4 rounded-3xl border-4 border-mango bg-card/60 p-5 backdrop-blur">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-mango">
                    Lance atual
                  </p>
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={currentAmount}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.05, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20 }}
                      className="font-display text-5xl font-extrabold text-mango neon-glow-mango"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatBRL(currentAmount)}
                    </motion.p>
                  </AnimatePresence>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {leader ? (
                      <>
                        <span className="text-2xl">{leader.avatar}</span>
                        <span className="font-hand text-xl text-cream">
                          {amILeader ? `${leader.name} (você 🔥)` : leader.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          · {currentBids.length} {currentBids.length === 1 ? "lance" : "lances"}
                        </span>
                      </>
                    ) : (
                      <span className="font-hand text-xl text-lime">ninguém ainda — pode ser você!</span>
                    )}
                  </div>
                </div>

                {/* Botões de lance */}
                <div className="mt-4">
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Próximo lance (mín. {formatBRL(minNext)})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => {
                      const inc = currentItem.min_increment * (i === 0 ? 1 : i === 1 ? 2 : 5);
                      const value = (topBid?.amount ?? currentItem.starting_price - currentItem.min_increment) + inc;
                      const safeValue = Math.max(value, minNext + (i === 0 ? 0 : currentItem.min_increment * (i === 1 ? 1 : 4)));
                      return (
                        <button
                          key={i}
                          disabled={submitting || amILeader}
                          onClick={() => placeBid(safeValue)}
                          className="rounded-2xl border-2 border-lime bg-card py-3 font-display text-base font-extrabold text-cream shadow-pop-grape transition-transform active:scale-95 disabled:opacity-40"
                        >
                          +{formatBRL(inc)}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={submitting || amILeader}
                    onClick={() => placeBid(minNext)}
                    className="mt-3 w-full rounded-2xl bg-mango py-4 font-display text-2xl font-extrabold uppercase text-background shadow-pop transition-transform active:scale-95 disabled:opacity-40"
                  >
                    {amILeader ? "Você já tá na frente 🔥" : `Dar ${formatBRL(minNext)}`}
                  </button>
                </div>

                {/* Histórico */}
                {currentBids.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Últimos lances
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <AnimatePresence initial={false}>
                        {currentBids.slice(0, 6).map((b) => {
                          const p = participants.find((x) => x.id === b.participant_id);
                          return (
                            <motion.div
                              key={b.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-3 py-2"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-xl">{p?.avatar ?? "🙂"}</span>
                                <span className="font-hand text-base text-cream">
                                  {p?.id === me.id ? "Você" : p?.name ?? "—"}
                                </span>
                              </span>
                              <span className="font-mono text-sm font-bold text-mango">
                                {formatBRL(b.amount)}
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 font-display font-bold shadow-pop ${
              toast.kind === "ok" ? "bg-lime text-background" : "bg-cherry text-cream"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function WaitingCard({ text }: { text: string }) {
  return (
    <div className="grid h-[60vh] place-items-center text-center">
      <div>
        <motion.p
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl"
        >
          🍻
        </motion.p>
        <p className="mt-4 font-hand text-3xl text-mango">{text}</p>
      </div>
    </div>
  );
}
