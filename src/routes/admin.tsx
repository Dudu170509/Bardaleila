import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useAuctionState } from "@/hooks/useAuctionState";
import { formatBRL, type Item } from "@/lib/auction-types";
import {
  verifyAdminPassword,
  createItem,
  updateItem,
  deleteItem,
  startAuction,
  advanceItem,
  resetAuction,
} from "@/server/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Leilão do Boteco" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const verifyFn = useServerFn(verifyAdminPassword);

  // tenta restaurar do sessionStorage
  if (typeof window !== "undefined" && !authed) {
    const saved = sessionStorage.getItem("admin_pwd");
    if (saved && password === "") {
      setPassword(saved);
      setAuthed(true);
    }
  }

  const tryLogin = async () => {
    setErr(null);
    try {
      await verifyFn({ data: { password } });
      sessionStorage.setItem("admin_pwd", password);
      setAuthed(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro");
    }
  };

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-mono text-xs uppercase text-muted-foreground">
            ← voltar
          </Link>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-cream">🔐 Admin</h1>
          <p className="mt-2 font-hand text-2xl text-mango">só pra quem manda no bar</p>
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
            className="mt-5 w-full rounded-2xl border-4 border-lime bg-card px-5 py-4 font-display text-xl text-cream outline-none focus:border-mango"
          />
          {err && <p className="mt-2 text-sm font-bold text-cherry">{err}</p>}
          <button
            onClick={tryLogin}
            className="mt-4 w-full rounded-2xl bg-mango py-4 font-display text-xl font-extrabold uppercase text-background shadow-pop active:scale-95 transition-transform"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return <AdminPanel password={password} />;
}

function AdminPanel({ password }: { password: string }) {
  const { auction, items, participants, bids, currentItem, topBid, leader } = useAuctionState();
  const [editing, setEditing] = useState<Item | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);

  const startFn = useServerFn(startAuction);
  const advanceFn = useServerFn(advanceItem);
  const resetFn = useServerFn(resetAuction);
  const deleteFn = useServerFn(deleteItem);

  const wrap = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-6 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-4">
        <div>
          <Link to="/" className="font-mono text-[10px] uppercase text-muted-foreground">
            ← telão
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-cream">
            🎛️ Admin <span className="text-party-gradient">Boteco</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase ${
              auction?.status === "ACTIVE"
                ? "bg-lime text-background"
                : auction?.status === "FINISHED"
                  ? "bg-cherry text-cream"
                  : "bg-border text-muted-foreground"
            }`}
          >
            {auction?.status ?? "—"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {participants.length} 👥 · {bids.length} lances
          </span>
        </div>
      </header>

      {/* Controles */}
      <section className="mt-5 flex flex-wrap gap-2">
        {auction?.status === "DRAFT" && (
          <button
            disabled={busy || items.length === 0}
            onClick={() => wrap(() => startFn({ data: { password } }))}
            className="rounded-xl bg-lime px-5 py-3 font-display font-extrabold uppercase text-background shadow-pop-grape disabled:opacity-50"
          >
            ▶ Começar leilão
          </button>
        )}
        {auction?.status === "ACTIVE" && currentItem && (
          <button
            disabled={busy}
            onClick={() => {
              if (confirm(`Encerrar "${currentItem.title}" e ir pro próximo?`))
                wrap(() => advanceFn({ data: { password } }));
            }}
            className="rounded-xl bg-mango px-5 py-3 font-display font-extrabold uppercase text-background shadow-pop"
          >
            ⏭ Arrematar e avançar
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => {
            if (confirm("Resetar tudo? Apaga todos os lances e volta itens pra PENDING."))
              wrap(() => resetFn({ data: { password } }));
          }}
          className="rounded-xl border-2 border-cherry bg-card px-5 py-3 font-display font-extrabold uppercase text-cherry"
        >
          ↺ Reset
        </button>
      </section>

      {/* Item ativo (info) */}
      {currentItem && (
        <section className="mt-5 rounded-2xl border-2 border-mango bg-card/60 p-4">
          <p className="font-mono text-[10px] font-bold uppercase text-mango">Em pregão</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-4xl">{currentItem.emoji}</span>
            <div className="flex-1">
              <p className="font-display text-xl font-extrabold text-cream">{currentItem.title}</p>
              <p className="font-mono text-xs text-muted-foreground">
                Início {formatBRL(currentItem.starting_price)} · incremento{" "}
                {formatBRL(currentItem.min_increment)}
              </p>
            </div>
            {topBid && leader ? (
              <div className="text-right">
                <p className="font-hand text-xl text-lime">
                  {leader.avatar} {leader.name}
                </p>
                <p className="font-display text-2xl font-extrabold text-mango">
                  {formatBRL(topBid.amount)}
                </p>
              </div>
            ) : (
              <p className="font-hand text-lime">sem lances ainda</p>
            )}
          </div>
        </section>
      )}

      {/* Itens */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-cream">Itens do leilão</h2>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-xl bg-cherry px-4 py-2 font-display font-extrabold uppercase text-cream shadow-pop"
          >
            + Adicionar
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {items.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-border p-6 text-center font-hand text-xl text-muted-foreground">
              nenhum item ainda — adiciona um aí!
            </p>
          )}
          {items.map((it) => {
            const itemBids = bids.filter((b) => b.item_id === it.id);
            const top = itemBids[0];
            return (
              <div
                key={it.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border-2 p-3 ${
                  it.status === "ACTIVE"
                    ? "border-mango bg-mango/10"
                    : it.status === "CLOSED"
                      ? "border-cherry/50 bg-card/40 opacity-70"
                      : "border-border bg-card/40"
                }`}
              >
                <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                  #{it.order}
                </span>
                <span className="text-3xl">{it.emoji}</span>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-display text-lg font-extrabold text-cream">{it.title}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Início {formatBRL(it.starting_price)} · +{formatBRL(it.min_increment)}
                    {top && ` · top: ${formatBRL(top.amount)}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                    it.status === "ACTIVE"
                      ? "bg-mango text-background"
                      : it.status === "CLOSED"
                        ? "bg-cherry text-cream"
                        : "bg-border text-muted-foreground"
                  }`}
                >
                  {it.status}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(it)}
                    disabled={it.status === "CLOSED"}
                    className="rounded-lg border-2 border-lime px-2 py-1 font-mono text-[10px] font-bold uppercase text-lime disabled:opacity-30"
                  >
                    editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Apagar "${it.title}"?`))
                        wrap(() => deleteFn({ data: { password, id: it.id } }));
                    }}
                    disabled={it.status !== "PENDING"}
                    className="rounded-lg border-2 border-cherry px-2 py-1 font-mono text-[10px] font-bold uppercase text-cherry disabled:opacity-30"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modais */}
      <AnimatePresence>
        {(showNew || editing) && (
          <ItemFormModal
            password={password}
            item={editing}
            onClose={() => {
              setEditing(null);
              setShowNew(false);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ItemFormModal({
  password,
  item,
  onClose,
}: {
  password: string;
  item: Item | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [emoji, setEmoji] = useState(item?.emoji ?? "🎁");
  const [startingPrice, setStartingPrice] = useState(item?.starting_price ?? 50);
  const [minIncrement, setMinIncrement] = useState(item?.min_increment ?? 5);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const createFn = useServerFn(createItem);
  const updateFn = useServerFn(updateItem);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (item) {
        await updateFn({
          data: {
            password,
            id: item.id,
            title,
            description,
            emoji,
            starting_price: startingPrice,
            min_increment: minIncrement,
          },
        });
      } else {
        await createFn({
          data: {
            password,
            title,
            description,
            emoji,
            starting_price: startingPrice,
            min_increment: minIncrement,
          },
        });
      }
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border-4 border-mango bg-card p-5 shadow-pop"
      >
        <h3 className="font-display text-2xl font-extrabold text-cream">
          {item ? "Editar item" : "Novo item"}
        </h3>

        <label className="mt-4 block">
          <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
            Emoji + Nome
          </span>
          <div className="mt-1 flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              className="w-16 rounded-xl border-2 border-border bg-background px-3 py-2 text-center text-2xl"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rodada de chopp"
              maxLength={120}
              className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 font-display text-lg text-cream outline-none focus:border-lime"
            />
          </div>
        </label>

        <label className="mt-3 block">
          <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
            Descrição
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="10 chopps gelados pra mesa..."
            maxLength={500}
            rows={2}
            className="mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-cream outline-none focus:border-lime"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Lance inicial (R$)
            </span>
            <input
              type="number"
              min={1}
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2 font-mono text-cream outline-none focus:border-lime"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Incremento mín. (R$)
            </span>
            <input
              type="number"
              min={1}
              value={minIncrement}
              onChange={(e) => setMinIncrement(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2 font-mono text-cream outline-none focus:border-lime"
            />
          </label>
        </div>

        {err && <p className="mt-3 text-sm font-bold text-cherry">{err}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-border bg-card px-4 py-2 font-mono font-bold uppercase text-muted-foreground"
          >
            Cancelar
          </button>
          <button
            disabled={busy || !title.trim()}
            onClick={submit}
            className="flex-1 rounded-xl bg-mango py-2 font-display font-extrabold uppercase text-background shadow-pop disabled:opacity-50"
          >
            {busy ? "Salvando..." : item ? "Salvar" : "Criar item"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
