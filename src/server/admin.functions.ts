import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkPassword, getAdminClient } from "./admin.server";

const withPwd = z.object({ password: z.string().min(1) });

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((d) => withPwd.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const createItem = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    withPwd
      .extend({
        title: z.string().min(1).max(120),
        description: z.string().max(500).default(""),
        emoji: z.string().min(1).max(8).default("🎁"),
        image_url: z.string().optional().nullable(),
        starting_price: z.number().int().min(1).max(1_000_000),
        min_increment: z.number().int().min(1).max(100_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { data: auc } = await supabase.from("auctions").select("id").limit(1).single();
    if (!auc) throw new Error("Leilão não encontrado.");
    const { data: maxRow } = await supabase
      .from("items")
      .select("order")
      .eq("auction_id", auc.id)
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.order ?? 0) + 1;
    const { data: created, error } = await supabase
      .from("items")
      .insert({
        auction_id: auc.id,
        order: nextOrder,
        title: data.title,
        description: data.description,
        emoji: data.emoji,
        image_url: data.image_url ?? null,
        starting_price: data.starting_price,
        min_increment: data.min_increment,
        status: "PENDING",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const updateItem = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    withPwd
      .extend({
        id: z.string().uuid(),
        title: z.string().min(1).max(120).optional(),
        description: z.string().max(500).optional(),
        emoji: z.string().min(1).max(8).optional(),
        image_url: z.string().optional().nullable(),
        starting_price: z.number().int().min(1).optional(),
        min_increment: z.number().int().min(1).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { password, id, ...patch } = data;
    void password;
    const { data: updated, error } = await supabase
      .from("items")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const deleteItem = createServerFn({ method: "POST" })
  .inputValidator((d) => withPwd.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { data: it } = await supabase.from("items").select("status").eq("id", data.id).single();
    if (it?.status === "CLOSED") throw new Error("Não dá pra apagar item já arrematado.");
    const { error } = await supabase.from("items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const startAuction = createServerFn({ method: "POST" })
  .inputValidator((d) => withPwd.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { data: auc } = await supabase.from("auctions").select("id").limit(1).single();
    if (!auc) throw new Error("Leilão não encontrado.");
    const { data: first } = await supabase
      .from("items")
      .select("id")
      .eq("auction_id", auc.id)
      .order("order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!first) throw new Error("Adicione pelo menos um item antes de começar.");
    await supabase.from("items").update({ status: "ACTIVE" }).eq("id", first.id);
    await supabase
      .from("auctions")
      .update({ status: "ACTIVE", current_item_id: first.id })
      .eq("id", auc.id);
    return { ok: true };
  });

// Closes current item: if there are bids, marks winner; advances to next item.
export const advanceItem = createServerFn({ method: "POST" })
  .inputValidator((d) => withPwd.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { data: auc } = await supabase
      .from("auctions")
      .select("id, current_item_id")
      .limit(1)
      .single();
    if (!auc?.current_item_id) throw new Error("Nenhum item ativo.");

    // pick winning bid
    const { data: top } = await supabase
      .from("bids")
      .select("id")
      .eq("item_id", auc.current_item_id)
      .order("amount", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    await supabase
      .from("items")
      .update({ status: "CLOSED", winner_bid_id: top?.id ?? null })
      .eq("id", auc.current_item_id);

    // find next pending
    const { data: current } = await supabase
      .from("items")
      .select("order")
      .eq("id", auc.current_item_id)
      .single();
    const { data: next } = await supabase
      .from("items")
      .select("id")
      .eq("auction_id", auc.id)
      .eq("status", "PENDING")
      .gt("order", current?.order ?? 0)
      .order("order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase.from("items").update({ status: "ACTIVE" }).eq("id", next.id);
      await supabase.from("auctions").update({ current_item_id: next.id }).eq("id", auc.id);
    } else {
      await supabase
        .from("auctions")
        .update({ current_item_id: null, status: "FINISHED" })
        .eq("id", auc.id);
    }
    return { ok: true };
  });

export const resetAuction = createServerFn({ method: "POST" })
  .inputValidator((d) => withPwd.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabase = getAdminClient();
    const { data: auc } = await supabase.from("auctions").select("id").limit(1).single();
    if (!auc) throw new Error("Leilão não encontrado.");
    await supabase.from("bids").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("items")
      .update({ status: "PENDING", winner_bid_id: null })
      .eq("auction_id", auc.id);
    await supabase
      .from("auctions")
      .update({ status: "DRAFT", current_item_id: null })
      .eq("id", auc.id);
    return { ok: true };
  });
