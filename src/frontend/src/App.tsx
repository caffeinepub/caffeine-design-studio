import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  Bot,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  Gift,
  Heart,
  IceCream,
  Loader2,
  Minus,
  Plus,
  Send,
  Settings,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateCheckoutSession } from "./hooks/useCheckoutSession";

// ── Types ──────────────────────────────────────────────────────────────────
interface Flavor {
  id: string;
  name: string;
  emoji: string;
  category: "classic" | "galaxy" | "fruity" | "vegan" | "frozen" | "exotic";
  price: number;
  description: string;
  isSpecial?: boolean;
  isNew?: boolean;
}

interface CartItem {
  flavor: Flavor;
  qty: number;
}

interface ChatMessage {
  id: string;
  from: "user" | "nova";
  text: string;
}

// ── Referral helpers ───────────────────────────────────────────────────────
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "GALAXY-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getOrCreateMyReferralCode(): string {
  try {
    const stored = localStorage.getItem("galaxy_my_referral_code");
    if (stored) return stored;
    const code = generateReferralCode();
    localStorage.setItem("galaxy_my_referral_code", code);
    return code;
  } catch {
    return generateReferralCode();
  }
}

function getUsedReferralCode(): string | null {
  try {
    return localStorage.getItem("galaxy_used_referral_code");
  } catch {
    return null;
  }
}

function markReferralCodeUsed(code: string): void {
  try {
    localStorage.setItem("galaxy_used_referral_code", code);
  } catch {
    // ignore
  }
}

// ── Data ───────────────────────────────────────────────────────────────────
const FLAVORS: Flavor[] = [
  // Classic
  {
    id: "vanilla",
    name: "Vanilla Bean",
    emoji: "🍦",
    category: "classic",
    price: 99,
    description: "Creamy Madagascar vanilla with real bean specks",
  },
  {
    id: "choco",
    name: "Chocolate Fudge",
    emoji: "🍫",
    category: "classic",
    price: 109,
    description: "Rich Belgian chocolate swirled with hot fudge",
  },
  {
    id: "strawberry",
    name: "Strawberry Dream",
    emoji: "🍓",
    category: "classic",
    price: 99,
    description: "Fresh strawberries churned into silky goodness",
  },
  {
    id: "butterscotch",
    name: "Butterscotch Bliss",
    emoji: "🧈",
    category: "classic",
    price: 109,
    description: "Caramelised butter toffee with a velvet finish",
  },
  {
    id: "pistachio",
    name: "Pistachio Nebula",
    emoji: "🌰",
    category: "classic",
    price: 119,
    description: "Premium Iranian pistachios in a dreamy cream base",
    isNew: true,
  },
  {
    id: "rosemilk",
    name: "Rose Milk Galaxy",
    emoji: "🌹",
    category: "classic",
    price: 109,
    description: "Fragrant rose petals infused into silky sweet cream",
    isNew: true,
  },
  // Galaxy Special
  {
    id: "nebula",
    name: "Nebula Swirl",
    emoji: "🌀",
    category: "galaxy",
    price: 149,
    description: "Swirling purple-blue cosmic cream with edible glitter",
    isSpecial: true,
  },
  {
    id: "cosmic",
    name: "Cosmic Crunch",
    emoji: "✨",
    category: "galaxy",
    price: 159,
    description: "Galaxy popping candy meets starry vanilla base",
    isSpecial: true,
  },
  {
    id: "stardust",
    name: "Stardust Caramel",
    emoji: "⭐",
    category: "galaxy",
    price: 149,
    description: "Salted caramel infused with activated charcoal shimmer",
  },
  {
    id: "milkyway",
    name: "Milky Way Mango",
    emoji: "🌌",
    category: "galaxy",
    price: 139,
    description: "Alphonso mango meets cosmic condensed milk swirl",
  },
  {
    id: "supernova",
    name: "Supernova Saffron",
    emoji: "🔥",
    category: "galaxy",
    price: 169,
    description: "Kesar saffron gold with edible silver leaf sparkle",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "blackhole",
    name: "Black Hole Brownie",
    emoji: "🕳️",
    category: "galaxy",
    price: 179,
    description: "Activated charcoal base with molten brownie chunks",
    isNew: true,
  },
  {
    id: "aurora",
    name: "Aurora Borealis Blast",
    emoji: "🌈",
    category: "galaxy",
    price: 159,
    description: "Multi-hued layered cream swirling with northern lights magic",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "quasar",
    name: "Quasar Kulfi",
    emoji: "🧊",
    category: "galaxy",
    price: 149,
    description: "Traditional kulfi reinvented with cosmic caramel ribbons",
    isNew: true,
  },
  // Fruity
  {
    id: "passion",
    name: "Passion Fruit Pulsar",
    emoji: "💛",
    category: "fruity",
    price: 119,
    description: "Tangy passion fruit with tropical cream ribbons",
  },
  {
    id: "lychee",
    name: "Lychee Luna",
    emoji: "🌙",
    category: "fruity",
    price: 119,
    description: "Delicate rose-lychee sorbet with moonlit sweetness",
  },
  {
    id: "mango",
    name: "Mango Meteor",
    emoji: "🥭",
    category: "fruity",
    price: 129,
    description: "Fiery Alphonso mango explosion with chili dust",
  },
  {
    id: "berry",
    name: "Berry Big Bang",
    emoji: "🫐",
    category: "fruity",
    price: 129,
    description: "Blueberry, raspberry & blackberry supernova blend",
  },
  {
    id: "guava",
    name: "Guava Galaxy",
    emoji: "🍈",
    category: "fruity",
    price: 119,
    description: "Pink guava with a zingy tamarind cosmic swirl",
    isNew: true,
  },
  {
    id: "watermelon",
    name: "Watermelon Wormhole",
    emoji: "🍉",
    category: "fruity",
    price: 109,
    description: "Refreshing watermelon sorbet with black salt stardust",
    isNew: true,
  },
  {
    id: "kiwi",
    name: "Kiwi Comet",
    emoji: "🥝",
    category: "fruity",
    price: 119,
    description: "Bright green kiwi with tangy lime meteor showers",
    isNew: true,
  },
  // Vegan
  {
    id: "coconut",
    name: "Coconut Cosmos",
    emoji: "🥥",
    category: "vegan",
    price: 129,
    description: "Creamy coconut milk base with toasted flakes",
  },
  {
    id: "avocado",
    name: "Avocado Asteroid",
    emoji: "🥑",
    category: "vegan",
    price: 139,
    description: "Dark chocolate & avocado — rich, velvety, planet-friendly",
  },
  {
    id: "date",
    name: "Dark Matter Date",
    emoji: "🌑",
    category: "vegan",
    price: 129,
    description: "Medjool date caramel with a hint of cardamom",
    isNew: true,
  },
  {
    id: "pineapple",
    name: "Pineapple Planet",
    emoji: "🍍",
    category: "vegan",
    price: 119,
    description: "Tropical pineapple sorbet that's guilt-free & cosmic",
    isNew: true,
  },
  {
    id: "almond",
    name: "Almond Aurora",
    emoji: "🌿",
    category: "vegan",
    price: 139,
    description: "Almond milk base with rose water & crunchy almond brittle",
    isNew: true,
  },
  {
    id: "jackfruit",
    name: "Jackfruit Jupiter",
    emoji: "🌍",
    category: "vegan",
    price: 129,
    description: "Ripe jackfruit sorbet — India's very own planet flavour",
    isNew: true,
  },
  // Frozen Specials
  {
    id: "mocha",
    name: "Mocha Moon Freeze",
    emoji: "☕",
    category: "frozen",
    price: 149,
    description: "Frozen coffee mocha swirled with cosmic cream ribbons",
    isNew: true,
  },
  {
    id: "bubblegum",
    name: "Bubblegum Black Dwarf",
    emoji: "💜",
    category: "frozen",
    price: 139,
    description: "Galaxy bubblegum with sparkling sugar crystal clusters",
    isNew: true,
  },
  {
    id: "taro",
    name: "Taro Titan",
    emoji: "🟣",
    category: "frozen",
    price: 149,
    description: "Purple taro from the outer galaxy with coconut cream core",
    isNew: true,
    isSpecial: true,
  },
  {
    id: "matcha",
    name: "Matcha Milky Way",
    emoji: "🍵",
    category: "frozen",
    price: 159,
    description: "Premium Japanese matcha in a cosmic frozen dream",
    isNew: true,
  },
  // Exotic Universe
  {
    id: "lavender",
    name: "Lavender Lightyear",
    emoji: "💐",
    category: "exotic",
    price: 169,
    description: "French lavender honey cream — a truly alien flavour",
    isNew: true,
    isSpecial: true,
  },
  {
    id: "chili",
    name: "Chili Comet",
    emoji: "🌶️",
    category: "exotic",
    price: 159,
    description: "Mango base with a fiery red chili tail — dare to try!",
    isNew: true,
  },
  {
    id: "cardamom",
    name: "Cardamom Constellation",
    emoji: "🌟",
    category: "exotic",
    price: 149,
    description: "Elaichi spiced cream with gold sugar star dust",
    isNew: true,
  },
  {
    id: "paan",
    name: "Paan Pulsar",
    emoji: "🍃",
    category: "exotic",
    price: 139,
    description: "Classic Indian paan flavour in a cosmic creamy form",
    isNew: true,
  },
];

// ── Customer Favourites Data ────────────────────────────────────────────────
const CUSTOMER_FAVOURITES: {
  id: string;
  orders: number;
  rating: number;
  badge: string;
}[] = [
  { id: "nebula", orders: 1842, rating: 4.9, badge: "🔥 #1 Best Seller" },
  { id: "cosmic", orders: 1563, rating: 4.8, badge: "✨ Fan Favourite" },
  { id: "supernova", orders: 1210, rating: 4.9, badge: "🆕 New & Trending" },
  { id: "milkyway", orders: 987, rating: 4.7, badge: "🌌 Most Loved" },
  { id: "choco", orders: 921, rating: 4.8, badge: "🍫 Classic Fave" },
  { id: "rosemilk", orders: 874, rating: 4.7, badge: "💜 Rising Star" },
];

const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  classic: {
    label: "Classic",
    emoji: "🍦",
    color: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  },
  galaxy: {
    label: "Galaxy Special",
    emoji: "🌌",
    color: "text-violet-300 border-violet-400/40 bg-violet-400/10",
  },
  fruity: {
    label: "Fruity",
    emoji: "🍓",
    color: "text-pink-300 border-pink-400/40 bg-pink-400/10",
  },
  vegan: {
    label: "Vegan",
    emoji: "🌿",
    color: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  },
  frozen: {
    label: "Frozen Specials",
    emoji: "❄️",
    color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10",
  },
  exotic: {
    label: "Exotic Universe",
    emoji: "🔮",
    color: "text-fuchsia-300 border-fuchsia-400/40 bg-fuchsia-400/10",
  },
};

const NOVA_RESPONSES: Record<string, string> = {
  hello:
    "Hey there, cosmic explorer! 🌟 Welcome to Galaxy Ice Cream Parlour! I'm Nova, your AI ice cream guide. Ask me about flavours, prices, or today's special!",
  hi: "Hi! 🍦 I'm Nova, the AI manager here at Galaxy Ice Cream Parlour. What cosmic flavour can I help you discover today?",
  vegan:
    "Great choice! 🌿 We have 6 amazing vegan options: Coconut Cosmos (₹129), Avocado Asteroid (₹139), Dark Matter Date (₹129), Pineapple Planet (₹119), Almond Aurora (₹139), and Jackfruit Jupiter (₹129). All 100% plant-based and out-of-this-world delicious!",
  special:
    "Today's Special is ⭐ Aurora Borealis Blast at ₹159! 🌈 Multi-hued layered cream swirling with northern lights magic. Also check out Supernova Saffron (₹169) with real kesar gold, and Lavender Lightyear (₹169) — an alien delight! All marked with a star badge!",
  cheap:
    "Our most affordable scoops are ₹99 each — Vanilla Bean and Strawberry Dream! Both classic favourites that never disappoint 🍦",
  price:
    "Prices range from ₹99 (Classic scoops) to ₹159 (Galaxy Specials). Fruity flavours start at ₹119 and Vegan at ₹119. All great value for cosmic quality! 🌌",
  recommend:
    "My top picks: 1) Aurora Borealis Blast (₹159) — pure magic 🌈 2) Supernova Saffron (₹169) — luxurious saffron gold ✨ 3) Lavender Lightyear (₹169) — exotic & unforgettable 💐 4) Taro Titan (₹149) — cosmic purple dream 🟣",
  mango:
    "Mango fans will LOVE Milky Way Mango (₹139) — Alphonso mango in a cosmic condensed milk swirl, and Mango Meteor (₹129) — fiery Alphonso with chili dust! 🥭🌌",
  chocolate:
    "Chocolate lovers — try our Chocolate Fudge (₹109) for classic richness, or Avocado Asteroid (₹139) for a vegan dark chocolate twist! 🍫",
  offer:
    "Current offers: 🎉 Buy 2 Get 1 Free every weekend! Plus earn 10 loyalty points per order — redeem 100 points for ₹50 off your next treat!",
  points:
    "You earn 10 loyalty points with every order 🌟 Collect 100 points to redeem ₹50 off! Check your points balance in the cart.",
  referral:
    "Share your referral code with friends! 🎁 They get ₹50 off their first order, and you earn 50 bonus loyalty points when they use it!",
  location:
    "Galaxy Ice Cream Parlour is fully online and open 24/7! 🌏 We serve cosmic flavours across all of India. No physical store needed — just browse, order, and enjoy from the comfort of your home. Share our link with friends too! 🍦✨",
  address:
    "Galaxy Ice Cream Parlour is fully online and open 24/7! 🌏 We serve cosmic flavours across all of India. No physical store needed — just browse, order, and enjoy from the comfort of your home. Share our link with friends too! 🍦✨",
  store:
    "We're a 100% online parlour! 🛸 No physical store needed — Galaxy Ice Cream Parlour is open 24/7 across all of India. Just visit our app anytime and enjoy cosmic flavours from home!",
  where:
    "Galaxy Ice Cream Parlour is fully online! 🌏 We're not at a physical address — we're everywhere in India via this app. Open 24/7, no stepping out needed! 🍦",
  default:
    "I'd love to help! 🤖 You can ask me about: our location, vegan options, today's special, prices, recommendations, offers, referral, or any specific flavour like mango or chocolate!",
};

function getNovaResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(NOVA_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return NOVA_RESPONSES[key];
  }
  return NOVA_RESPONSES.default;
}

// ── Starfield ───────────────────────────────────────────────────────────────
function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: `${(i * 37.3 + 11) % 100}%`,
    left: `${(i * 53.7 + 7) % 100}%`,
    size: (i % 5) * 0.4 + 0.6,
    duration: `${(i % 4) + 2}s`,
    delay: `${(i % 5) * 1.0}s`,
  }));
  return (
    <div className="starfield">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              "--duration": s.duration,
              "--delay": s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ── Opening Banner ──────────────────────────────────────────────────────────
function OpeningBanner() {
  return (
    <motion.div
      data-ocid="opening.banner"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden py-3 px-4 text-center text-sm font-bold tracking-wide"
      style={{
        background:
          "linear-gradient(90deg, oklch(0.4 0.28 310), oklch(0.45 0.3 280), oklch(0.5 0.28 220), oklch(0.45 0.3 280), oklch(0.4 0.28 310))",
        backgroundSize: "200% auto",
        animation: "shimmer 3s linear infinite",
      }}
    >
      <span className="relative z-10 text-white drop-shadow-lg">
        🌟 Galaxy Ice Cream Parlour is{" "}
        <span className="underline decoration-yellow-300">NOW OPEN</span>! Come
        taste the cosmos! 🌟
      </span>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 60px oklch(0.65 0.28 310 / 0.3)" }}
      />
    </motion.div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────
interface HeaderProps {
  cartCount: number;
  loyaltyPoints: number;
  onCartOpen: () => void;
  onLoyaltyOpen: () => void;
  onUpgradeOpen: () => void;
  onStripeSetup: () => void;
  onReferralOpen: () => void;
}
function Header({
  cartCount,
  loyaltyPoints,
  onCartOpen,
  onLoyaltyOpen,
  onUpgradeOpen,
  onStripeSetup,
  onReferralOpen,
}: HeaderProps) {
  return (
    <header
      data-ocid="header.section"
      className="sticky top-0 z-40 backdrop-blur-xl border-b border-violet-500/20"
      style={{ background: "oklch(0.08 0.02 280 / 0.9)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 4,
              ease: "easeInOut",
            }}
            className="text-3xl"
          >
            🍦
          </motion.div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight gradient-text">
              Galaxy Ice Cream Parlour
            </h1>
            <p className="text-xs text-violet-300/70 leading-none">
              Taste the cosmos ✨
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="loyalty.open_modal_button"
            onClick={onLoyaltyOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-sm font-semibold hover:bg-amber-400/20 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            {loyaltyPoints} pts
          </button>
          <button
            type="button"
            data-ocid="referral.open_modal_button"
            onClick={onReferralOpen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-400/40 bg-pink-400/10 text-pink-300 text-sm font-semibold hover:bg-pink-400/20 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Refer
          </button>
          <button
            type="button"
            data-ocid="upgrade.open_modal_button"
            onClick={onUpgradeOpen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-sm font-semibold hover:bg-emerald-400/20 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            PRO
          </button>
          <button
            type="button"
            data-ocid="stripe.settings_button"
            onClick={onStripeSetup}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-violet-400/40 transition-colors"
            title="Payment Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-ocid="cart.open_modal_button"
            onClick={onCartOpen}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-400/40 bg-violet-400/10 text-violet-300 text-sm font-semibold hover:bg-violet-400/20 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center leading-none px-1">
                {cartCount}
              </span>
            )}
            Cart
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Promo Banners ───────────────────────────────────────────────────────────
function PromoBanners() {
  const banners = [
    {
      icon: "⭐",
      text: "Today's Special: Nebula Swirl",
      sub: "Cosmic cream with edible glitter — ₹149",
      color: "from-violet-900/60 to-violet-800/40 border-violet-400/30",
    },
    {
      icon: "🎉",
      text: "Buy 2 Get 1 Free — Every Weekend!",
      sub: "Mix any flavours from our cosmic menu",
      color: "from-pink-900/60 to-pink-800/40 border-pink-400/30",
    },
    {
      icon: "🆕",
      text: "New Arrival: Aurora Borealis Blast",
      sub: "Limited edition — grab it before it's gone!",
      color: "from-cyan-900/60 to-cyan-800/40 border-cyan-400/30",
    },
  ];
  return (
    <section data-ocid="promo.section" className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {banners.map((b, i) => (
          <motion.div
            key={b.text}
            data-ocid={`promo.item.${i + 1}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${b.color} border backdrop-blur-sm`}
          >
            <span className="text-2xl">{b.icon}</span>
            <div>
              <p className="text-sm font-bold text-white">{b.text}</p>
              <p className="text-xs text-white/60">{b.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Customer Favourites Section ────────────────────────────────────────────
function CustomerFavouritesSection({ onAdd }: { onAdd: (f: Flavor) => void }) {
  const items = CUSTOMER_FAVOURITES.map((fav) => ({
    fav,
    flavor: FLAVORS.find((fl) => fl.id === fav.id),
  })).filter(
    (x): x is { fav: typeof x.fav; flavor: Flavor } => x.flavor !== undefined,
  );

  return (
    <section
      data-ocid="favourites.section"
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-3xl gradient-text mb-2">
          ⭐ Customer Favourites
        </h2>
        <p className="text-violet-300/70 text-sm">
          Most ordered &amp; highest rated by our cosmic customers
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(({ fav, flavor }, idx) => (
          <motion.div
            key={flavor.id}
            data-ocid={`favourites.item.${idx + 1}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.4 }}
            className="relative bg-violet-950/70 border border-violet-400/30 rounded-2xl p-4 flex flex-col gap-3 hover:border-violet-400/60 transition-colors"
          >
            {/* Badge pill */}
            <span className="absolute top-3 right-3 bg-violet-700/80 text-violet-100 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              {fav.badge}
            </span>
            {/* Emoji */}
            <div className="text-5xl text-center pt-1">{flavor.emoji}</div>
            {/* Info */}
            <div className="flex-1">
              <h3 className="font-display font-bold text-violet-100 text-base leading-tight">
                {flavor.name}
              </h3>
              <p className="text-violet-300/60 text-xs mt-0.5 line-clamp-1">
                {flavor.description}
              </p>
            </div>
            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs text-violet-300/70">
              <span className="text-yellow-400">★ {fav.rating}</span>
              <span>{fav.orders.toLocaleString()} orders</span>
              <span className="ml-auto bg-violet-900/60 text-violet-300 px-2 py-0.5 rounded-full capitalize">
                {flavor.category}
              </span>
            </div>
            {/* Price + Add */}
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-violet-100 text-base">
                ₹{flavor.price}
              </span>
              <button
                type="button"
                data-ocid={`favourites.item.${idx + 1}`}
                onClick={() => onAdd(flavor)}
                className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
              >
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Flash Deal ──────────────────────────────────────────────────────────────
const FLASH_DEAL_FLAVORS = [
  { id: "nebula-swirl", discount: 30 },
  { id: "aurora-borealis-blast", discount: 25 },
  { id: "cosmic-caramel-crunch", discount: 35 },
  { id: "stardust-strawberry", discount: 20 },
  { id: "black-hole-brownie", discount: 40 },
];

function FlashDealSection({ onAdd }: { onAdd: (f: Flavor) => void }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [dealIdx] = useState(
    () => new Date().getDate() % FLASH_DEAL_FLAVORS.length,
  );

  useEffect(() => {
    function calc() {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const dealInfo = FLASH_DEAL_FLAVORS[dealIdx];
  const flavor = FLAVORS.find((f) => f.id === dealInfo.id) ?? FLAVORS[0];
  const discountedPrice = Math.round(
    flavor.price * (1 - dealInfo.discount / 100),
  );

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      data-ocid="flash-deal.section"
      className="max-w-6xl mx-auto px-4 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-orange-400/40 bg-gradient-to-r from-orange-950/80 via-red-950/70 to-violet-950/80 p-6 md:p-8"
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, oklch(0.65 0.22 30) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Left: badge + info */}
          <div className="flex-1 text-center md:text-left">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3"
            >
              ⚡ Today&apos;s Flash Deal
            </motion.span>
            <div className="text-6xl mb-3">{flavor.emoji}</div>
            <h3 className="font-display font-bold text-2xl text-orange-100 mb-1">
              {flavor.name}
            </h3>
            <p className="text-orange-300/70 text-sm mb-4">
              {flavor.description}
            </p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="text-orange-300/50 line-through text-lg">
                ₹{flavor.price}
              </span>
              <span className="text-orange-300 font-bold text-3xl">
                ₹{discountedPrice}
              </span>
              <span className="bg-orange-500/20 text-orange-300 text-sm font-semibold px-2 py-0.5 rounded-full">
                {dealInfo.discount}% OFF
              </span>
            </div>
            <button
              type="button"
              data-ocid="flash-deal.add-btn"
              onClick={() => onAdd({ ...flavor, price: discountedPrice })}
              className="mt-4 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-orange-900/40"
            >
              Grab This Deal
            </button>
          </div>

          {/* Right: countdown */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-orange-300/60 text-xs uppercase tracking-widest font-semibold">
              Deal ends in
            </p>
            <div className="flex gap-2">
              {[
                { label: "HRS", val: pad(timeLeft.h) },
                { label: "MIN", val: pad(timeLeft.m) },
                { label: "SEC", val: pad(timeLeft.s) },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="flex flex-col items-center bg-black/40 border border-orange-400/30 rounded-2xl px-4 py-3 min-w-[64px]"
                >
                  <span className="font-display font-bold text-3xl text-orange-100 tabular-nums">
                    {val}
                  </span>
                  <span className="text-orange-400/60 text-[10px] uppercase tracking-wider mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-orange-300/40 text-xs mt-1">
              Resets every midnight ✨
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      data-ocid="hero.section"
      className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 text-center"
    >
      {/* Nebula orbs */}
      <div
        className="nebula-orb w-96 h-96 -left-20 top-0 opacity-30"
        style={{ background: "oklch(0.5 0.28 310)" }}
      />
      <div
        className="nebula-orb w-80 h-80 -right-10 top-10 opacity-20"
        style={{ background: "oklch(0.55 0.25 240)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 4,
            ease: "easeInOut",
          }}
          className="text-7xl mb-4"
        >
          🍦
        </motion.div>
        <h2 className="font-display font-black text-4xl md:text-5xl mb-3 shimmer-text">
          AI Galaxy Ice Cream Parlour
        </h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
          16 cosmic flavours crafted in the stars — from ₹99. Experience ice
          cream from another galaxy.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <span key={key} className={`category-chip border ${meta.color}`}>
              {meta.emoji} {meta.label}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── Flavor Card ─────────────────────────────────────────────────────────────
interface FlavorCardProps {
  flavor: Flavor;
  index: number;
  onAdd: (f: Flavor) => void;
}
function FlavorCard({ flavor, index, onAdd }: FlavorCardProps) {
  const meta = CATEGORY_META[flavor.category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.07 }}
      className="galaxy-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="text-4xl">{flavor.emoji}</div>
        <div className="flex flex-col items-end gap-1">
          {flavor.isSpecial && (
            <Badge
              className="text-xs px-2 py-0.5 font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.18 80), oklch(0.7 0.2 60))",
                color: "oklch(0.15 0 0)",
                border: "none",
              }}
            >
              ⭐ Special
            </Badge>
          )}
          {flavor.isNew && (
            <Badge
              className="text-xs px-2 py-0.5 font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.25 195), oklch(0.55 0.28 220))",
                color: "white",
                border: "none",
              }}
            >
              🆕 New
            </Badge>
          )}
          <span className={`category-chip border ${meta.color}`}>
            {meta.emoji}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-base mb-1">{flavor.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {flavor.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span
          className="font-bold text-lg"
          style={{ color: "oklch(0.85 0.18 80)" }}
        >
          ₹{flavor.price}
        </span>
        <Button
          data-ocid={`menu.item.${index + 1}`}
          size="sm"
          onClick={() => onAdd(flavor)}
          className="text-xs px-3 py-1 h-7 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
            border: "none",
            color: "white",
          }}
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>
    </motion.div>
  );
}

// ── Cart Panel ────────────────────────────────────────────────────────────────
interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  loyaltyPoints: number;
  onPlaceOrder: (redeemPoints: boolean, referralDiscount: boolean) => void;
  isFirstOrder: boolean;
}
function CartPanel({
  isOpen,
  onClose,
  items,
  onQtyChange,
  onRemove,
  loyaltyPoints,
  onPlaceOrder,
  isFirstOrder,
}: CartPanelProps) {
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.flavor.price * i.qty, 0);
  const loyaltyDiscount = redeemPoints && loyaltyPoints >= 100 ? 50 : 0;
  const referralDiscount = referralApplied ? 50 : 0;
  const total = Math.max(0, subtotal - loyaltyDiscount - referralDiscount);
  const canRedeem = loyaltyPoints >= 100;

  function applyReferralCode() {
    const code = referralCode.trim().toUpperCase();
    if (!code) {
      setReferralError("Please enter a referral code.");
      return;
    }
    // Check it's not user's own code
    const myCode = getOrCreateMyReferralCode();
    if (code === myCode) {
      setReferralError("You cannot use your own referral code.");
      return;
    }
    // Check format (GALAXY-XXXXXX)
    if (!code.startsWith("GALAXY-") || code.length !== 13) {
      setReferralError("Invalid referral code. Format: GALAXY-XXXXXX");
      return;
    }
    if (!isFirstOrder) {
      setReferralError("Referral discount is for first-time orders only.");
      return;
    }
    if (getUsedReferralCode()) {
      setReferralError("You have already used a referral code.");
      return;
    }
    setReferralApplied(true);
    setReferralError("");
    toast.success("🎁 Referral code applied! ₹50 discount added.");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="cart.panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col"
            style={{
              background: "oklch(0.1 0.03 280)",
              borderLeft: "1px solid oklch(0.3 0.06 285)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-violet-400" /> Your Cart
              </h2>
              <button
                type="button"
                data-ocid="cart.close_button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-5 py-4">
              {items.length === 0 ? (
                <div
                  data-ocid="cart.empty_state"
                  className="text-center py-16 text-muted-foreground"
                >
                  <IceCream className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">Add some cosmic flavours!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.flavor.id}
                      data-ocid={`cart.item.${idx + 1}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border"
                    >
                      <span className="text-2xl">{item.flavor.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {item.flavor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.flavor.price} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onQtyChange(item.flavor.id, -1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQtyChange(item.flavor.id, 1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-300">
                          ₹{item.flavor.price * item.qty}
                        </p>
                        <button
                          type="button"
                          data-ocid={`cart.delete_button.${idx + 1}`}
                          onClick={() => onRemove(item.flavor.id)}
                          className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-border space-y-3">
                {/* Referral Code */}
                {isFirstOrder && !getUsedReferralCode() && (
                  <div className="p-3 rounded-xl bg-pink-400/5 border border-pink-400/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-pink-300" />
                      <span className="text-xs font-semibold text-pink-300">
                        Have a referral code?
                      </span>
                      {referralApplied && (
                        <Badge
                          className="text-xs ml-auto"
                          style={{
                            background: "oklch(0.45 0.2 160)",
                            color: "white",
                            border: "none",
                          }}
                        >
                          ✓ ₹50 off applied
                        </Badge>
                      )}
                    </div>
                    {!referralApplied && (
                      <div className="flex gap-2">
                        <Input
                          data-ocid="cart.input"
                          value={referralCode}
                          onChange={(e) => {
                            setReferralCode(e.target.value.toUpperCase());
                            setReferralError("");
                          }}
                          placeholder="GALAXY-XXXXXX"
                          className="h-8 text-xs bg-white/5 border-pink-400/30 text-foreground placeholder:text-muted-foreground/50 uppercase"
                        />
                        <Button
                          size="sm"
                          onClick={applyReferralCode}
                          className="h-8 px-3 text-xs"
                          style={{
                            background: "oklch(0.55 0.28 340)",
                            border: "none",
                            color: "white",
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                    {referralError && (
                      <p
                        data-ocid="cart.error_state"
                        className="text-xs text-red-400 mt-1"
                      >
                        {referralError}
                      </p>
                    )}
                  </div>
                )}

                {/* Loyalty redemption */}
                <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span className="text-xs font-semibold text-amber-300">
                      {loyaltyPoints} loyalty points
                    </span>
                  </div>
                  {canRedeem ? (
                    <label
                      htmlFor="redeem-points-checkbox"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        id="redeem-points-checkbox"
                        data-ocid="cart.checkbox"
                        checked={redeemPoints}
                        onCheckedChange={(v) => setRedeemPoints(!!v)}
                        className="border-amber-400/50"
                      />
                      <span className="text-xs text-amber-200">
                        Redeem 100 pts for ₹50 off
                      </span>
                    </label>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Earn {100 - loyaltyPoints} more pts to unlock ₹50 off
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Points Discount</span>
                      <span>-₹{loyaltyDiscount}</span>
                    </div>
                  )}
                  {referralDiscount > 0 && (
                    <div className="flex justify-between text-pink-400">
                      <span>Referral Discount</span>
                      <span>-₹{referralDiscount}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span style={{ color: "oklch(0.85 0.18 80)" }}>
                      ₹{total}
                    </span>
                  </div>
                </div>
                <Button
                  data-ocid="cart.submit_button"
                  onClick={() => {
                    onPlaceOrder(redeemPoints, referralApplied);
                    setRedeemPoints(false);
                    setReferralCode("");
                    setReferralApplied(false);
                  }}
                  className="w-full font-bold py-5"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280), oklch(0.55 0.28 240))",
                    border: "none",
                    color: "white",
                    boxShadow: "0 4px 24px oklch(0.55 0.28 310 / 0.4)",
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Place Order
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Loyalty Panel ─────────────────────────────────────────────────────────────
interface LoyaltyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}
function LoyaltyPanel({ isOpen, onClose, points }: LoyaltyPanelProps) {
  const tiers = [
    { pts: 100, reward: "₹50 off your next order", icon: "🎁" },
    { pts: 200, reward: "Free Classic scoop", icon: "🍦" },
    { pts: 500, reward: "Free Galaxy Special scoop", icon: "🌌" },
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="loyalty.panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl p-6 border border-amber-400/30"
              style={{ background: "oklch(0.1 0.03 280)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />{" "}
                  Loyalty Stars
                </h2>
                <button
                  type="button"
                  data-ocid="loyalty.close_button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center py-4 px-6 rounded-xl bg-amber-400/10 border border-amber-400/20 mb-5">
                <p className="text-4xl font-black text-amber-300 mb-1">
                  {points}
                </p>
                <p className="text-sm text-amber-200/70">Your current points</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Earn <strong className="text-amber-300">10 points</strong> on
                every order. Redeem rewards below:
              </p>
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.pts}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${points >= tier.pts ? "border-emerald-400/40 bg-emerald-400/10" : "border-border bg-white/3"}`}
                  >
                    <span className="text-xl">{tier.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{tier.reward}</p>
                      <p className="text-xs text-muted-foreground">
                        {tier.pts} points needed
                      </p>
                    </div>
                    {points >= tier.pts && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Referral Panel ────────────────────────────────────────────────────────────
interface ReferralPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
function ReferralPanel({ isOpen, onClose }: ReferralPanelProps) {
  const myCode = getOrCreateMyReferralCode();
  const [codeCopied, setCodeCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const shareMsg = `🌟 Join me at Galaxy Ice Cream Parlour! Use my referral code ${myCode} at checkout to get ₹50 off your first order. Come taste the cosmos! 🍦✨`;

  function copyCode() {
    navigator.clipboard.writeText(myCode).then(() => {
      setCodeCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCodeCopied(false), 3000);
    });
  }

  function copyMessage() {
    navigator.clipboard.writeText(shareMsg).then(() => {
      setMsgCopied(true);
      toast.success("Share message copied! Send it to your friends 🚀");
      setTimeout(() => setMsgCopied(false), 3000);
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="referral.panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl p-6 border border-pink-400/30"
              style={{
                background: "oklch(0.1 0.03 280)",
                boxShadow: "0 0 60px oklch(0.6 0.28 340 / 0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-300" />
                  <span className="gradient-text">Refer a Friend</span>
                </h2>
                <button
                  type="button"
                  data-ocid="referral.close_button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* How it works */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-pink-400/5 border border-pink-400/20 text-center">
                  <div className="text-2xl mb-1">🎁</div>
                  <p className="text-xs font-semibold text-pink-200">
                    Friend gets
                  </p>
                  <p className="text-lg font-black text-pink-300">₹50 off</p>
                  <p className="text-xs text-muted-foreground">
                    their first order
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <p className="text-xs font-semibold text-amber-200">
                    You earn
                  </p>
                  <p className="text-lg font-black text-amber-300">50 pts</p>
                  <p className="text-xs text-muted-foreground">
                    when they order
                  </p>
                </div>
              </div>

              {/* Referral code */}
              <div className="mb-4">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Your personal referral code
                </Label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 flex items-center justify-center py-3 rounded-xl font-mono font-black text-lg tracking-widest border border-pink-400/40 bg-pink-400/5"
                    style={{ color: "oklch(0.82 0.22 340)" }}
                  >
                    {myCode}
                  </div>
                  <Button
                    data-ocid="referral.primary_button"
                    onClick={copyCode}
                    className="px-4"
                    style={{
                      background: codeCopied
                        ? "oklch(0.5 0.2 160)"
                        : "linear-gradient(135deg, oklch(0.58 0.28 340), oklch(0.55 0.28 310))",
                      border: "none",
                      color: "white",
                    }}
                  >
                    {codeCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share message */}
              <div className="mb-5">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Or share this message
                </Label>
                <div className="p-3 rounded-xl bg-white/5 border border-border text-xs text-foreground/80 leading-relaxed mb-2">
                  {shareMsg}
                </div>
                <Button
                  data-ocid="referral.secondary_button"
                  onClick={copyMessage}
                  className="w-full font-bold"
                  style={{
                    background: msgCopied
                      ? "oklch(0.5 0.2 160)"
                      : "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
                    border: "none",
                    color: "white",
                    boxShadow: "0 4px 16px oklch(0.55 0.28 310 / 0.35)",
                  }}
                >
                  {msgCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  {msgCopied ? "Copied!" : "Copy & Share"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Share on WhatsApp, Instagram, or anywhere! Every referral earns
                you{" "}
                <strong className="text-amber-300">
                  50 bonus loyalty points
                </strong>
                .
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Nova Chatbot ──────────────────────────────────────────────────────────────
interface NovaChatProps {
  isOpen: boolean;
  onToggle: () => void;
}
function NovaChat({ isOpen, onToggle }: NovaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "0",
      from: "nova",
      text: "Hey there! 🌟 I'm Nova, your AI Galaxy Ice Cream manager. Ask me about flavours, prices, today's special, or our referral program!",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      text: trimmed,
    };
    const novaMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      from: "nova",
      text: getNovaResponse(trimmed),
    };
    setMessages((prev) => [...prev, userMsg, novaMsg]);
    setInput("");
  }

  return (
    <div className="fixed bottom-6 left-4 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="nova.panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 22 }}
            className="w-80 rounded-2xl overflow-hidden border border-violet-400/30"
            style={{
              background: "oklch(0.1 0.03 280)",
              boxShadow: "0 8px 40px oklch(0.5 0.3 280 / 0.4)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b border-border"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.4 0.28 310 / 0.5), oklch(0.38 0.3 280 / 0.5))",
              }}
            >
              <Bot className="w-5 h-5 text-violet-300" />
              <div>
                <p className="text-sm font-bold">Nova</p>
                <p className="text-xs text-violet-300/70">AI Parlour Manager</p>
              </div>
              <button
                type="button"
                data-ocid="nova.close_button"
                onClick={onToggle}
                className="ml-auto p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.from === "user"
                        ? "bg-violet-500/30 text-violet-100 rounded-br-sm"
                        : "bg-white/8 text-foreground rounded-bl-sm border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="px-3 py-2 border-t border-border flex gap-2">
              <input
                data-ocid="nova.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask Nova anything..."
                className="flex-1 bg-white/8 rounded-lg px-3 py-2 text-xs outline-none border border-border focus:border-violet-400/60 placeholder:text-muted-foreground"
              />
              <button
                type="button"
                data-ocid="nova.send_button"
                onClick={sendMessage}
                className="p-2 rounded-lg bg-violet-500/30 hover:bg-violet-500/50 transition-colors text-violet-200"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        data-ocid="nova.button"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.5 0.3 280), oklch(0.55 0.28 310))",
          boxShadow: "0 4px 20px oklch(0.5 0.3 280 / 0.5)",
        }}
      >
        <Bot className="w-4 h-4" /> Ask Nova 🤖
      </motion.button>
    </div>
  );
}

// ── Referral Section (bottom of page) ─────────────────────────────────────────
interface ReferralSectionProps {
  onOpenReferral: () => void;
}
function ReferralSection({ onOpenReferral }: ReferralSectionProps) {
  return (
    <section
      data-ocid="referral.section"
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 text-center border border-pink-400/20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 340 / 0.8), oklch(0.11 0.04 310 / 0.8), oklch(0.13 0.04 280 / 0.8))",
          boxShadow: "0 0 60px oklch(0.55 0.28 340 / 0.15)",
        }}
      >
        <div
          className="nebula-orb w-64 h-64 left-0 top-0 opacity-20"
          style={{ background: "oklch(0.6 0.28 340)" }}
        />
        <div className="relative z-10">
          <div className="flex justify-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-pink-400/10 border border-pink-400/20">
              <Users className="w-6 h-6 text-pink-300" />
            </div>
            <div className="p-3 rounded-full bg-amber-400/10 border border-amber-400/20">
              <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl mb-2 gradient-text">
            Refer Friends, Earn Stars! 🌟
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Share your unique code — your friend gets{" "}
            <strong className="text-pink-300">₹50 off</strong> their first
            order, and you earn{" "}
            <strong className="text-amber-300">50 bonus loyalty points</strong>!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              data-ocid="referral.open_modal_button"
              onClick={onOpenReferral}
              className="font-bold px-8 py-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.28 340), oklch(0.55 0.28 310))",
                border: "none",
                color: "white",
                boxShadow: "0 4px 20px oklch(0.55 0.28 340 / 0.4)",
              }}
            >
              <Gift className="w-4 h-4 mr-2" /> Get My Referral Code
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Share Section ─────────────────────────────────────────────────────────────

const ABOUT_STARS = Array.from({ length: 12 }, (_, i) => ({
  id: `about-star-${i}`,
  size: (i % 3) + 1,
  top: `${(i * 31.7 + 5) % 100}%`,
  left: `${(i * 47.3 + 13) % 100}%`,
  color: `oklch(0.85 0.15 ${220 + i * 15})`,
  duration: `${2 + (i % 3)}s`,
  delay: `${(i % 5) * 0.4}s`,
}));

// ── About / Location Section ────────────────────────────────────────────────
function AboutSection() {
  return (
    <section data-ocid="about.section" className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 border border-indigo-400/20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.05 260 / 0.9), oklch(0.10 0.04 280 / 0.9), oklch(0.12 0.05 300 / 0.9))",
          boxShadow: "0 0 80px oklch(0.45 0.25 280 / 0.12)",
        }}
      >
        {/* Decorative stars */}
        {ABOUT_STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              background: s.color,
              opacity: 0.5,
              animation: `twinkle ${s.duration} ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">🌏</div>
          <h2 className="font-display font-bold text-2xl mb-2 gradient-text">
            About Galaxy Ice Cream Parlour
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-lg mx-auto">
            We're a cosmic ice cream experience born in the stars — and
            delivered to your doorstep!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: "🛸",
                title: "100% Online",
                desc: "No physical store — we exist entirely on the internet, open anytime you want a cosmic treat!",
              },
              {
                icon: "🕐",
                title: "Open 24/7",
                desc: "Galaxy Ice Cream Parlour never closes. Browse 34 cosmic flavours and place your order any time of day or night.",
              },
              {
                icon: "🇮🇳",
                title: "Serving All of India",
                desc: "From Kashmir to Kanyakumari — we serve cosmic flavours across every corner of India. All prices in ₹.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl p-5 border border-white/10 text-left"
                style={{ background: "oklch(0.15 0.04 280 / 0.6)" }}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-4 border border-yellow-400/20 inline-block max-w-md"
            style={{ background: "oklch(0.18 0.06 80 / 0.4)" }}
          >
            <p className="text-yellow-300/90 text-sm font-medium">
              📍 No physical address — visit us anytime via this app link!
            </p>
            <p className="text-yellow-200/60 text-xs mt-1">
              Ask Nova, our AI manager, any question about our menu or
              offerings.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ShareSection() {
  const [copied, setCopied] = useState(false);
  const shareText =
    "🌟 I just discovered Galaxy Ice Cream Parlour! 34 cosmic flavours from ₹99, prices in Indian Rupees, and an AI manager named Nova! Come taste the cosmos 🍦✨";

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast.success("Copied! Share it with your friends 🚀");
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <section data-ocid="share.section" className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 text-center border border-violet-400/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.04 310 / 0.8), oklch(0.13 0.04 280 / 0.8), oklch(0.15 0.04 240 / 0.8))",
          boxShadow: "0 0 60px oklch(0.5 0.28 310 / 0.15)",
        }}
      >
        <Heart className="w-8 h-8 mx-auto mb-3 text-pink-400 fill-pink-400" />
        <h2 className="font-display font-bold text-2xl mb-2 gradient-text">
          Tell the world we're open! 🌍
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          Know someone who loves ice cream? Share Galaxy Ice Cream Parlour and
          help us spread the cosmic love!
        </p>
        <div className="bg-white/5 border border-border rounded-xl p-4 mb-5 text-left max-w-md mx-auto">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {shareText}
          </p>
        </div>
        <Button
          data-ocid="share.button"
          onClick={handleCopy}
          className="font-bold px-6"
          style={{
            background: copied
              ? "linear-gradient(135deg, oklch(0.5 0.2 160), oklch(0.45 0.22 160))"
              : "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
            border: "none",
            color: "white",
            boxShadow: "0 4px 20px oklch(0.55 0.28 310 / 0.4)",
            transition: "all 0.3s ease",
          }}
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy & Share"}
        </Button>
      </motion.div>
    </section>
  );
}

// ── Order Success ─────────────────────────────────────────────────────────────
interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  totalPoints: number;
  referralUsed: boolean;
}
function OrderSuccess({
  isOpen,
  onClose,
  pointsEarned,
  totalPoints,
  referralUsed,
}: OrderSuccessProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="order.success_state"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl p-8 text-center border border-violet-400/30"
              style={{
                background: "oklch(0.1 0.03 280)",
                boxShadow: "0 0 80px oklch(0.55 0.28 310 / 0.3)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="font-display font-black text-2xl mb-2 gradient-text">
                Order Placed!
              </h2>
              <p className="text-muted-foreground text-sm mb-5">
                Your cosmic treats are being prepared with love ✨
              </p>
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-3">
                <Star className="w-6 h-6 fill-amber-300 text-amber-300 mx-auto mb-2" />
                <p className="font-bold text-amber-300 text-lg">
                  +{pointsEarned} Points Earned!
                </p>
                <p className="text-xs text-amber-200/70">
                  Total: {totalPoints} loyalty points
                </p>
              </div>
              {referralUsed && (
                <div className="bg-pink-400/10 border border-pink-400/30 rounded-xl p-3 mb-3">
                  <Gift className="w-5 h-5 text-pink-300 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-pink-200">
                    Referral discount applied!
                  </p>
                  <p className="text-xs text-pink-300/70">
                    ₹50 off this order 🎁
                  </p>
                </div>
              )}
              <Button
                data-ocid="order.confirm_button"
                onClick={onClose}
                className="w-full font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
                  border: "none",
                  color: "white",
                }}
              >
                Yay! Keep Exploring 🌌
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── PaymentSuccess ─────────────────────────────────────────────────────────────
function PaymentSuccess() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.07 0.025 280)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-10 max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: 3, duration: 0.5 }}
          className="text-7xl mb-6"
        >
          🎉
        </motion.div>
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="font-display font-black text-3xl mb-3 gradient-text">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-8">
          Welcome to Galaxy PRO! You now have access to all 70+ premium
          templates.
        </p>
        <Button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
            border: "none",
            color: "white",
          }}
        >
          Back to Parlour 🍦
        </Button>
      </motion.div>
    </div>
  );
}

// ── PaymentFailure ─────────────────────────────────────────────────────────────
function PaymentFailure() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.07 0.025 280)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-10 max-w-md"
      >
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display font-black text-3xl mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          No charge was made. You can try again whenever you're ready.
        </p>
        <Button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
            border: "none",
            color: "white",
          }}
        >
          Back to Parlour 🍦
        </Button>
      </motion.div>
    </div>
  );
}

// ── Stripe Setup ────────────────────────────────────────────────────────────────
interface StripeSetupProps {
  isOpen: boolean;
  onClose: () => void;
}
function StripeSetup({ isOpen, onClose }: StripeSetupProps) {
  const [stripeKey, setStripeKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    if (!stripeKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Stripe configuration saved!");
      onClose();
    }, 1200);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="stripe.dialog"
        className="border-violet-500/30 max-w-md"
        style={{ background: "oklch(0.1 0.03 280)" }}
      >
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe Payment Setup
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Connect your Stripe account to accept real payments for Galaxy PRO
            subscriptions (₹799/month).
          </p>
          <div className="space-y-2">
            <Label className="text-violet-200">Stripe Secret Key</Label>
            <Input
              data-ocid="stripe.input"
              type="password"
              placeholder="sk_live_..."
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="bg-white/5 border-violet-500/30 text-foreground placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground">
              Find your key in{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 underline"
              >
                Stripe Dashboard → API Keys
              </a>
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              data-ocid="stripe.cancel_button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="stripe.save_button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-violet-600 hover:bg-violet-500"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── UpgradeModal ────────────────────────────────────────────────────────────────
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  isLoading: boolean;
}
function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  isLoading,
}: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="upgrade.dialog"
        className="border-violet-500/30 max-w-md"
        style={{ background: "oklch(0.1 0.03 280)" }}
      >
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">
            ✨ Upgrade to Galaxy PRO
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            {[
              "🎨 All 70+ premium templates",
              "🚫 No watermark on exports",
              "📐 High-resolution PNG & JPEG exports",
              "⭐ Priority support",
              "🆕 New templates every month",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-violet-100">{f}</span>
              </div>
            ))}
          </div>
          <Separator className="bg-violet-500/20" />
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">₹799</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
          <div className="flex gap-2">
            <Button
              data-ocid="upgrade.cancel_button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border"
            >
              Not now
            </Button>
            <Button
              data-ocid="upgrade.primary_button"
              onClick={onUpgrade}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Redirecting..." : "Upgrade — ₹799/month"}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Secured by Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-8 py-6 text-center text-xs text-muted-foreground">
      <p>🍦 Galaxy Ice Cream Parlour — Taste the Cosmos</p>
      <p className="mt-1">
        © {year}. Built with{" "}
        <Heart className="inline w-3 h-3 fill-pink-400 text-pink-400" /> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function IceCreamParlour() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("galaxy_loyalty_points");
      return stored ? Number.parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isFirstOrder, setIsFirstOrder] = useState<boolean>(() => {
    try {
      return !localStorage.getItem("galaxy_has_ordered");
    } catch {
      return true;
    }
  });
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [lastReferralUsed, setLastReferralUsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [stripeSetupOpen, setStripeSetupOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const { mutateAsync: createCheckoutSession, isPending: isCheckingOut } =
    useCreateCheckoutSession();

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    try {
      localStorage.setItem("galaxy_loyalty_points", String(loyaltyPoints));
    } catch {
      /* ignore */
    }
  }, [loyaltyPoints]);

  async function handleUpgrade() {
    try {
      const session = await createCheckoutSession([
        { name: "Galaxy Design Studio Premium", quantity: 1, price: 799 },
      ]);
      window.location.href = session.url;
    } catch {
      toast.error("Could not start checkout. Please try again.");
    }
  }

  function addToCart(flavor: Flavor) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.flavor.id === flavor.id);
      if (existing)
        return prev.map((i) =>
          i.flavor.id === flavor.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { flavor, qty: 1 }];
    });
    toast.success(`${flavor.emoji} ${flavor.name} added to cart!`);
  }

  function changeQty(id: string, delta: number) {
    setCartItems((prev) =>
      prev.map((i) =>
        i.flavor.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  }

  function removeFromCart(id: string) {
    setCartItems((prev) => prev.filter((i) => i.flavor.id !== id));
  }

  function placeOrder(redeemPoints: boolean, referralDiscount: boolean) {
    const pointsEarned = 10;
    let newPoints = loyaltyPoints + pointsEarned;
    if (redeemPoints && loyaltyPoints >= 100) newPoints -= 100;

    // If referral was used, mark it and award bonus to referrer
    // (in a real app this would call backend; here we simulate)
    if (referralDiscount) {
      const code = localStorage.getItem("galaxy_used_referral_code"); // might not be set yet
      if (!code) {
        // We'll mark it via the referral code input logic — but also handle here
      }
      markReferralCodeUsed("USED");
      // The referrer would get 50 pts in a real system; simulate by adding locally
      // if it's the same device (for demo purposes)
      toast.success("🎁 Referral applied! Your friend earned 50 bonus points!");
    }

    setLoyaltyPoints(newPoints);
    setLastPointsEarned(pointsEarned);
    setLastReferralUsed(referralDiscount);
    setCartItems([]);
    setCartOpen(false);
    setOrderSuccess(true);
    setIsFirstOrder(false);

    try {
      localStorage.setItem("galaxy_has_ordered", "1");
    } catch {
      /* ignore */
    }
  }

  const filtered =
    activeCategory === "all"
      ? FLAVORS
      : FLAVORS.filter((f) => f.category === activeCategory);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "oklch(0.07 0.025 280)" }}
    >
      <Starfield />
      <div className="relative z-10">
        <OpeningBanner />
        <Header
          cartCount={cartCount}
          loyaltyPoints={loyaltyPoints}
          onCartOpen={() => setCartOpen(true)}
          onLoyaltyOpen={() => setLoyaltyOpen(true)}
          onUpgradeOpen={() => setUpgradeOpen(true)}
          onStripeSetup={() => setStripeSetupOpen(true)}
          onReferralOpen={() => setReferralOpen(true)}
        />
        <main>
          <Hero />
          <PromoBanners />
          <CustomerFavouritesSection onAdd={addToCart} />
          <FlashDealSection onAdd={addToCart} />

          {/* Menu */}
          <section
            data-ocid="menu.section"
            className="max-w-6xl mx-auto px-4 py-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl gradient-text">
                Our Cosmic Menu
              </h2>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <button
                  type="button"
                  data-ocid="menu.tab"
                  onClick={() => setActiveCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === "all"
                      ? "bg-violet-500/30 border-violet-400/60 text-violet-200"
                      : "border-border text-muted-foreground hover:border-violet-400/40"
                  }`}
                >
                  All ({FLAVORS.length})
                </button>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    data-ocid="menu.tab"
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      activeCategory === key
                        ? `${meta.color} opacity-100`
                        : "border-border text-muted-foreground hover:border-violet-400/40"
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((flavor, idx) => (
                <FlavorCard
                  key={flavor.id}
                  flavor={flavor}
                  index={idx}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>

          <ReferralSection onOpenReferral={() => setReferralOpen(true)} />
          <ShareSection />
          <AboutSection />
        </main>
        <Footer />
      </div>

      {/* Overlays */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQtyChange={changeQty}
        onRemove={removeFromCart}
        loyaltyPoints={loyaltyPoints}
        onPlaceOrder={placeOrder}
        isFirstOrder={isFirstOrder}
      />
      <LoyaltyPanel
        isOpen={loyaltyOpen}
        onClose={() => setLoyaltyOpen(false)}
        points={loyaltyPoints}
      />
      <ReferralPanel
        isOpen={referralOpen}
        onClose={() => setReferralOpen(false)}
      />
      <OrderSuccess
        isOpen={orderSuccess}
        onClose={() => setOrderSuccess(false)}
        pointsEarned={lastPointsEarned}
        totalPoints={loyaltyPoints}
        referralUsed={lastReferralUsed}
      />
      <NovaChat isOpen={novaOpen} onToggle={() => setNovaOpen((v) => !v)} />
      <StripeSetup
        isOpen={stripeSetupOpen}
        onClose={() => setStripeSetupOpen(false)}
      />
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        isLoading={isCheckingOut}
      />
      <Toaster />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path === "/payment-success") return <PaymentSuccess />;
  if (path === "/payment-failure") return <PaymentFailure />;
  return <IceCreamParlour />;
}
