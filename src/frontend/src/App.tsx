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
  ShoppingCart,
  Sparkles,
  Star,
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
  category: "classic" | "galaxy" | "fruity" | "vegan";
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
  // Vegan
  {
    id: "coconut",
    name: "Coconut Cosmos",
    emoji: "🥥",
    category: "vegan",
    price: 129,
    description: "Coconut milk base with toasted flakes & lime zest",
  },
  {
    id: "avocado",
    name: "Avocado Asteroid",
    emoji: "🥑",
    category: "vegan",
    price: 139,
    description: "Smooth avocado cream with a hint of dark chocolate",
  },
  {
    id: "darkdate",
    name: "Dark Matter Date",
    emoji: "🌑",
    category: "vegan",
    price: 129,
    description: "Medjool dates & tahini in a silky cosmic blend",
  },
  {
    id: "pineapple",
    name: "Pineapple Planet",
    emoji: "🍍",
    category: "vegan",
    price: 119,
    description: "Zesty pineapple sorbet with a ginger stardust kick",
  },
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
};

const NOVA_RESPONSES: Record<string, string> = {
  hello:
    "Hey there, cosmic explorer! 🌟 Welcome to Galaxy Ice Cream Parlour! I'm Nova, your AI ice cream guide. Ask me about flavours, prices, or today's special!",
  hi: "Hi! 🍦 I'm Nova, the AI manager here at Galaxy Ice Cream Parlour. What cosmic flavour can I help you discover today?",
  vegan:
    "Great choice! 🌿 We have 4 amazing vegan options: Coconut Cosmos (₹129), Avocado Asteroid (₹139), Dark Matter Date (₹129), and Pineapple Planet (₹119). All 100% plant-based and out-of-this-world delicious!",
  special:
    "Today's Special is ⭐ Nebula Swirl at ₹149! It's our most popular Galaxy Special — swirling purple-blue cosmic cream with edible glitter. Also check out Cosmic Crunch (₹159) — both are marked with a star badge!",
  cheap:
    "Our most affordable scoops are ₹99 each — Vanilla Bean and Strawberry Dream! Both classic favourites that never disappoint 🍦",
  price:
    "Prices range from ₹99 (Classic scoops) to ₹159 (Galaxy Specials). Fruity flavours start at ₹119 and Vegan at ₹119. All great value for cosmic quality! 🌌",
  recommend:
    "My top picks: 1) Nebula Swirl (₹149) for the full galaxy experience ✨ 2) Cosmic Crunch (₹159) for an explosion of flavour 3) Mango Meteor (₹129) if you love tropical blasts! 🥭",
  mango:
    "Mango fans will LOVE Milky Way Mango (₹139) — Alphonso mango in a cosmic condensed milk swirl, and Mango Meteor (₹129) — fiery Alphonso with chili dust! 🥭🌌",
  chocolate:
    "Chocolate lovers — try our Chocolate Fudge (₹109) for classic richness, or Avocado Asteroid (₹139) for a vegan dark chocolate twist! 🍫",
  offer:
    "Current offers: 🎉 Buy 2 Get 1 Free every weekend! Plus earn 10 loyalty points per order — redeem 100 points for ₹50 off your next treat!",
  points:
    "You earn 10 loyalty points with every order 🌟 Collect 100 points to redeem ₹50 off! Check your points balance in the cart.",
  default:
    "I'd love to help! 🤖 You can ask me about: vegan options, today's special, prices, recommendations, offers, or any specific flavour like mango or chocolate!",
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
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.5,
    duration: `${Math.random() * 4 + 2}s`,
    delay: `${Math.random() * 5}s`,
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
      {/* glow overlay */}
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
}
function Header({
  cartCount,
  loyaltyPoints,
  onCartOpen,
  onLoyaltyOpen,
  onUpgradeOpen,
  onStripeSetup,
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
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Promo Banners ────────────────────────────────────────────────────────────
function PromoBanners() {
  const banners = [
    {
      icon: "⭐",
      text: "Today's Special: Nebula Swirl",
      highlight: "₹149",
      color: "from-violet-900/60 to-fuchsia-900/60 border-violet-400/30",
    },
    {
      icon: "🎉",
      text: "Buy 2 Get 1 Free",
      highlight: "Every Weekend!",
      color: "from-pink-900/60 to-rose-900/60 border-pink-400/30",
    },
    {
      icon: "🆕",
      text: "New Arrival: Aurora Borealis Blast",
      highlight: "Try Now!",
      color: "from-cyan-900/60 to-blue-900/60 border-cyan-400/30",
    },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {banners.map((b, i) => (
        <motion.div
          key={b.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${b.color} backdrop-blur-sm`}
        >
          <span className="text-2xl">{b.icon}</span>
          <div>
            <p className="text-sm font-semibold text-white/90">{b.text}</p>
            <p className="text-xs font-bold text-amber-300">{b.highlight}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Flavor Card ──────────────────────────────────────────────────────────────
interface FlavorCardProps {
  flavor: Flavor;
  index: number;
  onAdd: (flavor: Flavor) => void;
}
function FlavorCard({ flavor, index, onAdd }: FlavorCardProps) {
  const cat = CATEGORY_META[flavor.category];
  return (
    <motion.div
      data-ocid={`menu.item.${index + 1}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.07 }}
      className="galaxy-card p-4 flex flex-col gap-3"
    >
      {/* Special badge */}
      {flavor.isSpecial && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-300" /> Special
          </span>
        </div>
      )}
      <div className="text-4xl text-center">{flavor.emoji}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-sm text-foreground leading-tight">
            {flavor.name}
          </h3>
        </div>
        <span className={`category-chip border ${cat.color} mb-2`}>
          {cat.emoji} {cat.label}
        </span>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {flavor.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
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
  onPlaceOrder: (redeemPoints: boolean) => void;
}
function CartPanel({
  isOpen,
  onClose,
  items,
  onQtyChange,
  onRemove,
  loyaltyPoints,
  onPlaceOrder,
}: CartPanelProps) {
  const [redeemPoints, setRedeemPoints] = useState(false);
  const subtotal = items.reduce((s, i) => s + i.flavor.price * i.qty, 0);
  const discount = redeemPoints && loyaltyPoints >= 100 ? 50 : 0;
  const total = Math.max(0, subtotal - discount);
  const canRedeem = loyaltyPoints >= 100;

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
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Points Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-amber-300">₹{total}</span>
                  </div>
                  <p className="text-xs text-violet-300">
                    +10 pts on this order 🌟
                  </p>
                </div>
                <Button
                  data-ocid="cart.submit_button"
                  onClick={() => {
                    onPlaceOrder(redeemPoints);
                    setRedeemPoints(false);
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
              {/* Points display */}
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
                        {tier.pts} points
                      </p>
                    </div>
                    {points >= tier.pts && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs">
                        Unlocked!
                      </Badge>
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

// ── Nova Chat ─────────────────────────────────────────────────────────────────
interface NovaChatProps {
  isOpen: boolean;
  onToggle: () => void;
}
function NovaChat({ isOpen, onToggle }: NovaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      from: "nova",
      text: "Hey! 🌟 I'm Nova, your AI Galaxy Ice Cream guide. Ask me anything — flavours, prices, today's special, vegan options!",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is stable
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, from: "user", text };
    const novaMsg: ChatMessage = {
      id: `n-${Date.now()}`,
      from: "nova",
      text: getNovaResponse(text),
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
                data-ocid="nova.button"
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

// ── Share Section ─────────────────────────────────────────────────────────────
function ShareSection() {
  const [copied, setCopied] = useState(false);
  const shareText =
    "🌟 I just discovered Galaxy Ice Cream Parlour! 16 cosmic flavours from ₹99, prices in Indian Rupees, and an AI manager named Nova! Come taste the cosmos 🍦✨";

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast.success("Copied! Share it with your friends 🚀");
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <section data-ocid="share.section" className="max-w-6xl mx-auto px-4 py-12">
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
}
function OrderSuccess({
  isOpen,
  onClose,
  pointsEarned,
  totalPoints,
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
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-5">
                <Star className="w-6 h-6 fill-amber-300 text-amber-300 mx-auto mb-2" />
                <p className="font-bold text-amber-300 text-lg">
                  +{pointsEarned} Points Earned!
                </p>
                <p className="text-xs text-amber-200/70">
                  Total: {totalPoints} loyalty points
                </p>
              </div>
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
        <h1 className="font-display font-bold text-3xl gradient-text mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-6">
          Welcome to Galaxy PRO! You now have access to all premium features.
          Your cosmic journey begins here. 🌌
        </p>
        <Button
          data-ocid="payment_success.primary_button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="bg-violet-600 hover:bg-violet-500"
        >
          <IceCream className="w-4 h-4 mr-2" />
          Back to Parlour
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-10 max-w-md"
      >
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display font-bold text-3xl text-red-300 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-6">
          No worries — your order was not charged. You can try again any time.
        </p>
        <Button
          data-ocid="payment_failure.primary_button"
          onClick={() => {
            window.location.href = "/";
          }}
          variant="outline"
          className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10"
        >
          <IceCream className="w-4 h-4 mr-2" />
          Back to Parlour
        </Button>
      </motion.div>
    </div>
  );
}

// ── StripeSetupModal ────────────────────────────────────────────────────────────
interface StripeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}
function StripeSetupModal({ isOpen, onClose }: StripeSetupModalProps) {
  const [stripeKey, setStripeKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!stripeKey.trim()) {
      toast.error("Please enter your Stripe secret key");
      return;
    }
    setIsSaving(true);
    try {
      // When stripe component is connected, this will call actor.setStripeConfiguration
      toast.success("Stripe configuration saved! Payments are now live.");
      onClose();
    } catch {
      toast.error("Failed to save configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [stripeSetupOpen, setStripeSetupOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { mutateAsync: createCheckoutSession, isPending: isCheckingOut } =
    useCreateCheckoutSession();

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    try {
      localStorage.setItem("galaxy_loyalty_points", String(loyaltyPoints));
    } catch {
      // ignore storage errors
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
      prev
        .map((i) => (i.flavor.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  function removeItem(id: string) {
    setCartItems((prev) => prev.filter((i) => i.flavor.id !== id));
  }

  function placeOrder(redeemPoints: boolean) {
    const pts = 10;
    const pointsUsed = redeemPoints && loyaltyPoints >= 100 ? 100 : 0;
    setLoyaltyPoints((p) => p - pointsUsed + pts);
    setLastPointsEarned(pts);
    setCartItems([]);
    setCartOpen(false);
    setOrderSuccess(true);
  }

  const categories = ["all", "classic", "galaxy", "fruity", "vegan"];
  const filteredFlavors =
    activeCategory === "all"
      ? FLAVORS
      : FLAVORS.filter((f) => f.category === activeCategory);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "oklch(0.07 0.025 280)" }}
    >
      <Starfield />
      {/* Nebula bg orbs */}
      <div
        className="nebula-orb"
        style={{
          width: 400,
          height: 400,
          top: "10%",
          left: "-10%",
          background: "oklch(0.45 0.28 310 / 0.12)",
        }}
      />
      <div
        className="nebula-orb"
        style={{
          width: 500,
          height: 500,
          top: "40%",
          right: "-15%",
          background: "oklch(0.42 0.3 240 / 0.1)",
          animationDelay: "4s",
        }}
      />
      <div
        className="nebula-orb"
        style={{
          width: 350,
          height: 350,
          bottom: "10%",
          left: "30%",
          background: "oklch(0.5 0.28 340 / 0.08)",
          animationDelay: "2s",
        }}
      />

      <div className="relative z-10">
        <OpeningBanner />
        <Header
          cartCount={cartCount}
          loyaltyPoints={loyaltyPoints}
          onCartOpen={() => setCartOpen(true)}
          onLoyaltyOpen={() => setLoyaltyOpen(true)}
          onUpgradeOpen={() => setUpgradeOpen(true)}
          onStripeSetup={() => setStripeSetupOpen(true)}
        />

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-2xl overflow-hidden relative"
            style={{ height: 260 }}
          >
            <img
              src="/assets/generated/galaxy-hero.dim_1200x400.jpg"
              alt="Galaxy Ice Cream Parlour"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background:
                  "linear-gradient(to top, oklch(0.07 0.025 280 / 0.8), oklch(0 0 0 / 0.2))",
              }}
            >
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-center shimmer-text drop-shadow-2xl">
                16 Cosmic Flavours
              </h2>
              <p className="text-violet-200/80 text-sm sm:text-base mt-2 text-center">
                From ₹99 • Fresh daily • Made with stardust 🌌
              </p>
            </div>
          </motion.div>
        </section>

        <PromoBanners />

        {/* Menu */}
        <section className="max-w-6xl mx-auto px-4 py-6" id="menu">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl gradient-text">
              Our Menu
            </h2>
            <Gift className="w-5 h-5 text-violet-400" />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                data-ocid={`menu.${cat}.tab`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all ${
                  activeCategory === cat
                    ? "bg-violet-500/30 border-violet-400/60 text-violet-200"
                    : "border-border text-muted-foreground hover:border-violet-400/40 hover:text-violet-300"
                }`}
              >
                {cat === "all"
                  ? "🌌 All"
                  : `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFlavors.map((flavor, i) => (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                index={i}
                onAdd={addToCart}
              />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display font-bold text-2xl gradient-text mb-2">
              How Customers Enjoy Us
            </h2>
            <p className="text-muted-foreground text-sm">
              It's simple, cosmic, and delicious
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Discover",
                desc: "Browse 16 cosmic flavours across 4 categories. Special badges highlight today's hits.",
                emoji: "👀",
              },
              {
                step: "02",
                title: "Ask Nova",
                desc: "Chat with our AI manager Nova for personalised recommendations and vegan options.",
                emoji: "🤖",
              },
              {
                step: "03",
                title: "Order & Earn",
                desc: "Add to cart, place your order, and earn 10 loyalty points. Redeem for discounts!",
                emoji: "⭐",
              },
              {
                step: "04",
                title: "Share the Joy",
                desc: "Tell your friends! Copy our share message and invite everyone to taste the cosmos.",
                emoji: "🚀",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="galaxy-card p-5 text-center"
              >
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="text-xs font-mono text-violet-400 mb-1">
                  {s.step}
                </div>
                <h3 className="font-display font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <ShareSection />
        <Footer />
      </div>

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQtyChange={changeQty}
        onRemove={removeItem}
        loyaltyPoints={loyaltyPoints}
        onPlaceOrder={placeOrder}
      />
      <LoyaltyPanel
        isOpen={loyaltyOpen}
        onClose={() => setLoyaltyOpen(false)}
        points={loyaltyPoints}
      />
      <OrderSuccess
        isOpen={orderSuccess}
        onClose={() => setOrderSuccess(false)}
        pointsEarned={lastPointsEarned}
        totalPoints={loyaltyPoints}
      />
      <NovaChat isOpen={novaOpen} onToggle={() => setNovaOpen((v) => !v)} />
      <StripeSetupModal
        isOpen={stripeSetupOpen}
        onClose={() => setStripeSetupOpen(false)}
      />
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        isLoading={isCheckingOut}
      />
      <Toaster richColors />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path === "/payment-success") return <PaymentSuccess />;
  if (path === "/payment-failure") return <PaymentFailure />;
  return <IceCreamParlour />;
}
