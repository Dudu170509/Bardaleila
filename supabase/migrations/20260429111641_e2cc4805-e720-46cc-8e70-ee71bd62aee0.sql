-- =========================================================
-- TIMESTAMPS UPDATER
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PARTICIPANTS
-- =========================================================
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🙂',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are public-readable"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can register as participant"
  ON public.participants FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 40
    AND char_length(avatar) BETWEEN 1 AND 8
  );

-- =========================================================
-- AUCTIONS (singleton row)
-- =========================================================
CREATE TYPE public.auction_status AS ENUM ('DRAFT', 'ACTIVE', 'FINISHED');

CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Leilão do Boteco',
  status public.auction_status NOT NULL DEFAULT 'DRAFT',
  current_item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auctions are public-readable"
  ON public.auctions FOR SELECT
  USING (true);

CREATE TRIGGER update_auctions_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed singleton
INSERT INTO public.auctions (name, status) VALUES ('Leilão do Boteco', 'DRAFT');

-- =========================================================
-- ITEMS
-- =========================================================
CREATE TYPE public.item_status AS ENUM ('PENDING', 'ACTIVE', 'CLOSED');

CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  "order" INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🎁',
  image_url TEXT,
  starting_price INT NOT NULL DEFAULT 50,
  min_increment INT NOT NULL DEFAULT 5,
  status public.item_status NOT NULL DEFAULT 'PENDING',
  winner_bid_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_auction_order ON public.items(auction_id, "order");
CREATE INDEX idx_items_status ON public.items(status);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are public-readable"
  ON public.items FOR SELECT
  USING (true);

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- BIDS
-- =========================================================
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bids_item_amount ON public.bids(item_id, amount DESC);
CREATE INDEX idx_bids_item_created ON public.bids(item_id, created_at DESC);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids are public-readable"
  ON public.bids FOR SELECT
  USING (true);

CREATE POLICY "Anyone can place a bid"
  ON public.bids FOR INSERT
  WITH CHECK (amount > 0);

-- =========================================================
-- BID VALIDATION TRIGGER
-- - item must be ACTIVE
-- - amount must be >= starting_price (if first) or >= currentMax + min_increment
-- - participant cannot outbid themselves
-- =========================================================
CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_item public.items%ROWTYPE;
  v_current_max INT;
  v_current_leader UUID;
  v_min_required INT;
BEGIN
  -- Lock the item row to serialize concurrent bids
  SELECT * INTO v_item
  FROM public.items
  WHERE id = NEW.item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item não encontrado';
  END IF;

  IF v_item.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Esse item não está em pregão agora';
  END IF;

  SELECT b.amount, b.participant_id
    INTO v_current_max, v_current_leader
  FROM public.bids b
  WHERE b.item_id = NEW.item_id
  ORDER BY b.amount DESC, b.created_at ASC
  LIMIT 1;

  IF v_current_max IS NULL THEN
    v_min_required := v_item.starting_price;
  ELSE
    v_min_required := v_current_max + v_item.min_increment;
    IF v_current_leader = NEW.participant_id THEN
      RAISE EXCEPTION 'Você já está na frente, calma!';
    END IF;
  END IF;

  IF NEW.amount < v_min_required THEN
    RAISE EXCEPTION 'O lance precisa ser pelo menos R$ %', v_min_required;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_bid
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid();

-- =========================================================
-- REALTIME
-- =========================================================
ALTER TABLE public.auctions REPLICA IDENTITY FULL;
ALTER TABLE public.items REPLICA IDENTITY FULL;
ALTER TABLE public.bids REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;

-- =========================================================
-- SEED ITEMS
-- =========================================================
WITH a AS (SELECT id FROM public.auctions LIMIT 1)
INSERT INTO public.items (auction_id, "order", title, description, emoji, starting_price, min_increment, status)
SELECT a.id, x.ord, x.title, x.descr, x.emoji, x.sp, x.inc, x.st
FROM a, (VALUES
  (1, 'Rodada de Chopp', '10 chopps gelados pra mesa toda. Quem leva?', '🍺', 50, 10, 'PENDING'::public.item_status),
  (2, 'Drink da Casa', 'Caipirinha tropical especial do bartender.', '🍹', 30, 5, 'PENDING'::public.item_status),
  (3, 'Torre de Burger', 'Burger triplo com fritas. Pra dividir (ou não).', '🍔', 80, 10, 'PENDING'::public.item_status)
) AS x(ord, title, descr, emoji, sp, inc, st);