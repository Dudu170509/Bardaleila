import beer from "@/assets/item-beer.jpg";
import cocktail from "@/assets/item-cocktail.jpg";
import burger from "@/assets/item-burger.jpg";

export type AuctionItem = {
  id: string;
  order: number;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  minIncrement: number;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  emoji: string;
};

export type Bid = {
  id: string;
  itemId: string;
  participantName: string;
  amount: number;
  createdAt: number;
};

export const MOCK_ITEMS: AuctionItem[] = [
  {
    id: "i1",
    order: 1,
    title: "Rodada de Chopp",
    description: "10 chopps gelados pra mesa toda. Quem leva?",
    imageUrl: beer,
    startingPrice: 50,
    minIncrement: 10,
    status: "ACTIVE",
    emoji: "🍺",
  },
  {
    id: "i2",
    order: 2,
    title: "Drink da Casa",
    description: "Caipirinha tropical especial do bartender.",
    imageUrl: cocktail,
    startingPrice: 30,
    minIncrement: 5,
    status: "PENDING",
    emoji: "🍹",
  },
  {
    id: "i3",
    order: 3,
    title: "Torre de Burger",
    description: "Burger triplo com fritas. Pra dividir (ou não).",
    imageUrl: burger,
    startingPrice: 80,
    minIncrement: 10,
    status: "PENDING",
    emoji: "🍔",
  },
];

export const MOCK_NAMES = [
  "Léo",
  "Mari",
  "Bruno",
  "Carol",
  "Rafa",
  "Nina",
  "Pedrão",
  "Jujú",
];

export const formatBRL = (cents: number) =>
  cents.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
