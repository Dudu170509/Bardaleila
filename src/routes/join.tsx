import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AVATARS, type Participant } from "@/lib/auction-types";
import { supabase } from "@/integrations/supabase/client";
import { useParticipantSession } from "@/hooks/useAuctionState";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Entrar no Leilão 🍻" },
      { name: "description", content: "Escolha seu nome e avatar pra dar lances no leilão." },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();
  const { me, save } = useParticipantSession();
  const [step, setStep] = useState<"name" | "avatar">("name");
  const [name, setName] = useState(me?.name ?? "");
  const [avatar, setAvatar] = useState(me?.avatar ?? AVATARS[0]!);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goAvatar = () => {
    if (name.trim().length < 2) {
      setError("Coloca pelo menos 2 letras 🙏");
      return;
    }
    setError(null);
    setStep("avatar");
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: e } = await supabase
        .from("participants")
        .insert({ name: name.trim(), avatar })
        .select()
        .single();
      if (e) throw e;
      save(data as Participant);
      navigate({ to: "/play" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden dotted-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-mango">
            ← telão
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍻</span>
            <p className="font-display text-lg font-extrabold text-cream">Boteco</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === "name" ? (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="flex flex-1 flex-col justify-center"
            >
              <p className="font-hand text-3xl text-mango">e aí, tudo bom?</p>
              <h1 className="mt-1 font-display text-5xl font-extrabold leading-tight text-cream">
                Como te chamam?
              </h1>
              <p className="mt-2 text-muted-foreground">
                Esse nome aparece no telão quando você dá um lance.
              </p>
              <input
                autoFocus
                type="text"
                placeholder="Seu nome ou apelido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goAvatar()}
                maxLength={40}
                className="mt-6 w-full rounded-2xl border-4 border-lime bg-card px-5 py-4 font-display text-2xl font-bold text-cream outline-none focus:border-mango"
              />
              {error && <p className="mt-3 text-sm font-bold text-cherry">{error}</p>}
              <button
                onClick={goAvatar}
                className="mt-6 w-full rounded-2xl bg-mango py-4 font-display text-2xl font-extrabold uppercase text-background shadow-pop transition-transform active:scale-95"
              >
                Próximo →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="flex flex-1 flex-col justify-center"
            >
              <p className="font-hand text-3xl text-lime">olá, {name}!</p>
              <h1 className="mt-1 font-display text-5xl font-extrabold leading-tight text-cream">
                Escolhe seu avatar
              </h1>

              <motion.div
                key={avatar}
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mt-6 grid place-items-center"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-mango bg-card text-7xl shadow-pop">
                  {avatar}
                </div>
              </motion.div>

              <div className="mt-6 grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`flex aspect-square items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                      avatar === a
                        ? "border-mango bg-mango/20 scale-110"
                        : "border-border bg-card/40 hover:border-lime"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 text-sm font-bold text-cherry">{error}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("name")}
                  className="rounded-2xl border-2 border-border bg-card px-5 py-4 font-display font-bold text-cream"
                >
                  ←
                </button>
                <button
                  disabled={submitting}
                  onClick={submit}
                  className="flex-1 rounded-2xl bg-lime py-4 font-display text-2xl font-extrabold uppercase text-background shadow-pop-grape transition-transform active:scale-95 disabled:opacity-60"
                >
                  {submitting ? "Entrando..." : "Bora! 🚀"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
