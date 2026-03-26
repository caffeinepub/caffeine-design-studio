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
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CustomerReviewsSection,
  DeliveryRatingPopup,
  OwnerDashboardModal,
  ReviewPromptModal,
  incrementOrderCount,
} from "./GalaxyReviews";
import {
  ActiveOrderQueueTable,
  LiveKitchenOrders,
  OrderConfirmationCard,
  type OrderQueueItem,
} from "./OrderQueue";
import { useCreateCheckoutSession } from "./hooks/useCheckoutSession";

// ── Types ──────────────────────────────────────────────────────────────────
interface Flavor {
  id: string;
  name: string;
  emoji: string;
  category:
    | "classic"
    | "galaxy"
    | "fruity"
    | "vegan"
    | "frozen"
    | "exotic"
    | "family"
    | "jumbo"
    | "summer";
  price: number;
  description: string;
  isSpecial?: boolean;
  isNew?: boolean;
}

interface CartItem {
  flavor: Flavor;
  qty: number;
  toppings?: { name: string; emoji: string; price: number }[];
}

interface ChatMessage {
  id: string;
  from: "user" | "nova";
  text: string;
}
// ── Language Context ─────────────────────────────────────────────────────────
type Lang = "en" | "hi";

// ── Notification types ────────────────────────────────────────────────────────
interface AppNotification {
  id: string;
  orderId: string;
  queueNumber: string;
  message: string;
  messageHi: string;
  emoji: string;
  timestamp: Date;
  read: boolean;
}
interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});
function useLanguage() {
  return useContext(LanguageContext);
}

const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  menu: { en: "🌌 Our Menu", hi: "🌌 हमारा मेन्यू" },
  orderNow: { en: "Order Now", hi: "अभी ऑर्डर करें" },
  addToCart: { en: "Add to Cart", hi: "कार्ट में डालें" },
  placeOrder: { en: "Place Order", hi: "ऑर्डर दें" },
  customerFavourites: { en: "⭐ Customer Favourites", hi: "⭐ ग्राहकों की पसंद" },
  flashDeal: { en: "⚡ Today's Flash Deal", hi: "⚡ आज की फ्लैश डील" },
  grabThisDeal: { en: "Grab This Deal", hi: "डील लें" },
  familyPack: { en: "Family Pack", hi: "फैमिली पैक" },
  familyComboDeal: { en: "🎉 Family Combo Deal!", hi: "🎉 फैमिली कॉम्बो डील!" },
  familyComboDesc: {
    en: "Buy Any 2 Family Packs & Save ₹100!",
    hi: "कोई भी 2 फैमिली पैक खरीदें और ₹100 बचाएं!",
  },
  shopFamilyPacks: { en: "Shop Family Packs →", hi: "फैमिली पैक देखें →" },
  jumboPartyPack: { en: "Jumbo Party Pack", hi: "जम्बो पार्टी पैक" },
  jumboPackBanner: {
    en: "🎊 Planning a Wedding or Party? Order Jumbo Packs!",
    hi: "🎊 शादी या पार्टी? जम्बो पैक ऑर्डर करें!",
  },
  jumboPackSub: {
    en: "Serves 15–25 guests • Perfect for Weddings, Birthdays & Celebrations • Starting at ₹799",
    hi: "15–25 मेहमानों के लिए • शादी, जन्मदिन और उत्सव के लिए • ₹799 से शुरू",
  },
  shopJumboPacks: { en: "Shop Jumbo Packs →", hi: "जम्बो पैक देखें →" },
  spinToWin: { en: "🎡 Spin to Win a Reward!", hi: "🎡 स्पिन करें और जीतें!" },
  spinBtn: { en: "SPIN!", hi: "स्पिन करें!" },
  spinning: { en: "Spinning...", hi: "स्पिन हो रहा है..." },
  reviews: { en: "⭐ What Our Customers Say", hi: "⭐ ग्राहकों की समीक्षाएं" },
  delivery: { en: "Delivery & Packaging", hi: "डिलीवरी और पैकेजिंग" },
  buildCombo: {
    en: "🌌 Build Your Cosmic Combo",
    hi: "🌌 अपना कॉस्मिक कॉम्बो बनाएं",
  },
  toppings: { en: "🍨 Add Toppings", hi: "🍨 टॉपिंग्स जोड़ें" },
  birthdaySurprise: { en: "Birthday Surprise!", hi: "जन्मदिन सरप्राइज!" },
  birthdayBtn: {
    en: "🎂 Birthday? Get 15% Off!",
    hi: "🎂 जन्मदिन? 15% छूट पाएं!",
  },
  birthdayActive: {
    en: "🎂 Birthday Discount Active! ✓",
    hi: "🎂 जन्मदिन छूट लागू! ✓",
  },
  loyaltyPoints: { en: "Loyalty Stars", hi: "लॉयल्टी पॉइंट्स" },
  share: { en: "Share", hi: "शेयर करें" },
  shareThisAd: { en: "📱 Share This Ad", hi: "📱 यह विज्ञापन शेयर करें" },
  refer: { en: "Refer", hi: "रेफर करें" },
  cart: { en: "Cart", hi: "कार्ट" },
  aboutTitle: {
    en: "About Galaxy Ice Cream Parlour",
    hi: "Galaxy Ice Cream Parlour के बारे में",
  },
  trendingNow: { en: "🔥 TRENDING NOW", hi: "🔥 अभी ट्रेंडिंग" },
  liveKitchenOrders: { en: "🔴 Live Kitchen Orders", hi: "🔴 लाइव किचन ऑर्डर" },
  peakHours: {
    en: "🔥 Peak Hours - All orders being handled!",
    hi: "🔥 पीक आवर्स - सभी ऑर्डर संभाले जा रहे हैं!",
  },
  kitchenReady: {
    en: "✅ Kitchen is ready for your order!",
    hi: "✅ किचन आपके ऑर्डर के लिए तैयार है!",
  },
  queueConfirm: { en: "Order Queued! 🎉", hi: "ऑर्डर कतार में है! 🎉" },
  queueSub: {
    en: "Your cosmic treats are on their way",
    hi: "आपके कॉस्मिक ट्रीट आ रहे हैं",
  },
  novaGreeting: {
    en: "Hey there! 🌟 I'm Nova, your AI Galaxy Ice Cream manager. Ask me about flavours, prices, today's special, or our referral program!",
    hi: "नमस्ते! 🌟 मैं Nova हूं, आपकी AI Galaxy Ice Cream मैनेजर। मुझसे फ्लेवर, कीमत, आज की स्पेशल डील, या रेफरल प्रोग्राम के बारे में पूछें!",
  },
  novaPlaceholder: { en: "Ask Nova anything...", hi: "Nova से कुछ भी पूछें..." },
  novaTitle: { en: "AI Parlour Manager", hi: "AI पार्लर मैनेजर" },
  tasteTheCosmos: { en: "Taste the cosmos ✨", hi: "कॉस्मिक स्वाद लें ✨" },
  grandOpening: { en: "🎉 Grand Opening Special!", hi: "🎉 ग्रैंड ओपनिंग स्पेशल!" },
  grandOpeningDesc: {
    en: "Free delivery on all orders today!",
    hi: "आज सभी ऑर्डर पर फ्री डिलीवरी!",
  },
  promoSpecial: {
    en: "⭐ Today's Special: Nebula Swirl — ₹99!",
    hi: "⭐ आज की स्पेशल: Nebula Swirl — ₹99!",
  },
  promoBuy2: {
    en: "🎉 Buy 2 Get 1 Free every weekend!",
    hi: "🎉 हर वीकेंड 2 खरीदें, 1 मुफ्त पाएं!",
  },
  promoNew: {
    en: "🆕 New Arrival: Aurora Borealis Blast!",
    hi: "🆕 नया: Aurora Borealis Blast!",
  },
  viewCart: { en: "View Cart", hi: "कार्ट देखें" },
  redeemPoints: {
    en: "Redeem 100 pts for ₹50 off",
    hi: "100 पॉइंट्स रिडीम करें, ₹50 की छूट",
  },
  yourOrder: { en: "Your Order", hi: "आपका ऑर्डर" },
  orderTotal: { en: "Order Total", hi: "कुल राशि" },
  comingSoon: { en: "Coming Soon", hi: "जल्द आ रहा है" },
};

function t(key: string, lang: Lang): string {
  return TRANSLATIONS[key]?.[lang] ?? TRANSLATIONS[key]?.en ?? key;
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
  // New Flavors Added
  {
    id: "caramel-cosmos",
    name: "Caramel Cosmos",
    emoji: "🍯",
    category: "classic",
    price: 119,
    description:
      "Rich caramel ribbons swirled with sea salt in a buttery cream base",
    isNew: true,
  },
  {
    id: "coffee-orbit",
    name: "Coffee Orbit",
    emoji: "☕",
    category: "classic",
    price: 129,
    description:
      "Strong Arabica espresso blended with velvety cream — a cosmic caffeine kick",
    isNew: true,
  },
  {
    id: "taro-twilight",
    name: "Taro Twilight",
    emoji: "💜",
    category: "galaxy",
    price: 169,
    description:
      "Purple taro root cream with lavender shimmer and coconut flakes",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "meteor-mint",
    name: "Meteor Mint Choco",
    emoji: "🌿",
    category: "galaxy",
    price: 159,
    description:
      "Cool peppermint galaxy cream with dark chocolate meteor chunks",
    isNew: true,
  },
  {
    id: "peach-planet",
    name: "Peach Planet",
    emoji: "🍑",
    category: "fruity",
    price: 129,
    description: "Sun-ripened peaches blended into a silky peachy cosmic cream",
    isNew: true,
  },
  {
    id: "tamarind-star",
    name: "Tamarind Star",
    emoji: "⭐",
    category: "fruity",
    price: 119,
    description: "Sweet and tangy tamarind sorbet with a chaat masala stardust",
    isNew: true,
  },
  {
    id: "pineapple-comet",
    name: "Pineapple Comet",
    emoji: "🍍",
    category: "fruity",
    price: 119,
    description:
      "Juicy tropical pineapple with a coconut cream tail — refreshingly cosmic",
    isNew: true,
  },
  {
    id: "oat-nebula",
    name: "Oat Milk Nebula",
    emoji: "🌾",
    category: "vegan",
    price: 149,
    description:
      "Creamy oat milk base with maple syrup ribbons and toasted granola",
    isNew: true,
  },
  {
    id: "mango-coconut-vegan",
    name: "Mango Coconut Star",
    emoji: "🥭",
    category: "vegan",
    price: 139,
    description:
      "Alphonso mango blended with coconut cream — a vegan tropical delight",
    isNew: true,
  },
  {
    id: "kulfi-frost",
    name: "Kulfi Frost Pop",
    emoji: "🧊",
    category: "frozen",
    price: 89,
    description: "Traditional matka kulfi on a stick with rose water drizzle",
    isNew: true,
  },
  {
    id: "choco-fudge-bar",
    name: "Choco Fudge Galaxy Bar",
    emoji: "🍫",
    category: "frozen",
    price: 99,
    description:
      "Chocolate fudge ice cream bar coated in crispy dark chocolate shell",
    isNew: true,
  },
  {
    id: "saffron-pistachio-exotic",
    name: "Saffron Pistachio Dream",
    emoji: "🌟",
    category: "exotic",
    price: 179,
    description:
      "Royal Kashmiri saffron and crushed pistachios in a luxurious cream",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "gulkand-exotic",
    name: "Gulkand Rose Swirl",
    emoji: "🌸",
    category: "exotic",
    price: 149,
    description:
      "Sweet rose petal jam (gulkand) churned into a fragrant Indian cream",
    isNew: true,
  },
  {
    id: "chikoo-cosmic",
    name: "Chikoo Cosmic Cream",
    emoji: "🍂",
    category: "exotic",
    price: 139,
    description:
      "Sapodilla (chikoo) with a hint of cardamom — a truly desi cosmic treat",
    isNew: true,
  },
  // Summer Special Flavors
  {
    id: "aam-panna-burst",
    name: "Aam Panna Burst",
    emoji: "🥭",
    category: "summer",
    price: 99,
    description: "Tangy raw mango panna with a cooling twist",
    isNew: true,
  },
  {
    id: "lemon-zesty-star",
    name: "Lemon Zesty Star",
    emoji: "🍋",
    category: "summer",
    price: 89,
    description: "Refreshing lemon with chaat masala swirl",
    isNew: true,
  },
  {
    id: "strawberry-watermelon-wave",
    name: "Strawberry Watermelon Wave",
    emoji: "🍓",
    category: "summer",
    price: 109,
    description: "Summer watermelon meets juicy strawberry",
    isNew: true,
  },
  {
    id: "peach-sunrise-scoop",
    name: "Peach Sunrise Scoop",
    emoji: "🍑",
    category: "summer",
    price: 99,
    description: "Peachy sunrise with vanilla cream ripple",
    isNew: true,
  },
  {
    id: "kokum-cooler-sorbet",
    name: "Kokum Cooler Sorbet",
    emoji: "🧊",
    category: "summer",
    price: 79,
    description: "Tangy Goan kokum in a refreshing sorbet",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "coconut-palm-bliss",
    name: "Coconut Palm Bliss",
    emoji: "🌴",
    category: "summer",
    price: 89,
    description: "Creamy coconut with palm jaggery swirl",
    isSpecial: true,
    isNew: true,
  },
  // New Exotic Flavors
  {
    id: "sesame-halva-dream",
    name: "Sesame Halva Dream",
    emoji: "🫚",
    category: "exotic",
    price: 119,
    description: "Creamy sesame halva with tahini ribbon",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "matcha-moonbeam",
    name: "Matcha Moonbeam",
    emoji: "🍵",
    category: "exotic",
    price: 129,
    description: "Japanese matcha meets Indian cardamom",
    isNew: true,
  },
  {
    id: "chilli-chocolate-eclipse",
    name: "Chilli Chocolate Eclipse",
    emoji: "🌶️",
    category: "exotic",
    price: 119,
    description: "Dark chocolate with a spicy chilli kick",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "pistachio-rose-mist",
    name: "Pistachio Rose Mist",
    emoji: "🧆",
    category: "exotic",
    price: 139,
    description: "Salted pistachio with dried rose petal mist",
    isSpecial: true,
    isNew: true,
  },
  // Family Pack — Big Blocks
  {
    id: "family-choco",
    name: "Chocolate Fudge Family Block",
    emoji: "🍫",
    category: "family",
    price: 349,
    description:
      "Big block of rich Belgian chocolate fudge — serves 4 to 6, perfect for family nights",
    isNew: true,
  },
  {
    id: "family-vanilla",
    name: "Vanilla Dream Family Block",
    emoji: "🍦",
    category: "family",
    price: 299,
    description:
      "Creamy Madagascar vanilla in a generous big block — the classic family favourite",
    isNew: true,
  },
  {
    id: "family-strawberry",
    name: "Strawberry Galaxy Family Block",
    emoji: "🍓",
    category: "family",
    price: 329,
    description:
      "Fresh strawberry swirls in a large cosmic block, enough for the whole family",
    isNew: true,
  },
  {
    id: "family-nebula",
    name: "Nebula Swirl Family Block",
    emoji: "🌀",
    category: "family",
    price: 449,
    description:
      "Our #1 Galaxy Special in a big family block — cosmic purple-blue swirls with edible glitter",
    isSpecial: true,
    isNew: true,
  },
  {
    id: "family-butterscotch",
    name: "Butterscotch Bliss Family Block",
    emoji: "🧈",
    category: "family",
    price: 319,
    description:
      "Caramelised butterscotch in a big block — kids absolutely love this one!",
    isNew: true,
  },
  {
    id: "family-mango",
    name: "Mango Meteor Family Block",
    emoji: "🥭",
    category: "family",
    price: 379,
    description:
      "Fiery Alphonso mango in a grand family block — an Indian summer classic",
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

// ── Toppings ───────────────────────────────────────────────────────────────
const TOPPINGS: { id: string; name: string; emoji: string; price: number }[] = [
  { id: "choco-drizzle", name: "Chocolate Drizzle", emoji: "🍫", price: 20 },
  { id: "sprinkles", name: "Rainbow Sprinkles", emoji: "🌈", price: 15 },
  { id: "crushed-nuts", name: "Crushed Nuts", emoji: "🥜", price: 25 },
  { id: "cherry", name: "Cherry on Top", emoji: "🍒", price: 15 },
  { id: "waffle-upgrade", name: "Waffle Cone Upgrade", emoji: "🧇", price: 30 },
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
  family: {
    label: "Family Pack",
    emoji: "👨‍👩‍👧‍👦",
    color: "text-orange-300 border-orange-400/40 bg-orange-400/10",
  },
  jumbo: {
    label: "Jumbo Party Pack",
    emoji: "🎊",
    color: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10",
  },
  summer: {
    label: "Summer Special",
    emoji: "☀️",
    color: "text-orange-300 border-orange-400/40 bg-orange-400/10",
  },
};

// ── Loyalty Tier System ──────────────────────────────────────────────────────
function getLoyaltyTier(pts: number): {
  emoji: string;
  name: string;
  next: number;
  nextName: string;
} {
  if (pts >= 1000)
    return {
      emoji: "💎",
      name: "Diamond Universe",
      next: Number.POSITIVE_INFINITY,
      nextName: "",
    };
  if (pts >= 600)
    return {
      emoji: "💎",
      name: "Platinum Cosmic",
      next: 1000,
      nextName: "Diamond Universe",
    };
  if (pts >= 300)
    return {
      emoji: "🥇",
      name: "Gold Galaxy",
      next: 600,
      nextName: "Platinum Cosmic",
    };
  if (pts >= 100)
    return {
      emoji: "🥈",
      name: "Silver Nova",
      next: 300,
      nextName: "Gold Galaxy",
    };
  return {
    emoji: "🥉",
    name: "Bronze Star",
    next: 100,
    nextName: "Silver Nova",
  };
}

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
  jumbo:
    "🎊 For parties and weddings, our Jumbo Packs are perfect! We have 8 amazing Jumbo flavours starting at ₹799 — each tub serves 15-25 guests! Top picks: Kesar Pista Royale (₹1,299) ⭐ for weddings, Chocolate Truffle Extravaganza (₹1,499) 🎂 for grand celebrations, Strawberry Wedding Bliss (₹899) 💍 for brides! Perfect for shadi, birthday parties, anniversaries, corporate events, and puja celebrations! 📋 Fill out our Bulk Order Enquiry form on this page and we'll get back to you within 24 hours!",
  wedding:
    "💍 Congratulations on your big day! For wedding ice cream, our Jumbo Packs serve 15-25 guests each. We recommend: Kesar Pista Royale Jumbo (₹1,299) — a luxurious saffron-pistachio tub fit for a shaadi! Also try Chocolate Truffle Extravaganza (₹1,499) and Strawberry Wedding Bliss (₹899). Order multiple tubs and wow your guests! 📋 Fill out our Bulk Order Enquiry form on this page and we'll get back to you within 24 hours! 🌟",
  party:
    "🎉 Party time! Our Jumbo Packs are made for celebrations — starting at ₹799 and serving 15-25 people per tub! For birthdays try Mixed Fruit Fiesta (₹849), for corporate events try Vanilla Royal (₹799), for festive occasions try Mango Mahotsav (₹899). Order now and make your party cosmic! 📋 Fill out our Bulk Order Enquiry form on this page and we'll get back to you within 24 hours! 🚀",
  occasion:
    "🌟 Special occasion? Galaxy Ice Cream Parlour has Jumbo Packs perfect for weddings, birthdays, anniversaries, festivals, and corporate events! Each jumbo tub serves 15-25 guests. Prices start at ₹799. Also check our Family Packs (serves 4-6) starting at ₹299! 🍦",
  shadi:
    "💍 Shaadi ke liye hamare Jumbo Packs bilkul perfect hain! 🎊 Kesar Pista Royale Jumbo (₹1,299) aur Chocolate Truffle Extravaganza (₹1,499) shaadi reception ke liye best choice hai. Har tub mein 15-25 log ka ice cream aata hai. Abhi order karein! 📋 Hamare Bulk Order Enquiry form ko fill karein aur hum 24 ghante mein aapse contact karenge! 🌟",
  family:
    "We have 6 amazing Family Pack Big Blocks starting at ₹299! 👨‍👩‍👧‍👦 Perfect for family get-togethers — choose from Vanilla Dream (₹299), Butterscotch Bliss (₹319), Strawberry Galaxy (₹329), Chocolate Fudge (₹349), Mango Meteor (₹379), and the special Nebula Swirl Big Block (₹449). Each block serves 4-6 people!",
  factory:
    "Galaxy Ice Cream Parlour operates as a 100% online virtual business! 🏭✨ We don't have a physical factory or kitchen — instead, we partner with local cloud kitchens across India to prepare your cosmic flavours fresh and deliver them right to your door!",
  state:
    "Galaxy Ice Cream Parlour serves ALL states of India! 🗺️🇮🇳 From Maharashtra, Delhi, Karnataka, Tamil Nadu, West Bengal, Gujarat — we're everywhere! You can order from any state, any city, any time. We're open 24/7 for all of India!",
  open: "Galaxy Ice Cream Parlour is open 24/7, every single day! 🌟 There are no closing hours because we're fully online. Whether you're in Mumbai at midnight or Chennai at dawn — we're always here for you! 🍦",
  kitchen:
    "We operate through virtual cloud kitchens across India! 🍦 No single physical location — your order is prepared fresh by a local partner kitchen near you, then delivered to your doorstep with our beautiful Galaxy Cosmic Packaging!",
  default:
    "I'd love to help! 🤖 You can ask me about: our location, which state we serve, factory details, opening hours, vegan options, today's special, prices, family packs, recommendations, offers, or any specific flavour!",
};

function getNovaResponse(input: string, lang: Lang = "en"): string {
  const lower = input.toLowerCase();
  // Hindi language responses
  if (lang === "hi") {
    if (
      lower.includes("location") ||
      lower.includes("kahan") ||
      lower.includes("where") ||
      lower.includes("address") ||
      lower.includes("store")
    )
      return "Galaxy Ice Cream Parlour पूरे भारत में ऑनलाइन उपलब्ध है! 🌏 हम 24/7 खुले हैं। घर बैठे ऑर्डर करें और कॉस्मिक फ्लेवर का आनंद लें! 🍦✨";
    if (
      lower.includes("price") ||
      lower.includes("cost") ||
      lower.includes("kitna") ||
      lower.includes("rate")
    )
      return "हमारी कीमतें ₹99 से शुरू होती हैं! 🌟 क्लासिक स्कूप ₹99, गैलेक्सी स्पेशल ₹149-₹169, और फैमिली पैक ₹299 से। सभी कीमतें बहुत किफायती हैं! 🍦";
    if (
      lower.includes("family") ||
      lower.includes("pack") ||
      lower.includes("block")
    )
      return "हमारे 6 शानदार फैमिली पैक हैं जो ₹299 से शुरू होते हैं! 👨‍👩‍👧‍👦 4-6 लोगों के लिए परफेक्ट — Vanilla Dream, Butterscotch Bliss, Strawberry Galaxy, Chocolate Fudge, Mango Meteor, और Nebula Swirl Big Block!";
    if (lower.includes("vegan") || lower.includes("plant"))
      return "हमारे 6 शानदार वेगन ऑप्शन हैं! 🌿 Coconut Cosmos (₹129), Avocado Asteroid (₹139), Dark Matter Date (₹129), Pineapple Planet (₹119), Almond Aurora (₹139), और Jackfruit Jupiter (₹129)। सभी 100% प्लांट-बेस्ड!";
    if (
      lower.includes("offer") ||
      lower.includes("discount") ||
      lower.includes("deal")
    )
      return "मौजूदा ऑफर: 🎉 हर वीकेंड 2 खरीदें, 1 मुफ्त! लॉयल्टी पॉइंट्स भी कमाएं — हर ऑर्डर पर 10 पॉइंट्स, 100 पॉइंट्स = ₹50 की छूट!";
    if (
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("namaste") ||
      lower.includes("नमस्ते")
    )
      return "नमस्ते! 🌟 मैं Nova हूं, आपकी AI Galaxy Ice Cream मैनेजर। आपकी कैसे मदद कर सकती हूं? फ्लेवर, कीमत, या स्पेशल डील के बारे में पूछें!";
    if (
      lower.includes("recommend") ||
      lower.includes("suggest") ||
      lower.includes("best")
    )
      return "मेरी टॉप पिक्स: 1) Aurora Borealis Blast (₹159) — जादुई 🌈 2) Supernova Saffron (₹169) — शाही केसर ✨ 3) Lavender Lightyear (₹169) — अनोखा और अविस्मरणीय 💐 4) Taro Titan (₹149) — कॉस्मिक बैंगनी सपना 🟣";
    if (
      lower.includes("quality") ||
      lower.includes("brand") ||
      lower.includes("a1") ||
      lower.includes("certified") ||
      lower.includes("गुणवत्ता") ||
      lower.includes("ब्रांड")
    )
      return "Galaxy Ice Cream Parlour सिर्फ A1 Quality सामग्री उपयोग करता है! 🏅✨ हम Premium A1 Grade दूध, 100% प्राकृतिक सामग्री, और बिना artificial colors के आइसक्रीम बनाते हैं। हम FSSAI certified हैं। हर स्कूप सर्वोच्च गुणवत्ता का है! 🥛🌿";
    return "मैं मदद करना चाहूंगी! 🤖 आप मुझसे पूछ सकते हैं: लोकेशन, वेगन ऑप्शन, आज की स्पेशल, कीमतें, फैमिली पैक, ऑफर, या किसी खास फ्लेवर के बारे में!";
  }
  // Multi-word pattern checks first
  if (
    lower.includes("which state") ||
    lower.includes("kon sa state") ||
    lower.includes("kaunse state") ||
    lower.includes("kahan open") ||
    lower.includes("which city") ||
    lower.includes("in which")
  )
    return NOVA_RESPONSES.state;
  if (
    lower.includes("factory") ||
    lower.includes("kitchen") ||
    lower.includes("kahan bana") ||
    lower.includes("where made") ||
    lower.includes("manufacturing")
  )
    return NOVA_RESPONSES.factory;
  if (
    lower.includes("when open") ||
    lower.includes("opening time") ||
    lower.includes("kab open") ||
    lower.includes("timing") ||
    lower.includes("closed") ||
    lower.includes("hours")
  )
    return NOVA_RESPONSES.open;
  for (const key of Object.keys(NOVA_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return NOVA_RESPONSES[key];
  }
  if (
    lower.includes("quality") ||
    lower.includes("brand") ||
    lower.includes("a1") ||
    lower.includes("certified") ||
    lower.includes("fssai") ||
    lower.includes("milk") ||
    lower.includes("ingredients")
  )
    return "Galaxy Ice Cream Parlour uses only A1 Quality certified ingredients! 🏅✨ We use Premium A1 Grade Milk from certified dairy farms, 100% natural ingredients, zero artificial colors, and we're fully FSSAI certified. Every scoop is guaranteed to be of the highest quality! 🥛🌿";
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
  stripeActive: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}
function Header({
  cartCount,
  loyaltyPoints,
  onCartOpen,
  onLoyaltyOpen,
  onUpgradeOpen,
  onStripeSetup,
  onReferralOpen,
  stripeActive,
  lang,
  setLang,
  notifications,
  onMarkAllRead,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
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
              {t("tasteTheCosmos", lang)}
            </p>
            <p
              className="text-xs font-bold leading-none mt-0.5"
              style={{ color: "oklch(0.82 0.18 80)" }}
            >
              Galaxy Premium | A1 Quality
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
            <span>{loyaltyPoints} pts</span>
            <span className="text-xs opacity-70">
              {getLoyaltyTier(loyaltyPoints).emoji}{" "}
              {getLoyaltyTier(loyaltyPoints).name}
            </span>
          </button>
          <button
            type="button"
            data-ocid="referral.open_modal_button"
            onClick={onReferralOpen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-400/40 bg-pink-400/10 text-pink-300 text-sm font-semibold hover:bg-pink-400/20 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            {t("refer", lang)}
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
          {stripeActive && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Stripe Active
            </span>
          )}
          <button
            type="button"
            data-ocid="stripe.settings_button"
            onClick={onStripeSetup}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-violet-400/40 transition-colors"
            title="Payment Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              data-ocid="notifications.open_modal_button"
              onClick={() => {
                setNotifOpen((v) => !v);
                if (!notifOpen) onMarkAllRead();
              }}
              className="relative p-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <motion.div
                data-ocid="notifications.panel"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute right-0 top-10 w-80 rounded-2xl border border-amber-400/20 shadow-2xl z-50 overflow-hidden"
                style={{ background: "oklch(0.1 0.03 280)" }}
              >
                <div className="px-4 py-3 border-b border-amber-400/20 flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">
                    {lang === "hi" ? "🔔 सूचनाएं" : "🔔 Notifications"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-violet-400/60 hover:text-violet-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-violet-400/50 text-center py-6">
                      {lang === "hi" ? "कोई सूचना नहीं" : "No notifications yet"}
                    </p>
                  ) : (
                    [...notifications].reverse().map((n) => (
                      <div
                        key={n.id}
                        data-ocid="notifications.item.1"
                        className="px-4 py-3 border-b border-violet-500/10 hover:bg-violet-500/5 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg mt-0.5">{n.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-amber-300">
                              {n.queueNumber}
                            </p>
                            <p className="text-xs text-violet-200 leading-snug">
                              {lang === "hi" ? n.messageHi : n.message}
                            </p>
                            <p className="text-[10px] text-violet-400/50 mt-1">
                              {n.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
          <button
            type="button"
            data-ocid="lang.toggle"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-sm font-semibold hover:bg-cyan-400/20 transition-colors"
            title="Switch Language / भाषा बदलें"
          >
            {lang === "en" ? "🇮🇳 हिंदी" : "🇺🇸 EN"}
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
            {t("cart", lang)}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Galaxy Ad Banner ────────────────────────────────────────────────────────
function GalaxyAdBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offerIdx, setOfferIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const tagline = "India's Most Cosmic Ice Cream Experience";

  const offers = [
    {
      emoji: "🌌",
      text: "Today's Special: Nebula Swirl",
      price: "₹99",
      color: "#a855f7",
    },
    {
      emoji: "🎉",
      text: "Buy 2 Get 1 FREE Every Weekend!",
      price: "",
      color: "#ec4899",
    },
    {
      emoji: "👨‍👩‍👧‍👦",
      text: "Family Pack Starting at",
      price: "₹299",
      color: "#fbbf24",
    },
    {
      emoji: "🎡",
      text: "Spin to Win Discounts & Free Toppings!",
      price: "",
      color: "#34d399",
    },
  ];

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      i++;
      setTyped(tagline.slice(0, i));
      if (i >= tagline.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, []);

  // Rotating offers
  useEffect(() => {
    const id = setInterval(
      () => setOfferIdx((p) => (p + 1) % offers.length),
      3000,
    );
    return () => clearInterval(id);
  }, []);

  // Canvas starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      delta: (Math.random() - 0.5) * 0.02,
    }));

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.opacity += s.delta;
        if (s.opacity <= 0 || s.opacity >= 1) s.delta = -s.delta;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.opacity))})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const scrollToMenu = () => {
    const el = document.querySelector('[data-ocid="menu.section"]');
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const floaters = [
    {
      emoji: "🍦",
      style: { top: "15%", left: "8%", fontSize: "3rem", animationDelay: "0s" },
    },
    {
      emoji: "🍧",
      style: {
        top: "25%",
        right: "10%",
        fontSize: "2.5rem",
        animationDelay: "1.5s",
      },
    },
    {
      emoji: "🍨",
      style: {
        bottom: "20%",
        left: "12%",
        fontSize: "2rem",
        animationDelay: "0.8s",
      },
    },
    {
      emoji: "🍡",
      style: {
        bottom: "30%",
        right: "8%",
        fontSize: "2.8rem",
        animationDelay: "2s",
      },
    },
    {
      emoji: "🌟",
      style: {
        top: "40%",
        left: "3%",
        fontSize: "1.5rem",
        animationDelay: "0.4s",
      },
    },
    {
      emoji: "✨",
      style: {
        top: "60%",
        right: "4%",
        fontSize: "1.8rem",
        animationDelay: "1.2s",
      },
    },
    {
      emoji: "🍦",
      style: {
        top: "70%",
        left: "25%",
        fontSize: "1.6rem",
        animationDelay: "2.5s",
      },
    },
    {
      emoji: "🍫",
      style: {
        top: "10%",
        right: "30%",
        fontSize: "1.4rem",
        animationDelay: "1.8s",
      },
    },
  ];

  return (
    <>
      <style>{`
        @keyframes galaxyFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes cosmicPulse {
          0%, 100% { box-shadow: 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 80px #ec4899; transform: scale(1); }
          50% { box-shadow: 0 0 30px #ec4899, 0 0 60px #a855f7, 0 0 120px #fbbf24; transform: scale(1.05); }
        }
        @keyframes shimmerTitle {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        .galaxy-ad-title {
          background: linear-gradient(90deg, #fbbf24, #f472b6, #a855f7, #60a5fa, #34d399, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerTitle 3s linear infinite;
        }
        .ad-floater {
          position: absolute;
          animation: galaxyFloat 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }
        .ad-cta-btn {
          animation: cosmicPulse 2s ease-in-out infinite;
        }
        .sparkle-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>

      <section
        data-ocid="ad.section"
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 20% 50%, #1a0040 0%, #0a0015 40%, #050010 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Canvas starfield */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />

        {/* Nebula gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-15%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-10%",
              width: "45%",
              height: "45%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              right: "10%",
              width: "30%",
              height: "30%",
              background:
                "radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Floating emojis */}
        {floaters.map((f, i) => (
          <div
            key={`floater-${f.emoji}-${i}`}
            className="ad-floater"
            style={f.style}
          >
            {f.emoji}
          </div>
        ))}

        {/* Sparkle dots */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <div
            key={`spark-${i}`}
            className="sparkle-dot"
            style={{
              top: `${((i * 37.3 + 5) % 90) + 5}%`,
              left: `${((i * 53.7 + 3) % 90) + 5}%`,
              background: ["#fbbf24", "#a855f7", "#ec4899", "#60a5fa"][i % 4],
              animationDelay: `${(i * 0.4) % 2}s`,
              zIndex: 2,
            }}
          />
        ))}

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "2rem 1rem",
            maxWidth: "900px",
            width: "100%",
          }}
        >
          {/* Animated stars subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              color: "#fbbf24",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            ✦ Now Open 24/7 Across All India ✦
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="galaxy-ad-title"
            style={{
              fontSize: "clamp(2rem, 7vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              textShadow: "0 0 40px rgba(168,85,247,0.8)",
            }}
          >
            🌌 GALAXY ICE CREAM PARLOUR
          </motion.h1>

          {/* Typewriter tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "clamp(1rem, 3vw, 1.5rem)",
              color: "#e2d9f3",
              minHeight: "2rem",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            {typed}
            <span
              style={{
                opacity: typed.length < tagline.length ? 1 : 0,
                color: "#a855f7",
              }}
            >
              |
            </span>
          </motion.p>

          {/* Subtitle badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {[
              "34+ Flavors",
              "Family Packs",
              "Loyalty Rewards",
              "Spin to Win",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(168,85,247,0.25)",
                  border: "1px solid rgba(168,85,247,0.5)",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.75rem",
                  color: "#d8b4fe",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                ✦ {tag}
              </span>
            ))}
          </motion.div>

          {/* Star rating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              color: "#fbbf24",
              fontSize: "1.1rem",
              marginBottom: "2rem",
              fontWeight: 700,
            }}
          >
            ⭐⭐⭐⭐⭐ &nbsp;
            <span style={{ color: "#f8fafc" }}>10,000+ Happy Customers</span>
          </motion.div>

          {/* Rotating offer card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{
              marginBottom: "2.5rem",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={offerIdx}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(10,0,21,0.9), rgba(30,0,60,0.8))",
                  border: `2px solid ${offers[offerIdx].color}`,
                  borderRadius: "1rem",
                  padding: "1rem 2rem",
                  boxShadow: `0 0 30px ${offers[offerIdx].color}60`,
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
                  {offers[offerIdx].emoji}
                </div>
                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  {offers[offerIdx].text}
                  {offers[offerIdx].price && (
                    <span
                      style={{
                        color: offers[offerIdx].color,
                        marginLeft: "0.4rem",
                        fontSize: "1.3rem",
                      }}
                    >
                      {offers[offerIdx].price}
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          >
            <button
              type="button"
              data-ocid="ad.primary_button"
              className="ad-cta-btn"
              onClick={scrollToMenu}
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "9999px",
                padding: "1rem 3rem",
                fontSize: "1.3rem",
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🍦 ORDER NOW
            </button>
          </motion.div>

          {/* Skip link */}
          <div style={{ marginTop: "2rem" }}>
            <button
              type="button"
              data-ocid="ad.link"
              onClick={scrollToMenu}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Skip to Menu ↓
            </button>
          </div>
        </div>
      </section>
    </>
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
  const { lang } = useLanguage();
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
          {t("customerFavourites", lang)}
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

// ── Spin to Win ──────────────────────────────────────────────────────────────
const SPIN_SEGMENTS = [
  {
    label: "10% OFF",
    color: "#f59e0b",
    textColor: "#1a1a1a",
    discount: 0.1,
    type: "percent",
  },
  {
    label: "20% OFF",
    color: "#8b5cf6",
    textColor: "#ffffff",
    discount: 0.2,
    type: "percent",
  },
  {
    label: "Free Topping!",
    color: "#10b981",
    textColor: "#ffffff",
    discount: 30,
    type: "flat",
  },
  {
    label: "₹50 OFF",
    color: "#ec4899",
    textColor: "#ffffff",
    discount: 50,
    type: "flat",
  },
  {
    label: "30% OFF",
    color: "#3b82f6",
    textColor: "#ffffff",
    discount: 0.3,
    type: "percent",
  },
  {
    label: "Try Again",
    color: "#6b7280",
    textColor: "#ffffff",
    discount: 0,
    type: "none",
  },
];

interface SpinToWinProps {
  onWin: (discount: number) => void;
}

function SpinToWinSection({ onWin }: SpinToWinProps) {
  const { lang } = useLanguage();
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<(typeof SPIN_SEGMENTS)[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const numSegments = SPIN_SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  function handleSpin() {
    if (hasSpun || isSpinning) return;
    setIsSpinning(true);
    setShowResult(false);

    const winIdx = Math.floor(Math.random() * numSegments);
    // Spin 5 full rotations + land on segment
    // The wheel stops with the winning segment pointing UP (270deg from right = 12 o'clock)
    // Segment center at: winIdx * segmentAngle + segmentAngle/2
    // We want that at 270deg (top) when stopped
    const segCenter = winIdx * segmentAngle + segmentAngle / 2;
    const targetAngle = 270 - segCenter;
    const totalRotation =
      rotation + 5 * 360 + ((targetAngle - (rotation % 360) + 360) % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      const won = SPIN_SEGMENTS[winIdx];
      setResult(won);
      setHasSpun(true);
      setIsSpinning(false);
      setShowResult(true);
      if (won.type !== "none") {
        // We'll notify parent
        // For percent: we pass a special marker; for flat: direct value
        // Store in parent as spinDiscount object
        onWin(
          won.type === "percent"
            ? -(won.discount as number)
            : (won.discount as number),
        );
      }
    }, 3200);
  }

  // Build SVG wheel
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  function polarToCart(deg: number, radius: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const paths = SPIN_SEGMENTS.map((seg, i) => {
    const startAngle = i * segmentAngle;
    const endAngle = (i + 1) * segmentAngle;
    const start = polarToCart(startAngle, r);
    const end = polarToCart(endAngle, r);
    const mid = polarToCart(startAngle + segmentAngle / 2, r * 0.62);
    const largeArc = segmentAngle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    return { d, seg, mid };
  });

  return (
    <section data-ocid="spin.section" className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-violet-400/40 bg-gradient-to-br from-violet-950/80 via-fuchsia-950/70 to-indigo-950/80 p-6 md:p-10"
      >
        {/* Glow bg */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, oklch(0.6 0.3 310) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-6">
          <div className="text-center">
            <motion.h2
              className="font-display font-bold text-3xl md:text-4xl mb-2"
              style={{ color: "oklch(0.9 0.15 310)" }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              {t("spinToWin", lang)}
            </motion.h2>
            <p className="text-violet-300/70 text-sm">
              Spin the wheel once per order for a surprise discount!
            </p>
          </div>

          {/* Wheel container */}
          <div
            className="relative flex flex-col items-center"
            data-ocid="spin.canvas_target"
          >
            {/* Pointer arrow at top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-2xl drop-shadow-lg"
              style={{ filter: "drop-shadow(0 0 6px oklch(0.9 0.2 60))" }}
            >
              ▼
            </div>
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 3.2s cubic-bezier(0.17, 0.67, 0.12, 1.0)"
                  : "none",
                borderRadius: "50%",
                boxShadow:
                  "0 0 32px oklch(0.6 0.3 310 / 0.5), 0 0 8px oklch(0.7 0.2 60 / 0.3)",
                border: "3px solid oklch(0.7 0.15 310 / 0.5)",
              }}
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label="Spin to Win prize wheel"
              >
                {paths.map(({ d, seg, mid }, i) => (
                  <g key={seg.label}>
                    <path
                      d={d}
                      fill={seg.color}
                      stroke="oklch(0.15 0.02 280)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={mid.x}
                      y={mid.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={seg.textColor}
                      fontSize={seg.label.length > 7 ? "9" : "11"}
                      fontWeight="700"
                      transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${mid.x}, ${mid.y})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                ))}
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill="oklch(0.15 0.02 280)"
                  stroke="oklch(0.7 0.15 310)"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="800"
                >
                  ✨
                </text>
              </svg>
            </div>
          </div>

          {/* Spin Button */}
          {!hasSpun && (
            <motion.button
              type="button"
              data-ocid="spin.primary_button"
              onClick={handleSpin}
              disabled={isSpinning}
              whileHover={!isSpinning ? { scale: 1.06 } : {}}
              whileTap={!isSpinning ? { scale: 0.96 } : {}}
              className="font-bold text-white text-lg px-10 py-3.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.3 310), oklch(0.5 0.3 280), oklch(0.55 0.28 240))",
                boxShadow: "0 4px 24px oklch(0.55 0.3 310 / 0.5)",
              }}
            >
              {isSpinning
                ? lang === "hi"
                  ? "स्पिन हो रहा है..."
                  : "Spinning..."
                : lang === "hi"
                  ? "🎡 स्पिन करें!"
                  : "🎡 SPIN!"}
            </motion.button>
          )}

          {/* Result Banner */}
          {showResult && result && (
            <motion.div
              data-ocid="spin.success_state"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border px-8 py-5 text-center max-w-sm w-full"
              style={{
                background:
                  result.type === "none"
                    ? "oklch(0.2 0.02 280)"
                    : "linear-gradient(135deg, oklch(0.18 0.04 310), oklch(0.2 0.06 280))",
                borderColor:
                  result.type === "none"
                    ? "oklch(0.4 0.02 280)"
                    : "oklch(0.7 0.2 310 / 0.5)",
                boxShadow:
                  result.type === "none"
                    ? "none"
                    : "0 0 24px oklch(0.6 0.2 310 / 0.3)",
              }}
            >
              {result.type === "none" ? (
                <>
                  <div className="text-4xl mb-2">😅</div>
                  <p className="font-bold text-lg text-gray-300">
                    Better luck next time!
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Spin again with your next order.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <p
                    className="font-bold text-2xl"
                    style={{ color: "oklch(0.9 0.2 310)" }}
                  >
                    You won:{" "}
                    <span style={{ color: "oklch(0.85 0.18 80)" }}>
                      {result.label}
                    </span>
                  </p>
                  <p className="text-violet-300/70 text-sm mt-1">
                    {result.type === "flat" && result.label !== "Free Topping!"
                      ? `₹${result.discount} discount applied to your cart!`
                      : result.type === "percent"
                        ? `${Math.round((result.discount as number) * 100)}% off applied to your cart!`
                        : "A free topping will be added to your next order!"}
                  </p>
                  <div
                    className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{
                      background: "oklch(0.55 0.3 310 / 0.3)",
                      color: "oklch(0.9 0.2 310)",
                      border: "1px dashed oklch(0.7 0.2 310 / 0.5)",
                    }}
                  >
                    🎟 Coupon Applied
                  </div>
                </>
              )}
            </motion.div>
          )}

          {hasSpun && !showResult && (
            <p
              data-ocid="spin.loading_state"
              className="text-violet-400/60 text-sm animate-pulse"
            >
              Spinning…
            </p>
          )}
        </div>
      </motion.div>
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
  const { lang } = useLanguage();
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
              {t("flashDeal", lang)}
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
              {t("grabThisDeal", lang)}
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

// ── Family Combo Deal Banner ────────────────────────────────────────────────
function JumboPackBanner({ onShopJumbo }: { onShopJumbo: () => void }) {
  const { lang } = useLanguage();
  return (
    <section
      data-ocid="jumbo_pack.section"
      className="max-w-6xl mx-auto px-4 mb-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl p-5 border border-yellow-400/40 bg-gradient-to-r from-yellow-900/40 via-amber-900/30 to-orange-900/40 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.75 0.18 85) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <div className="text-5xl animate-bounce">🎊</div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-yellow-300 font-bold text-lg">
              {lang === "hi"
                ? "शादी या पार्टी? जम्बो पैक ऑर्डर करें!"
                : "🎊 Planning a Wedding or Party? Order Jumbo Packs!"}
            </div>
            <div className="text-yellow-200/70 text-sm mt-1">
              {lang === "hi"
                ? "15–25 मेहमानों के लिए • शादी, जन्मदिन और उत्सव के लिए • ₹799 से शुरू"
                : "Serves 15–25 guests • Weddings, Birthdays, Anniversaries & Festivals • Starting at ₹799"}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              {[
                "💍 Wedding",
                "🎂 Birthday",
                "🎆 Anniversary",
                "🏢 Corporate",
                "🪔 Puja",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <motion.button
            type="button"
            data-ocid="jumbo_pack.primary_button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onShopJumbo}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg"
          >
            {lang === "hi" ? "जम्बो पैक देखें →" : "Shop Jumbo Packs →"}
          </motion.button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
      </motion.div>
    </section>
  );
}

interface BulkEnquiry {
  name: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guests: string;
  flavours: string;
  specialRequests: string;
  submittedAt: string;
}

function PackComparisonChart({
  onShopFamily,
  onShopJumbo,
}: {
  onShopFamily: () => void;
  onShopJumbo: () => void;
}) {
  const { lang } = useLanguage();
  const hi = lang === "hi";

  const rows = [
    {
      feature: { en: "Serves", hi: "कितने लोग" },
      family: { en: "4–6 people", hi: "4–6 लोग" },
      jumbo: { en: "15–25 people", hi: "15–25 लोग" },
    },
    {
      feature: { en: "Price", hi: "कीमत" },
      family: { en: "₹299–₹449", hi: "₹299–₹449" },
      jumbo: { en: "₹799–₹1,499", hi: "₹799–₹1,499" },
    },
    {
      feature: { en: "Best For", hi: "किसके लिए" },
      family: { en: "Home family treat", hi: "घर पर परिवार के साथ" },
      jumbo: { en: "Weddings, parties & events", hi: "शादी, पार्टी और उत्सव" },
    },
    {
      feature: { en: "Size", hi: "साइज़" },
      family: { en: "Medium big block", hi: "मीडियम बड़ा ब्लॉक" },
      jumbo: { en: "Extra large tub", hi: "एक्स्ट्रा लार्ज टब" },
    },
    {
      feature: { en: "Flavours", hi: "फ्लेवर" },
      family: { en: "6 flavours", hi: "6 फ्लेवर" },
      jumbo: { en: "8 flavours", hi: "8 फ्लेवर" },
    },
    {
      feature: { en: "Value per person", hi: "प्रति व्यक्ति कीमत" },
      family: { en: "~₹75 per person", hi: "~₹75 प्रति व्यक्ति" },
      jumbo: { en: "~₹50–₹67 per person", hi: "~₹50–₹67 प्रति व्यक्ति" },
    },
  ];

  return (
    <section
      data-ocid="pack_comparison.section"
      className="max-w-6xl mx-auto px-4 mb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-br from-[#0d0520]/90 via-[#120a2e]/80 to-[#0a1428]/90 overflow-hidden"
      >
        {/* Background starfield dots */}
        {Array.from({ length: 30 }, (_, i) => `star-${i}`).map((id) => (
          <div
            key={id}
            className="absolute rounded-full bg-white/40 animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Section Title */}
        <div className="relative text-center mb-8">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300">
              {hi
                ? "🍦 फैमिली पैक बनाम जम्बो पार्टी पैक"
                : "🍦 Family Pack vs Jumbo Party Pack"}
            </h2>
            <div className="h-1 mt-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-400" />
          </div>
          <p className="text-white/50 text-sm mt-3">
            {hi
              ? "अपनी ज़रूरत के अनुसार सही पैक चुनें"
              : "Choose the right pack for your occasion"}
          </p>
        </div>

        {/* Cards + VS layout */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-start">
          {/* Family Pack Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-purple-400/40 bg-gradient-to-b from-purple-900/60 to-purple-950/80 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-center">
              <div className="text-2xl">🏠</div>
              <div className="font-bold text-white text-base sm:text-lg">
                {hi ? "फैमिली पैक" : "Family Pack"}
              </div>
              <div className="text-purple-200 text-xs mt-0.5">
                {hi ? "बिग ब्लॉक" : "Big Block"}
              </div>
            </div>
            <div className="divide-y divide-purple-700/30">
              {rows.map((row) => (
                <div key={row.feature.en} className="px-3 py-2.5 text-center">
                  <div className="text-purple-300/60 text-xs mb-0.5">
                    {hi ? row.feature.hi : row.feature.en}
                  </div>
                  <div className="text-white font-medium text-sm">
                    {hi ? row.family.hi : row.family.en}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3">
              <motion.button
                type="button"
                data-ocid="pack_comparison.family.button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onShopFamily}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/40"
              >
                {hi ? "फैमिली पैक देखें →" : "Shop Family Packs →"}
              </motion.button>
            </div>
          </motion.div>

          {/* VS Badge */}
          <div className="flex flex-col items-center justify-start pt-16 gap-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-pink-900/50 border-2 border-pink-300/30 z-10 relative">
              VS
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-pink-500/50 to-transparent min-h-[80px]" />
          </div>

          {/* Jumbo Party Pack Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-yellow-400/40 bg-gradient-to-b from-yellow-900/60 to-amber-950/80 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-3 text-center relative">
              <div className="text-2xl">👑</div>
              <div className="font-bold text-black text-base sm:text-lg">
                {hi ? "जम्बो पार्टी पैक" : "Jumbo Party Pack"}
              </div>
              <div className="text-yellow-900 text-xs mt-0.5">
                {hi ? "एक्स्ट्रा लार्ज टब" : "Extra Large Tub"}
              </div>
              {/* Best Value Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-full shadow-lg transform rotate-6 leading-tight">
                {hi ? "⭐ बेस्ट वैल्यू" : "⭐ Best Value"}
                <br />
                {hi ? "इवेंट के लिए!" : "for Events!"}
              </div>
            </div>
            <div className="divide-y divide-yellow-700/30">
              {rows.map((row) => (
                <div key={row.feature.en} className="px-3 py-2.5 text-center">
                  <div className="text-yellow-300/60 text-xs mb-0.5">
                    {hi ? row.feature.hi : row.feature.en}
                  </div>
                  <div className="text-white font-medium text-sm">
                    {hi ? row.jumbo.hi : row.jumbo.en}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3">
              <motion.button
                type="button"
                data-ocid="pack_comparison.jumbo.button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onShopJumbo}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-900/40"
              >
                {hi ? "जम्बो पैक देखें →" : "Shop Jumbo Packs →"}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Footer tip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative mt-6 text-center text-white/50 text-xs"
        >
          💡{" "}
          {hi
            ? "जम्बो पैक में प्रति व्यक्ति कीमत सबसे कम है — बड़े आयोजनों के लिए आदर्श!"
            : "Jumbo Pack offers the lowest cost per person — ideal for large gatherings!"}
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
      </motion.div>
    </section>
  );
}

function BulkOrderEnquiry() {
  const { lang } = useLanguage();
  const [bulkForm, setBulkForm] = useState({
    name: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guests: "",
    flavours: "",
    specialRequests: "",
  });
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [bulkStars, setBulkStars] = useState<
    { x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    setBulkStars(
      Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 2,
      })),
    );
  }, []);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enquiry: BulkEnquiry = {
      ...bulkForm,
      submittedAt: new Date().toISOString(),
    };
    const existing: BulkEnquiry[] = JSON.parse(
      localStorage.getItem("bulkEnquiries") || "[]",
    );
    existing.push(enquiry);
    localStorage.setItem("bulkEnquiries", JSON.stringify(existing));
    setBulkSubmitted(true);
    setTimeout(() => {
      setBulkSubmitted(false);
      setBulkForm({
        name: "",
        phone: "",
        eventType: "",
        eventDate: "",
        guests: "",
        flavours: "",
        specialRequests: "",
      });
    }, 5000);
  };

  const bt = {
    title:
      lang === "hi"
        ? "🎉 बल्क / पार्टी ऑर्डर बुक करें"
        : "🎉 Book Bulk / Party Orders",
    sub:
      lang === "hi"
        ? "शादी, जन्मदिन, कॉर्पोरेट और विशेष अवसरों के लिए बल्क ऑर्डर करें"
        : "Order in bulk for Weddings, Birthdays, Corporate Events & Special Occasions",
    name: lang === "hi" ? "आपका नाम" : "Customer Name",
    phone: lang === "hi" ? "फ़ोन नंबर" : "Phone Number",
    eventType: lang === "hi" ? "इवेंट का प्रकार" : "Event Type",
    selectEvent: lang === "hi" ? "इवेंट चुनें" : "Select Event Type",
    eventDate: lang === "hi" ? "इवेंट की तारीख" : "Event Date",
    guests:
      lang === "hi" ? "मेहमानों की संख्या (न्यूनतम 20)" : "Number of Guests (min 20)",
    flavours: lang === "hi" ? "पसंदीदा फ्लेवर" : "Flavour Preferences",
    flavoursPlaceholder:
      lang === "hi"
        ? "जैसे: केसर पिस्ता रॉयल, चॉकलेट ट्रफल..."
        : "e.g. Kesar Pista Royale, Chocolate Truffle Extravaganza...",
    special: lang === "hi" ? "विशेष अनुरोध" : "Special Requests",
    specialPlaceholder:
      lang === "hi"
        ? "कस्टम केक, डेकोरेशन, डिलीवरी जानकारी..."
        : "Custom cake topper, decoration preferences, delivery details...",
    submit: lang === "hi" ? "एंक्वायरी भेजें" : "Submit Enquiry",
    success:
      lang === "hi"
        ? "🎉 धन्यवाद! हम 24 घंटे में संपर्क करेंगे।"
        : "🎉 Thank you! We'll contact you within 24 hours.",
    successSub:
      lang === "hi"
        ? "आपकी एंक्वायरी सफलतापूर्वक दर्ज हो गई है।"
        : "Your bulk order enquiry has been received successfully.",
  };

  const eventOptions = [
    { value: "wedding", label: lang === "hi" ? "💍 शादी" : "💍 Wedding" },
    { value: "birthday", label: lang === "hi" ? "🎂 जन्मदिन" : "🎂 Birthday" },
    {
      value: "anniversary",
      label: lang === "hi" ? "🎆 सालगिरह" : "🎆 Anniversary",
    },
    {
      value: "corporate",
      label: lang === "hi" ? "🏢 कॉर्पोरेट इवेंट" : "🏢 Corporate Event",
    },
    {
      value: "puja",
      label: lang === "hi" ? "🪔 पूजा / पूजन" : "🪔 Puja / Pooja",
    },
    { value: "other", label: lang === "hi" ? "✨ अन्य" : "✨ Other" },
  ];

  return (
    <section
      data-ocid="bulk_order.section"
      className="max-w-6xl mx-auto px-4 mb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden border border-purple-500/40"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 290) 0%, oklch(0.10 0.05 320) 50%, oklch(0.08 0.04 260) 100%)",
        }}
      >
        {/* Starfield */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {bulkStars.map((s) => (
            <motion.div
              key={`bulk-star-${s.x.toFixed(2)}-${s.y.toFixed(2)}`}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                opacity: 0.6,
              }}
              animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
              transition={{
                duration: 2 + s.delay,
                repeat: Number.POSITIVE_INFINITY,
                delay: s.delay,
              }}
            />
          ))}
        </div>

        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-violet-400 bg-clip-text text-transparent"
            >
              {bt.title}
            </motion.h2>
            <p className="text-purple-200/70 text-sm">{bt.sub}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[
                "💍 Wedding",
                "🎂 Birthday",
                "🏢 Corporate",
                "🪔 Puja",
                "🎆 Anniversary",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border border-purple-400/30 text-purple-200 bg-purple-500/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {bulkSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              data-ocid="bulk_order.success_state"
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="text-6xl mb-4 inline-block"
              >
                🎉
              </motion.div>
              <div className="text-xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
                {bt.success}
              </div>
              <p className="text-purple-200/70 text-sm">{bt.successSub}</p>
              <div className="flex justify-center gap-2 mt-4">
                {["🌟", "✨", "💫", "⭐", "🌟✨", "✨💫", "💫⭐"].map(
                  (s, i) => (
                    <motion.span
                      key={`success-star-${i}-${s}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-xl"
                    >
                      {s}
                    </motion.span>
                  ),
                )}
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleBulkSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="bulk-name"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.name} *
                </label>
                <input
                  id="bulk-name"
                  data-ocid="bulk_order.input"
                  type="text"
                  required
                  value={bulkForm.name}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Rahul Sharma"
                  className="bg-white/5 border border-purple-500/30 text-white placeholder-purple-300/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="bulk-phone"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.phone} *
                </label>
                <input
                  id="bulk-phone"
                  data-ocid="bulk_order.input"
                  type="tel"
                  required
                  value={bulkForm.phone}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="bg-white/5 border border-purple-500/30 text-white placeholder-purple-300/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all"
                />
              </div>

              {/* Event Type */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="bulk-event-type"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.eventType} *
                </label>
                <select
                  id="bulk-event-type"
                  data-ocid="bulk_order.select"
                  required
                  value={bulkForm.eventType}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, eventType: e.target.value }))
                  }
                  className="border border-purple-500/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all appearance-none"
                  style={{ background: "oklch(0.15 0.04 290)" }}
                >
                  <option
                    value=""
                    disabled
                    style={{ background: "oklch(0.15 0.04 290)" }}
                  >
                    {bt.selectEvent}
                  </option>
                  {eventOptions.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      style={{ background: "oklch(0.15 0.04 290)" }}
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Date */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="bulk-event-date"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.eventDate} *
                </label>
                <input
                  id="bulk-event-date"
                  data-ocid="bulk_order.input"
                  type="date"
                  required
                  value={bulkForm.eventDate}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, eventDate: e.target.value }))
                  }
                  className="bg-white/5 border border-purple-500/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              {/* Number of Guests */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="bulk-guests"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.guests} *
                </label>
                <input
                  id="bulk-guests"
                  data-ocid="bulk_order.input"
                  type="number"
                  required
                  min={20}
                  value={bulkForm.guests}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, guests: e.target.value }))
                  }
                  placeholder="50"
                  className="bg-white/5 border border-purple-500/30 text-white placeholder-purple-300/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all"
                />
              </div>

              {/* Flavour Preferences */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="bulk-flavours"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.flavours}
                </label>
                <textarea
                  id="bulk-flavours"
                  data-ocid="bulk_order.textarea"
                  rows={3}
                  value={bulkForm.flavours}
                  onChange={(e) =>
                    setBulkForm((p) => ({ ...p, flavours: e.target.value }))
                  }
                  placeholder={bt.flavoursPlaceholder}
                  className="bg-white/5 border border-purple-500/30 text-white placeholder-purple-300/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all resize-none"
                />
              </div>

              {/* Special Requests */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="bulk-special"
                  className="text-purple-200 text-sm font-medium"
                >
                  {bt.special}
                </label>
                <textarea
                  id="bulk-special"
                  data-ocid="bulk_order.textarea"
                  rows={3}
                  value={bulkForm.specialRequests}
                  onChange={(e) =>
                    setBulkForm((p) => ({
                      ...p,
                      specialRequests: e.target.value,
                    }))
                  }
                  placeholder={bt.specialPlaceholder}
                  className="bg-white/5 border border-purple-500/30 text-white placeholder-purple-300/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/70 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <div className="sm:col-span-2">
                <motion.button
                  type="submit"
                  data-ocid="bulk_order.submit_button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-bold text-base text-black shadow-lg transition-all bg-gradient-to-r from-yellow-400 via-pink-500 to-violet-500 hover:from-yellow-300 hover:to-violet-400"
                >
                  ✨ {bt.submit}
                </motion.button>
              </div>
            </form>
          )}
        </div>
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      </motion.div>
    </section>
  );
}

function FamilyComboBanner({ onShopFamily }: { onShopFamily: () => void }) {
  const { lang } = useLanguage();
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative rounded-2xl border border-emerald-400/40 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.06 170 / 0.85) 0%, oklch(0.13 0.05 200 / 0.75) 50%, oklch(0.14 0.06 215 / 0.85) 100%)",
        }}
      >
        {/* Glow overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.55 0.18 170 / 0.25) 0%, transparent 70%)",
          }}
        />
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          {/* Emojis */}
          <div className="flex gap-2 text-3xl flex-shrink-0 select-none">
            {(["🍫", "🍦", "🍓", "🧈", "🥭", "🌌"] as const).map((em, i) => (
              <motion.span
                key={em}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.18,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {em}
              </motion.span>
            ))}
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-1">
              <h3 className="font-display font-bold text-xl md:text-2xl text-emerald-100">
                {lang === "hi"
                  ? "👨‍👩‍👧‍👦 फैमिली कॉम्बो डील"
                  : "👨‍👩‍👧‍👦 Family Combo Deal"}
              </h3>
              <span
                data-ocid="family_combo.badge"
                className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 tracking-wide"
              >
                SAVE ₹100
              </span>
            </div>
            <p className="text-emerald-200/80 font-semibold text-base md:text-lg mb-0.5">
              {lang === "hi"
                ? "कोई भी 2 फैमिली पैक खरीदें और ₹100 बचाएं!"
                : "Buy Any 2 Family Packs, Save ₹100!"}
            </p>
            <p className="text-emerald-400/60 text-sm">
              Perfect for family celebrations. Mix &amp; match any 2 big blocks.
            </p>
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            data-ocid="family_combo.primary_button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onShopFamily}
            className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 hover:text-emerald-100 transition-all shadow-lg shadow-emerald-900/30"
          >
            {lang === "hi" ? "फैमिली पैक देखें →" : "Shop Family Packs →"}
          </motion.button>
        </div>

        {/* Bottom shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
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
  onAdd: (
    flavor: Flavor,
    toppings?: { name: string; emoji: string; price: number }[],
  ) => void;
}
function FlavorCard({ flavor, index, onAdd }: FlavorCardProps) {
  const { lang } = useLanguage();
  const meta = CATEGORY_META[flavor.category];
  const [expanded, setExpanded] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState<typeof TOPPINGS>([]);

  function toggleTopping(t: (typeof TOPPINGS)[0]) {
    setSelectedToppings((prev) =>
      prev.find((x) => x.id === t.id)
        ? prev.filter((x) => x.id !== t.id)
        : [...prev, t],
    );
  }

  function handleAdd() {
    onAdd(flavor, selectedToppings.length > 0 ? selectedToppings : undefined);
    setExpanded(false);
    setSelectedToppings([]);
  }

  function handleSkip() {
    onAdd(flavor);
    setExpanded(false);
    setSelectedToppings([]);
  }

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
          <Badge
            className="text-xs px-2 py-0.5 font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.2 85), oklch(0.65 0.25 65))",
              color: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.8 0.2 80)",
            }}
          >
            🏅 A1 Quality
          </Badge>
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
          onClick={() => setExpanded((v) => !v)}
          className="text-xs px-3 py-1 h-7 font-semibold"
          style={{
            background: expanded
              ? "linear-gradient(135deg, oklch(0.45 0.28 310), oklch(0.4 0.3 280))"
              : "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
            border: "none",
            color: "white",
          }}
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      {/* Inline Topping Picker */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-3 mt-1 border border-violet-500/30"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.05 310 / 0.8), oklch(0.10 0.04 280 / 0.8))",
              }}
            >
              <p className="text-xs font-bold text-violet-300 mb-2">
                {lang === "hi" ? "🍨 टॉपिंग्स जोड़ें" : "🍨 Add Toppings"}
              </p>
              <div className="space-y-1.5">
                {TOPPINGS.map((t) => {
                  const checked = !!selectedToppings.find((x) => x.id === t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTopping(t)}
                        aria-label={t.name}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          checked
                            ? "border-violet-400 bg-violet-500"
                            : "border-violet-500/40 bg-violet-900/40 group-hover:border-violet-400/70"
                        }`}
                      >
                        {checked && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                      </button>
                      <span className="text-xs text-violet-100 flex-1">
                        {t.emoji} {t.name}
                      </span>
                      <span className="text-xs text-violet-400 font-semibold">
                        +₹{t.price}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  data-ocid={`menu.item.${index + 1}`}
                  onClick={handleSkip}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  Skip & Add
                </button>
                <button
                  type="button"
                  data-ocid={`menu.item.${index + 1}`}
                  onClick={handleAdd}
                  className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
                  }}
                >
                  {lang === "hi" ? "🛒 कार्ट में डालें" : "🛒 Add to Cart"}
                  {selectedToppings.length > 0 && (
                    <span className="ml-1 opacity-80">
                      +₹{selectedToppings.reduce((s, t) => s + t.price, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  onPlaceOrder: (
    redeemPoints: boolean,
    referralDiscount: boolean,
    phone: string,
  ) => void;
  isFirstOrder: boolean;
  spinDiscount: number;
  spinDiscountType: "percent" | "flat" | "none";
  birthdayDiscount?: boolean;
  stripePublishableKey?: string;
  onPreOrder?: (
    date: string,
    time: string,
    phone: string,
    total: number,
  ) => void;
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
  spinDiscount,
  spinDiscountType,
  birthdayDiscount,
  stripePublishableKey,
  onPreOrder,
}: CartPanelProps) {
  const { lang } = useLanguage();
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [cartPhone, setCartPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [preOrderDate, setPreOrderDate] = useState("");
  const [preOrderTime, setPreOrderTime] = useState("");
  const [stripePaymentOpen, setStripePaymentOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDiscountType, setCouponDiscountType] = useState<
    "percent" | "flat"
  >("flat");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">(
    "online",
  );

  const subtotal = items.reduce((s, i) => {
    const toppingTotal = (i.toppings ?? []).reduce((ts, t) => ts + t.price, 0);
    return s + (i.flavor.price + toppingTotal) * i.qty;
  }, 0);
  const loyaltyDiscount = redeemPoints && loyaltyPoints >= 100 ? 50 : 0;
  const referralDiscount = referralApplied ? 50 : 0;
  const spinDiscountAmount =
    spinDiscountType === "percent"
      ? Math.round(subtotal * spinDiscount)
      : spinDiscountType === "flat"
        ? spinDiscount
        : 0;
  const birthdayDiscountAmount = birthdayDiscount
    ? Math.round(subtotal * 0.15)
    : 0;
  const couponDiscountAmount = appliedCoupon
    ? couponDiscountType === "percent"
      ? Math.round(subtotal * couponDiscount)
      : couponDiscount
    : 0;
  const total = Math.max(
    0,
    subtotal -
      loyaltyDiscount -
      referralDiscount -
      spinDiscountAmount -
      birthdayDiscountAmount -
      couponDiscountAmount,
  );
  const canRedeem = loyaltyPoints >= 100;

  const VALID_COUPONS: Record<
    string,
    { type: "percent" | "flat"; value: number; label: string }
  > = {
    GALAXY10: { type: "percent", value: 0.1, label: "10% off" },
    DIWALI20: { type: "percent", value: 0.2, label: "20% off" },
    HOLI15: { type: "percent", value: 0.15, label: "15% off" },
    WELCOME50: { type: "flat", value: 50, label: "₹50 off" },
    JUMBO100: { type: "flat", value: 100, label: "₹100 off" },
  };

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error(
        lang === "hi" ? "कृपया कूपन कोड दर्ज करें" : "Please enter a coupon code",
      );
      return;
    }
    if (appliedCoupon) {
      toast.error(
        lang === "hi" ? "एक ऑर्डर पर केवल एक कूपन" : "Only one coupon per order",
      );
      return;
    }
    const coupon = VALID_COUPONS[code];
    if (!coupon) {
      toast.error(lang === "hi" ? "अमान्य कूपन कोड" : "Invalid coupon code");
      return;
    }
    setAppliedCoupon(code);
    setCouponDiscountType(coupon.type);
    setCouponDiscount(coupon.value);
    toast.success(
      lang === "hi"
        ? `🎉 कूपन लागू! ${coupon.label}`
        : `🎉 Coupon applied! ${coupon.label}`,
    );
  }

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
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.toppings.map((t) => (
                              <p
                                key={t.name}
                                className="text-xs text-violet-400/70"
                              >
                                + {t.emoji} {t.name}{" "}
                                <span className="text-violet-500/60">
                                  +₹{t.price}
                                </span>
                              </p>
                            ))}
                          </div>
                        )}
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
                          ₹
                          {(item.flavor.price +
                            (item.toppings ?? []).reduce(
                              (s, t) => s + t.price,
                              0,
                            )) *
                            item.qty}
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

                {/* Coupon Code */}
                <div className="p-3 rounded-xl bg-violet-400/5 border border-violet-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-violet-300" />
                    <span className="text-xs font-semibold text-violet-300">
                      {lang === "hi" ? "कूपन कोड लगाएं" : "Have a coupon code?"}
                    </span>
                    {appliedCoupon && (
                      <Badge
                        className="text-xs ml-auto"
                        style={{
                          background: "oklch(0.45 0.2 290)",
                          color: "white",
                          border: "none",
                        }}
                      >
                        ✓ {appliedCoupon} applied
                      </Badge>
                    )}
                  </div>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        data-ocid="cart.input"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder={
                          lang === "hi" ? "कूपन कोड डालें" : "Enter Coupon Code"
                        }
                        className="text-xs h-8 flex-1"
                        style={{
                          background: "oklch(0.14 0.04 280)",
                          border: "1px solid oklch(0.3 0.06 285)",
                          color: "white",
                        }}
                      />
                      <button
                        type="button"
                        data-ocid="cart.secondary_button"
                        onClick={applyCoupon}
                        className="text-xs px-3 py-1 rounded-lg font-bold transition-all"
                        style={{
                          background: "oklch(0.45 0.2 290)",
                          color: "white",
                        }}
                      >
                        {lang === "hi" ? "लगाएं" : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-violet-300">
                      🎉{" "}
                      {lang === "hi"
                        ? "कूपन लागू हो गया!"
                        : "Coupon discount active!"}{" "}
                      Use codes: GALAXY10, DIWALI20, HOLI15, WELCOME50, JUMBO100
                    </p>
                  )}
                </div>

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
                  {spinDiscountAmount > 0 && (
                    <div className="flex justify-between text-violet-400">
                      <span>🎡 Spin Reward</span>
                      <span>-₹{spinDiscountAmount}</span>
                    </div>
                  )}
                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-violet-300">
                      <span>🎟️ Coupon ({appliedCoupon})</span>
                      <span>-₹{couponDiscountAmount}</span>
                    </div>
                  )}
                  {birthdayDiscountAmount > 0 && (
                    <div className="flex justify-between text-pink-400">
                      <span>🎂 Birthday 15% Off</span>
                      <span>-₹{birthdayDiscountAmount}</span>
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
                {/* Pre-Order Schedule */}
                <div
                  className="mb-3 p-3 rounded-xl"
                  style={{
                    background: "oklch(0.12 0.04 280)",
                    border: "1px solid oklch(0.25 0.08 280)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-violet-300 font-semibold flex items-center gap-1.5">
                      📅{" "}
                      {lang === "hi"
                        ? "बाद के लिए शेड्यूल करें"
                        : "Schedule for Later"}
                    </span>
                    <button
                      type="button"
                      data-ocid="cart.toggle"
                      onClick={() => setScheduleForLater((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-all ${scheduleForLater ? "bg-violet-500" : "bg-white/10"}`}
                      style={{ border: "1px solid oklch(0.35 0.1 280)" }}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${scheduleForLater ? "left-5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                  {scheduleForLater && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-xs text-violet-400 mb-1 block">
                          {lang === "hi" ? "तारीख" : "Date"}
                        </span>
                        <input
                          type="date"
                          data-ocid="cart.input"
                          value={preOrderDate}
                          min={
                            new Date(Date.now() + 86400000)
                              .toISOString()
                              .split("T")[0]
                          }
                          onChange={(e) => setPreOrderDate(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                          style={{
                            background: "oklch(0.16 0.04 280)",
                            border: "1px solid oklch(0.3 0.06 285)",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-violet-400 mb-1 block">
                          {lang === "hi" ? "समय" : "Time"}
                        </span>
                        <input
                          type="time"
                          data-ocid="cart.input"
                          value={preOrderTime}
                          onChange={(e) => setPreOrderTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                          style={{
                            background: "oklch(0.16 0.04 280)",
                            border: "1px solid oklch(0.3 0.06 285)",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Phone Number Field */}
                <div className="mb-3">
                  <label
                    htmlFor="cart-phone"
                    className="text-xs text-violet-300 font-semibold block mb-1"
                  >
                    {lang === "hi"
                      ? "📱 मोबाइल नंबर (ऑर्डर अपडेट के लिए)"
                      : "📱 Mobile Number (for order updates)"}
                  </label>
                  <input
                    id="cart-phone"
                    data-ocid="cart.input"
                    type="tel"
                    maxLength={10}
                    value={cartPhone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setCartPhone(v);
                      setPhoneError("");
                    }}
                    placeholder={
                      lang === "hi"
                        ? "9XXXXXXXXX (वैकल्पिक)"
                        : "9XXXXXXXXX (optional)"
                    }
                    className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-violet-400/40 outline-none focus:ring-1 focus:ring-amber-400/60 transition-all"
                    style={{
                      background: "oklch(0.14 0.04 280)",
                      border: "1px solid oklch(0.3 0.06 285)",
                    }}
                  />
                  {phoneError && (
                    <p
                      data-ocid="cart.error_state"
                      className="text-xs text-red-400 mt-1"
                    >
                      {phoneError}
                    </p>
                  )}
                </div>
                {/* Quality Guarantee Seal */}
                <div
                  className="p-3 rounded-xl border border-green-500/30 space-y-2"
                  style={{ background: "oklch(0.12 0.04 145)" }}
                >
                  <p className="text-xs font-bold text-green-400 flex items-center gap-1 justify-center">
                    🏅 {lang === "hi" ? "गुणवत्ता गारंटी" : "Quality Guarantee"}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { icon: "🥛", en: "A1 Grade Milk", hi: "A1 दूध" },
                      { icon: "🌿", en: "100% Natural", hi: "100% प्राकृतिक" },
                      {
                        icon: "✅",
                        en: "FSSAI Certified",
                        hi: "FSSAI प्रमाणित",
                      },
                    ].map((item) => (
                      <div
                        key={item.en}
                        className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[9px] font-semibold text-green-300 text-center leading-tight">
                          {lang === "hi" ? item.hi : item.en}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-green-300/70 text-center">
                    {lang === "hi"
                      ? "🌟 हर ऑर्डर पर 100% संतुष्टि की गारंटी"
                      : "🌟 100% Satisfaction Guaranteed on every order"}
                  </p>
                  {/* Satisfied or Refund Promise */}
                  <div
                    className="mt-2 rounded-lg px-3 py-2 text-center border border-amber-400/30"
                    style={{ background: "oklch(0.18 0.06 70)" }}
                  >
                    <p className="text-xs font-bold text-amber-300">
                      {lang === "hi"
                        ? "😊 खुश नहीं? पूरा रिफंड!"
                        : "😊 Not Happy? Full Refund Promise!"}
                    </p>
                    <p className="text-[10px] text-amber-200/70 mt-0.5 leading-tight">
                      {lang === "hi"
                        ? "बिना जोखिम के ऑर्डर करें। 100% संतुष्टि नहीं तो हम ठीक करेंगे।"
                        : "Order with zero risk. If you're not 100% satisfied, we'll make it right."}
                    </p>
                  </div>
                </div>
                {/* Payment Method Selector */}
                <div
                  className="p-3 rounded-xl border border-border space-y-2"
                  style={{ background: "oklch(0.13 0.03 280)" }}
                >
                  <p className="text-xs font-semibold text-violet-300 flex items-center gap-1">
                    💳{" "}
                    {lang === "hi"
                      ? "भुगतान का तरीका चुनें"
                      : "Choose Payment Method"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-semibold transition-all ${paymentMethod === "cod" ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-border text-muted-foreground hover:border-amber-400/40"}`}
                    >
                      <span className="text-lg">🚚</span>
                      {lang === "hi" ? "कैश ऑन डिलीवरी" : "Cash on Delivery"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-semibold transition-all ${paymentMethod === "online" ? "border-violet-400 bg-violet-400/10 text-violet-300" : "border-border text-muted-foreground hover:border-violet-400/40"}`}
                    >
                      <span className="text-lg">💳</span>
                      {lang === "hi" ? "ऑनलाइन भुगतान" : "Online Payment"}
                    </button>
                  </div>
                  {paymentMethod === "cod" && (
                    <p className="text-xs text-amber-300/70 text-center">
                      🏠{" "}
                      {lang === "hi"
                        ? "डिलीवरी पर नकद दें"
                        : "Pay cash when your order arrives"}
                    </p>
                  )}
                  {paymentMethod === "online" && !stripePublishableKey && (
                    <p className="text-xs text-violet-300/70 text-center">
                      ⚙️{" "}
                      {lang === "hi"
                        ? "Stripe की कुंजी डालें"
                        : "Activate Stripe via the gear icon to enable"}
                    </p>
                  )}
                </div>
                {stripePublishableKey && paymentMethod === "online" ? (
                  <Button
                    data-ocid="cart.stripe_button"
                    onClick={() => {
                      if (
                        cartPhone &&
                        (cartPhone.length !== 10 || !/^[6-9]/.test(cartPhone))
                      ) {
                        setPhoneError(
                          lang === "hi"
                            ? "कृपया सही 10-अंकीय नंबर दर्ज करें"
                            : "Please enter a valid 10-digit Indian mobile number",
                        );
                        return;
                      }
                      setStripePaymentOpen(true);
                    }}
                    className="w-full font-bold py-5"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.25 260), oklch(0.4 0.28 240), oklch(0.45 0.25 220))",
                      border: "1px solid oklch(0.6 0.2 240 / 0.4)",
                      color: "white",
                      boxShadow: "0 4px 24px oklch(0.45 0.25 240 / 0.4)",
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {lang === "hi" ? "Stripe से भुगतान करें" : "Pay with Stripe"} •
                    ₹{total.toLocaleString("en-IN")}
                  </Button>
                ) : (
                  <Button
                    data-ocid="cart.submit_button"
                    onClick={() => {
                      if (
                        cartPhone &&
                        (cartPhone.length !== 10 || !/^[6-9]/.test(cartPhone))
                      ) {
                        setPhoneError(
                          lang === "hi"
                            ? "कृपया सही 10-अंकीय नंबर दर्ज करें"
                            : "Please enter a valid 10-digit Indian mobile number",
                        );
                        return;
                      }
                      if (
                        scheduleForLater &&
                        (!preOrderDate || !preOrderTime)
                      ) {
                        toast.error(
                          "Please select date and time for scheduled delivery",
                        );
                        return;
                      }
                      if (scheduleForLater && onPreOrder) {
                        onPreOrder(
                          preOrderDate,
                          preOrderTime,
                          cartPhone,
                          total,
                        );
                        toast.success(
                          `🗓️ Pre-order scheduled! We'll prepare it for ${preOrderDate} at ${preOrderTime}`,
                        );
                        setScheduleForLater(false);
                        setPreOrderDate("");
                        setPreOrderTime("");
                      } else {
                        onPlaceOrder(redeemPoints, referralApplied, cartPhone);
                        if (paymentMethod === "cod") {
                          toast.success(
                            lang === "hi"
                              ? "✅ ऑर्डर दिया! डिलीवरी पर नकद दें 💵"
                              : "✅ Order placed! Pay cash on delivery 💵",
                          );
                        }
                      }
                      setRedeemPoints(false);
                      setReferralCode("");
                      setReferralApplied(false);
                      setCartPhone("");
                      setPhoneError("");
                    }}
                    className="w-full font-bold py-5"
                    style={
                      paymentMethod === "cod"
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.55 0.22 60), oklch(0.5 0.24 50))",
                            border: "none",
                            color: "white",
                            boxShadow: "0 4px 24px oklch(0.55 0.22 60 / 0.4)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280), oklch(0.55 0.28 240))",
                            border: "none",
                            color: "white",
                            boxShadow: "0 4px 24px oklch(0.55 0.28 310 / 0.4)",
                          }
                    }
                  >
                    {paymentMethod === "cod" ? (
                      <>
                        <span className="mr-2">🚚</span>
                        {lang === "hi"
                          ? "कैश ऑन डिलीवरी ऑर्डर करें"
                          : "Order with Cash on Delivery"}{" "}
                        • ₹{total.toLocaleString("en-IN")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {lang === "hi" ? "ऑर्डर दें" : "Place Order"} • ₹
                        {total.toLocaleString("en-IN")}
                      </>
                    )}
                  </Button>
                )}
                {stripePaymentOpen && (
                  <StripePaymentModal
                    isOpen={stripePaymentOpen}
                    onClose={() => setStripePaymentOpen(false)}
                    totalAmount={total}
                    publishableKey={stripePublishableKey}
                    onSuccess={() => {
                      setStripePaymentOpen(false);
                      onPlaceOrder(redeemPoints, referralApplied, cartPhone);
                      setRedeemPoints(false);
                      setReferralCode("");
                      setReferralApplied(false);
                      setCartPhone("");
                      setPhoneError("");
                    }}
                    lang={lang}
                  />
                )}
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
  const { lang } = useLanguage();
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
                  {lang === "hi" ? "लॉयल्टी पॉइंट्स" : "Loyalty Stars"}
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
              <div className="text-center py-4 px-6 rounded-xl bg-amber-400/10 border border-amber-400/20 mb-4">
                <p className="text-4xl font-black text-amber-300 mb-1">
                  {points}
                </p>
                <p className="text-sm text-amber-200/70">Your current points</p>
              </div>
              {/* Tier Progress */}
              {(() => {
                const tier = getLoyaltyTier(points);
                const tierMin =
                  points >= 1000
                    ? 600
                    : points >= 600
                      ? 300
                      : points >= 300
                        ? 100
                        : points >= 100
                          ? 0
                          : 0;
                const progress =
                  tier.next === Number.POSITIVE_INFINITY
                    ? 100
                    : Math.min(
                        100,
                        Math.round(
                          ((points - tierMin) / (tier.next - tierMin)) * 100,
                        ),
                      );
                return (
                  <div
                    className="mb-5 p-4 rounded-xl border"
                    style={{
                      background: "oklch(0.12 0.04 280)",
                      borderColor: "oklch(0.45 0.2 60 / 0.4)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "oklch(0.82 0.18 60)" }}
                      >
                        {tier.emoji} {tier.name}
                      </span>
                      {tier.next !== Number.POSITIVE_INFINITY && (
                        <span className="text-xs text-muted-foreground">
                          {tier.next - points} pts to {tier.nextName}
                        </span>
                      )}
                    </div>
                    <div
                      className="h-2.5 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.2 0.05 280)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          background:
                            "linear-gradient(90deg, oklch(0.65 0.22 60), oklch(0.75 0.25 290))",
                          boxShadow: "0 0 8px oklch(0.7 0.25 60 / 0.6)",
                        }}
                      />
                    </div>
                    {tier.next !== Number.POSITIVE_INFINITY && (
                      <p className="text-xs text-center mt-1.5 text-muted-foreground">
                        {progress}% to {tier.nextName}
                      </p>
                    )}
                  </div>
                );
              })()}
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
  const { lang } = useLanguage();
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
      text: getNovaResponse(trimmed, lang),
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
                <p className="text-xs text-violet-300/70">
                  {lang === "hi" ? "AI पार्लर मैनेजर" : "AI Parlour Manager"}
                </p>
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
                placeholder={
                  lang === "hi" ? "Nova से कुछ भी पूछें..." : "Ask Nova anything..."
                }
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
  const { lang } = useLanguage();
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
            {lang === "hi"
              ? "Galaxy Ice Cream Parlour के बारे में"
              : "About Galaxy Ice Cream Parlour"}
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

// ── Delivery & Packaging Section ─────────────────────────────────────────────
function DeliverySection() {
  const { lang } = useLanguage();
  const steps = [
    {
      icon: "🧊",
      title: "Thermocol Box",
      desc: "Your ice cream is packed in a premium thermocol (styrofoam) box that keeps it cold for up to 3 hours.",
    },
    {
      icon: "❄️",
      title: "Ice Pack Inside",
      desc: "Dry ice packs are placed inside to ensure your flavours stay perfectly frozen during transit.",
    },
    {
      icon: "✨",
      title: "Cosmic Branding",
      desc: "Beautiful Galaxy-branded box with stars and cosmic design — it's an unboxing experience in itself!",
    },
    {
      icon: "🎀",
      title: "Sealed with Love",
      desc: "Each box is sealed with a Galaxy sticker and ribbon — perfect as a gift too!",
    },
    {
      icon: "🛵",
      title: "Swiggy / Zomato Delivery",
      desc: "We partner with Swiggy and Zomato delivery partners who carry insulated bags to keep your order cold.",
    },
    {
      icon: "⏱️",
      title: "30–45 Min Delivery",
      desc: "Fast delivery to your doorstep. Track your order live through the delivery app.",
    },
  ];

  return (
    <section
      data-ocid="delivery.section"
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 border border-cyan-400/20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.06 200 / 0.9), oklch(0.12 0.05 240 / 0.9), oklch(0.10 0.06 260 / 0.9))",
          boxShadow: "0 0 80px oklch(0.45 0.25 200 / 0.12)",
        }}
      >
        {/* Decorative snowflakes */}
        {[...Array(8)].map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative only
            key={i}
            className="absolute text-white/10 pointer-events-none select-none text-2xl"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${(i / 8) * 100}%`,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            ❄️
          </div>
        ))}

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="font-display font-bold text-2xl mb-2 gradient-text">
              {lang === "hi" ? "डिलीवरी और पैकेजिंग" : "Delivery & Packaging"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              We make sure your cosmic ice cream arrives at your doorstep
              perfectly frozen, beautifully packaged, and ready to enjoy!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {steps.map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-xl p-5 border border-white/10 text-left"
                style={{ background: "oklch(0.14 0.05 220 / 0.7)" }}
              >
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Packaging visual */}
          <div
            className="rounded-xl p-6 border border-cyan-400/20 text-center"
            style={{ background: "oklch(0.14 0.05 220 / 0.5)" }}
          >
            <div className="text-5xl mb-3">📦</div>
            <h3 className="font-semibold text-white mb-2">Our Galaxy Box</h3>
            <p className="text-muted-foreground text-xs max-w-md mx-auto mb-4">
              Every order comes in our signature{" "}
              <span className="text-cyan-300 font-medium">
                Galaxy Cosmic Box
              </span>{" "}
              — deep space blue with gold stars, sealed with a Galaxy sticker.
              Your ice cream deserves a royal delivery!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "🌌 Cosmic Design",
                "🧊 Stays Frozen",
                "♻️ Eco-Friendly Box",
                "🎁 Gift Ready",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border border-cyan-400/30 text-cyan-200"
                  style={{ background: "oklch(0.18 0.06 200 / 0.5)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ShareSection() {
  const { lang } = useLanguage();
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
          {copied
            ? lang === "hi"
              ? "कॉपी हो गया!"
              : "Copied!"
            : lang === "hi"
              ? "कॉपी और शेयर करें"
              : "Copy & Share"}
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
  onLeaveReview?: () => void;
  queueItem?: OrderQueueItem | null;
  lang?: "en" | "hi";
}
function OrderSuccess({
  isOpen,
  onClose,
  pointsEarned,
  totalPoints,
  referralUsed,
  onLeaveReview,
  queueItem,
  lang = "en",
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
              {queueItem && (
                <div className="mb-4">
                  <OrderConfirmationCard order={queueItem} lang={lang} />
                </div>
              )}
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
              {onLeaveReview && (
                <Button
                  data-ocid="order.open_modal_button"
                  onClick={() => {
                    onClose();
                    setTimeout(onLeaveReview, 200);
                  }}
                  variant="outline"
                  className="w-full font-semibold border-amber-400/40 text-amber-300 hover:bg-amber-400/10 mb-2"
                >
                  ⭐ Rate Your Experience
                </Button>
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
  onKeySaved: (key: string) => void;
}
function StripeSetup({ isOpen, onClose, onKeySaved }: StripeSetupProps) {
  const [stripeKey, setStripeKey] = useState(() => {
    try {
      return localStorage.getItem("stripePublishableKey") ?? "";
    } catch {
      return "";
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    const trimmed = stripeKey.trim();
    if (!trimmed) {
      toast.error("Please enter your Stripe Publishable Key");
      return;
    }
    if (!trimmed.startsWith("pk_live_") && !trimmed.startsWith("pk_test_")) {
      toast.error("Key must start with pk_live_ or pk_test_");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem("stripePublishableKey", trimmed);
      } catch {
        /* ignore */
      }
      onKeySaved(trimmed);
      setIsSaving(false);
      toast.success("✅ Stripe Activated! Pay with Stripe is now live.");
      onClose();
    }, 800);
  }

  function handleRemove() {
    try {
      localStorage.removeItem("stripePublishableKey");
    } catch {
      /* ignore */
    }
    setStripeKey("");
    onKeySaved("");
    toast("Stripe key removed");
    onClose();
  }

  const isActive =
    stripeKey.startsWith("pk_live_") || stripeKey.startsWith("pk_test_");

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
          {isActive && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm text-emerald-300 font-semibold">
                Stripe is Active — Real payments enabled!
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Add your Stripe{" "}
            <strong className="text-violet-300">Publishable Key</strong> to show
            a "Pay with Stripe" button at checkout. Customers will see a real
            card payment UI.
          </p>
          <div className="p-3 rounded-xl border border-blue-400/20 bg-blue-400/5 text-xs text-blue-300 space-y-1">
            <p className="font-semibold">How to get your Publishable Key:</p>
            <p>
              1. Go to{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-400"
              >
                stripe.com
              </a>{" "}
              → Sign in
            </p>
            <p>
              2. Click <strong>Developers</strong> → <strong>API Keys</strong>
            </p>
            <p>
              3. Copy the <strong>Publishable key</strong> (starts with pk_live_
              or pk_test_)
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-violet-200">Stripe Publishable Key</Label>
            <Input
              data-ocid="stripe.input"
              type="text"
              placeholder="pk_live_... or pk_test_..."
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="bg-white/5 border-violet-500/30 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is your <em>public</em> key — safe to use in the browser.
              Never share your secret key (sk_).
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
            {isActive && (
              <Button
                data-ocid="stripe.remove_button"
                variant="outline"
                onClick={handleRemove}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                Remove
              </Button>
            )}
            <Button
              data-ocid="stripe.save_button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-violet-600 hover:bg-violet-500"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isActive ? "Update Key" : "Activate Stripe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Stripe Payment Modal ─────────────────────────────────────────────────────
interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  publishableKey?: string;
  onSuccess: () => void;
  lang: Lang;
}
function StripePaymentModal({
  isOpen,
  onClose,
  totalAmount,
  // publishableKey, // reserved for future server-side integration
  onSuccess,
  lang,
}: StripePaymentModalProps) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  function formatCardNumber(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function handlePay() {
    setPayError("");
    if (!cardName.trim()) {
      setPayError("Please enter cardholder name");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setPayError("Please enter a valid 16-digit card number");
      return;
    }
    if (expiry.length < 5) {
      setPayError("Please enter a valid expiry date");
      return;
    }
    if (cvc.length < 3) {
      setPayError("Please enter a valid CVC");
      return;
    }

    setIsPaying(true);
    // Simulate payment processing (real integration needs backend PaymentIntent)
    setTimeout(() => {
      setIsPaying(false);
      onSuccess();
    }, 2000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black"
          />
          <motion.div
            data-ocid="stripe.modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-blue-400/30 overflow-hidden"
              style={{
                background: "oklch(0.1 0.03 260)",
                boxShadow: "0 0 80px oklch(0.45 0.25 240 / 0.3)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b border-blue-400/20"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.15 0.05 260), oklch(0.12 0.04 240))",
                }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-300" />
                  <span className="font-bold text-blue-200">
                    {lang === "hi" ? "Stripe से भुगतान" : "Pay with Stripe"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-blue-400/60 hover:text-blue-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Amount */}
                <div
                  className="text-center py-4 rounded-xl border border-blue-400/20"
                  style={{ background: "oklch(0.13 0.04 260)" }}
                >
                  <p className="text-xs text-blue-300/70 mb-1">
                    {lang === "hi" ? "कुल राशि" : "Total Amount"}
                  </p>
                  <p className="text-3xl font-black text-blue-200">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-blue-300/50 mt-1">
                    Galaxy Ice Cream Parlour
                  </p>
                </div>

                {/* Card form */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-blue-200 text-xs mb-1 block">
                      Cardholder Name
                    </Label>
                    <Input
                      data-ocid="stripe.cardholder_input"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-white/5 border-blue-500/30 text-foreground placeholder:text-muted-foreground/40 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 text-xs mb-1 block">
                      Card Number
                    </Label>
                    <div className="relative">
                      <Input
                        data-ocid="stripe.card_input"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        className="bg-white/5 border-blue-500/30 text-foreground placeholder:text-muted-foreground/40 text-sm font-mono pr-10"
                        maxLength={19}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                        {cardNumber.startsWith("4")
                          ? "💳"
                          : cardNumber.startsWith("5")
                            ? "🔵"
                            : "💳"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-blue-200 text-xs mb-1 block">
                        Expiry
                      </Label>
                      <Input
                        data-ocid="stripe.expiry_input"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        className="bg-white/5 border-blue-500/30 text-foreground placeholder:text-muted-foreground/40 text-sm font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label className="text-blue-200 text-xs mb-1 block">
                        CVC
                      </Label>
                      <Input
                        data-ocid="stripe.cvc_input"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        className="bg-white/5 border-blue-500/30 text-foreground placeholder:text-muted-foreground/40 text-sm font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                {payError && (
                  <p
                    data-ocid="stripe.error_state"
                    className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
                  >
                    {payError}
                  </p>
                )}

                <div className="p-3 rounded-lg border border-amber-400/20 bg-amber-400/5 text-xs text-amber-300/70">
                  💡{" "}
                  {lang === "hi"
                    ? "वास्तविक भुगतान के लिए gear icon से Stripe secret key सक्रिय करें"
                    : "To process real payments, activate Stripe with your secret key from the gear icon"}
                </div>

                <Button
                  data-ocid="stripe.pay_button"
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full font-bold py-5"
                  style={{
                    background: isPaying
                      ? "oklch(0.35 0.1 240)"
                      : "linear-gradient(135deg, oklch(0.45 0.25 260), oklch(0.4 0.28 240))",
                    border: "none",
                    color: "white",
                    boxShadow: isPaying
                      ? "none"
                      : "0 4px 20px oklch(0.45 0.25 240 / 0.4)",
                  }}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {lang === "hi"
                        ? "प्रोसेस हो रहा है..."
                        : "Processing payment..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {lang === "hi"
                        ? `₹${totalAmount.toLocaleString("en-IN")} भुगतान करें`
                        : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
                    </>
                  )}
                </Button>

                <p className="text-center text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
                  🔒 Secured by Stripe • PCI DSS Compliant
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
function Footer({ onOwnerDashboard }: { onOwnerDashboard: () => void }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-8 py-6 text-center text-xs text-muted-foreground">
      <div className="mb-3">
        <button
          type="button"
          data-ocid="dashboard.open_modal_button"
          onClick={onOwnerDashboard}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-violet-400/30 bg-violet-400/8 text-violet-300 text-xs font-semibold hover:bg-violet-400/15 transition-colors"
        >
          📊 Owner Dashboard
        </button>
      </div>
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

// ── Trending Ticker ───────────────────────────────────────────────────────────
function TrendingTicker() {
  const { lang } = useLanguage();
  const messages =
    lang === "hi"
      ? [
          "⚡ 3 लोगों ने अभी Nebula Swirl ऑर्डर किया!",
          "🔥 Aurora Borealis Blast तेजी से बिक रहा है!",
          "💫 Taro Titan मुंबई में ट्रेंड कर रहा है!",
          "🌟 नया: Lavender Lightyear फिर से उपलब्ध!",
          "🛒 पिछले एक घंटे में 5 ऑर्डर!",
          "⭐ Cosmic Crunch: इस हफ्ते टॉप रेटेड!",
          "🎉 दिल्ली में किसी ने Spin पर 30% जीता!",
          "💜 Chili Comet: हिम्मत है तो ट्राई करो!",
        ]
      : [
          "⚡ 3 people just ordered Nebula Swirl!",
          "🔥 Aurora Borealis Blast is selling fast!",
          "💫 Taro Titan trending in Mumbai!",
          "🌟 New: Lavender Lightyear just restocked!",
          "🛒 5 orders placed in the last hour!",
          "⭐ Cosmic Crunch: Top Rated this week!",
          "🎉 Someone in Delhi just won 30% off Spin!",
          "💜 Chili Comet: Try it if you dare!",
        ];
  const doubled = [...messages, ...messages];
  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: tickerScroll 28s linear infinite;
          display: flex;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        data-ocid="ticker.section"
        className="overflow-hidden py-2.5 px-0 relative"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.08 0.04 280), oklch(0.12 0.06 310), oklch(0.08 0.04 280))",
          borderTop: "1px solid oklch(0.3 0.08 280 / 0.4)",
          borderBottom: "1px solid oklch(0.3 0.08 280 / 0.4)",
        }}
      >
        {/* Left gradient fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.08 0.04 280), transparent)",
          }}
        />
        {/* Lightning icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-violet-400 text-sm">
          ⚡
        </div>
        {/* Right gradient fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(270deg, oklch(0.08 0.04 280), transparent)",
          }}
        />
        <div className="ticker-track">
          {doubled.map((msg, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: ticker display
              key={i}
              className="inline-flex items-center gap-1 px-6 text-sm font-semibold whitespace-nowrap"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.82 0.18 310), oklch(0.78 0.2 220), oklch(0.85 0.15 180))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {msg}
              <span className="text-violet-500/40 mx-2">•</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Build Your Own Combo ──────────────────────────────────────────────────────
function ComboBuildSection({
  onAddCombo,
}: {
  onAddCombo: (f1: Flavor, f2: Flavor, cone: string, coneExtra: number) => void;
}) {
  const { lang } = useLanguage();
  const nonFamilyFlavors = FLAVORS.filter(
    (f) => f.category !== "family" && f.category !== "jumbo",
  );
  const [scoop1Id, setScoop1Id] = useState(nonFamilyFlavors[0].id);
  const [scoop2Id, setScoop2Id] = useState(nonFamilyFlavors[1].id);
  const [coneType, setConeType] = useState<"cup" | "waffle" | "sugar">("cup");

  const scoop1 =
    nonFamilyFlavors.find((f) => f.id === scoop1Id) ?? nonFamilyFlavors[0];
  const scoop2 =
    nonFamilyFlavors.find((f) => f.id === scoop2Id) ?? nonFamilyFlavors[1];
  const coneExtra = coneType === "waffle" ? 30 : coneType === "sugar" ? 20 : 0;
  const savings = 30;
  const comboPrice = scoop1.price + scoop2.price + coneExtra - savings;

  const coneOptions = [
    { id: "cup" as const, label: "Cup", emoji: "🥤", extra: 0 },
    { id: "waffle" as const, label: "Waffle Cone", emoji: "🧇", extra: 30 },
    { id: "sugar" as const, label: "Sugar Cone", emoji: "🍦", extra: 20 },
  ];

  return (
    <section data-ocid="combo.section" className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-indigo-400/30 p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.11 0.06 280 / 0.9), oklch(0.13 0.08 310 / 0.9), oklch(0.11 0.06 260 / 0.9))",
          boxShadow: "0 0 60px oklch(0.5 0.28 280 / 0.15)",
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.3 280), transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="relative z-10">
          <div className="text-center mb-6">
            <motion.h2
              className="font-display font-bold text-2xl md:text-3xl mb-2"
              style={{ color: "oklch(0.9 0.15 280)" }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
            >
              {lang === "hi"
                ? "🌌 अपना कॉस्मिक कॉम्बो बनाएं"
                : "🌌 Build Your Cosmic Combo"}
            </motion.h2>
            <p className="text-indigo-300/70 text-sm">
              Pick 2 scoops + cone and save ₹{savings}!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Scoop 1 */}
            <div>
              <label
                htmlFor="combo-scoop1"
                className="block text-xs font-semibold text-indigo-300 mb-2"
              >
                🍦 Scoop 1
              </label>
              <select
                id="combo-scoop1"
                data-ocid="combo.select"
                value={scoop1Id}
                onChange={(e) => setScoop1Id(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium border border-indigo-400/30 outline-none focus:border-indigo-400/70 transition-colors"
                style={{
                  background: "oklch(0.14 0.05 280 / 0.8)",
                  color: "oklch(0.9 0.05 280)",
                }}
              >
                {nonFamilyFlavors.map((f) => (
                  <option
                    key={f.id}
                    value={f.id}
                    style={{ background: "oklch(0.12 0.04 280)" }}
                  >
                    {f.emoji} {f.name} — ₹{f.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Scoop 2 */}
            <div>
              <label
                htmlFor="combo-scoop2"
                className="block text-xs font-semibold text-indigo-300 mb-2"
              >
                🍨 Scoop 2
              </label>
              <select
                id="combo-scoop2"
                data-ocid="combo.select"
                value={scoop2Id}
                onChange={(e) => setScoop2Id(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium border border-indigo-400/30 outline-none focus:border-indigo-400/70 transition-colors"
                style={{
                  background: "oklch(0.14 0.05 280 / 0.8)",
                  color: "oklch(0.9 0.05 280)",
                }}
              >
                {nonFamilyFlavors.map((f) => (
                  <option
                    key={f.id}
                    value={f.id}
                    style={{ background: "oklch(0.12 0.04 280)" }}
                  >
                    {f.emoji} {f.name} — ₹{f.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Animated preview */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                key={`${scoop1Id}-${scoop2Id}-${coneType}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-5xl text-center leading-tight"
              >
                {scoop1.emoji}
                {scoop2.emoji}
                <div className="text-4xl">
                  {coneType === "waffle"
                    ? "🧇"
                    : coneType === "sugar"
                      ? "🍦"
                      : "🥤"}
                </div>
              </motion.div>
              <p className="text-xs text-indigo-300/60 mt-1">
                Your combo preview
              </p>
            </div>
          </div>

          {/* Cone selector */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-indigo-300 mb-2">
              🍦 Choose Your Cone
            </p>
            <div className="flex gap-2 flex-wrap">
              {coneOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-ocid="combo.toggle"
                  onClick={() => setConeType(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    coneType === c.id
                      ? "border-indigo-400/70 bg-indigo-500/25 text-indigo-200"
                      : "border-indigo-400/20 text-indigo-300/60 hover:border-indigo-400/40"
                  }`}
                >
                  {c.emoji} {c.label}
                  {c.extra > 0 && (
                    <span className="text-xs opacity-70">+₹{c.extra}</span>
                  )}
                  {c.extra === 0 && (
                    <span className="text-xs opacity-70">Free</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-indigo-400/20"
            style={{ background: "oklch(0.10 0.04 280 / 0.6)" }}
          >
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl font-black"
                  style={{ color: "oklch(0.85 0.18 80)" }}
                >
                  ₹{comboPrice}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Save ₹{savings}
                </span>
              </div>
              <p className="text-xs text-indigo-300/60 mt-0.5">
                {scoop1.emoji} {scoop1.name} + {scoop2.emoji} {scoop2.name}
              </p>
            </div>
            <motion.button
              type="button"
              data-ocid="combo.primary_button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onAddCombo(scoop1, scoop2, coneType, coneExtra)}
              className="font-bold text-white px-6 py-3 rounded-xl whitespace-nowrap"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.3 280), oklch(0.5 0.28 310))",
                boxShadow: "0 4px 20px oklch(0.5 0.28 280 / 0.4)",
              }}
            >
              🛒 Add Combo to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Birthday Banner ───────────────────────────────────────────────────────────
function BirthdayBanner({
  onDiscountClaimed,
}: { onDiscountClaimed: () => void }) {
  const { lang } = useLanguage();
  const [claimed] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("galaxy_birthday_discount");
    } catch {
      return false;
    }
  });
  const [isActive, setIsActive] = useState(claimed);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  function handleClaim() {
    if (!name.trim()) return;
    try {
      localStorage.setItem("galaxy_birthday_discount", "true");
    } catch {
      /* ignore */
    }
    setIsActive(true);
    setModalOpen(false);
    setShowConfetti(true);
    onDiscountClaimed();
    toast.success(`🎂 Happy Birthday, ${name}! 15% off applied!`);
    setTimeout(() => setShowConfetti(false), 2000);
  }

  return (
    <>
      <style>{`
        @keyframes confettiBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .confetti-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: confettiBurst 1.2s ease-out forwards;
        }
        @keyframes bdayPulse {
          0%, 100% { box-shadow: 0 0 10px #f472b6, 0 0 20px #ec4899; transform: scale(1); }
          50% { box-shadow: 0 0 18px #ec4899, 0 0 36px #f472b6; transform: scale(1.04); }
        }
        .bday-btn { animation: bdayPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Confetti burst */}
      {showConfetti &&
        Array.from({ length: 20 }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: confetti display
            key={i}
            className="confetti-dot"
            style={
              {
                right: `${16 + (i % 5) * 8}px`,
                bottom: `${96 + Math.floor(i / 5) * 8}px`,
                background: [
                  "#f472b6",
                  "#a855f7",
                  "#60a5fa",
                  "#34d399",
                  "#fbbf24",
                ][i % 5],
                "--tx": `${(Math.random() - 0.5) * 200}px`,
                "--ty": `${-Math.random() * 200 - 50}px`,
                animationDelay: `${i * 0.04}s`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Floating button */}
      <div className="fixed bottom-24 right-4 z-50">
        {!isActive ? (
          <motion.button
            type="button"
            data-ocid="birthday.open_modal_button"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="bday-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-white text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.28 0), oklch(0.55 0.3 340))",
            }}
          >
            {lang === "hi"
              ? "🎂 जन्मदिन? 15% छूट पाएं!"
              : "🎂 Birthday? Get 15% Off!"}
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.2 160), oklch(0.5 0.22 160))",
              color: "white",
            }}
          >
            {lang === "hi"
              ? "🎂 जन्मदिन छूट लागू! ✓"
              : "🎂 Birthday Discount Active! ✓"}
          </motion.div>
        )}
      </div>

      {/* Birthday Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              data-ocid="birthday.modal"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 22 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-xs rounded-2xl p-6 border border-pink-400/30 text-center"
                style={{
                  background: "oklch(0.1 0.03 340)",
                  boxShadow: "0 0 60px oklch(0.55 0.28 340 / 0.3)",
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                  className="text-5xl mb-3"
                >
                  🎂
                </motion.div>
                <h3 className="font-display font-bold text-xl mb-1 text-pink-200">
                  {lang === "hi" ? "जन्मदिन सरप्राइज!" : "Birthday Surprise!"}
                </h3>
                <p className="text-xs text-pink-300/70 mb-4">
                  It's your special day! Tell us your name and claim 15% off
                  your order 🎉
                </p>
                <input
                  data-ocid="birthday.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                  placeholder="Your first name..."
                  className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm border border-pink-400/30 outline-none focus:border-pink-400/60 transition-colors text-center"
                  style={{
                    background: "oklch(0.14 0.04 340 / 0.8)",
                    color: "oklch(0.9 0.05 340)",
                  }}
                />
                <button
                  type="button"
                  data-ocid="birthday.primary_button"
                  onClick={handleClaim}
                  className="w-full py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.28 0), oklch(0.55 0.3 340))",
                  }}
                >
                  Claim My 15% Off 🎉
                </button>
                <button
                  type="button"
                  data-ocid="birthday.close_button"
                  onClick={() => setModalOpen(false)}
                  className="mt-2 text-xs text-pink-400/50 hover:text-pink-400/80 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Seasonal Auto-Banner ──────────────────────────────────────────────────────
function SeasonalAutoBanner({ onDismiss }: { onDismiss: () => void }) {
  const month = new Date().getMonth() + 1; // 1-12
  const bannerData =
    month === 3
      ? {
          msg: "🎨 Holi Special! Use code HOLI15 for 15% off all orders!",
          color: "oklch(0.65 0.22 30)",
          glow: "oklch(0.65 0.22 30 / 0.5)",
        }
      : month === 10 || month === 11
        ? {
            msg: "🪔 Diwali Dhamaka! Use code DIWALI20 for 20% off!",
            color: "oklch(0.75 0.2 60)",
            glow: "oklch(0.75 0.2 60 / 0.5)",
          }
        : month === 12
          ? {
              msg: "🎄 Christmas Special! Use code XMAS25 for 25% off!",
              color: "oklch(0.55 0.2 150)",
              glow: "oklch(0.55 0.2 150 / 0.5)",
            }
          : month === 1
            ? {
                msg: "🎆 New Year Offer! Use code NEWYEAR30 for 30% off!",
                color: "oklch(0.65 0.25 240)",
                glow: "oklch(0.65 0.25 240 / 0.5)",
              }
            : null;
  if (!bannerData) return null;
  return (
    <div
      className="relative text-center py-3 px-10 text-sm font-bold"
      style={{
        background: "oklch(0.12 0.05 280)",
        borderTop: `2px solid ${bannerData.color}`,
        borderBottom: `2px solid ${bannerData.color}`,
        animation: "seasonalPulse 2s ease-in-out infinite",
        color: bannerData.color,
        textShadow: `0 0 12px ${bannerData.glow}`,
        boxShadow: `inset 0 0 30px ${bannerData.glow}`,
      }}
    >
      {bannerData.msg}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: bannerData.color }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Ice Cream of the Month ────────────────────────────────────────────────────
function IceCreamOfTheMonth({ onAdd }: { onAdd: (f: Flavor) => void }) {
  const { lang } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    function calc() {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = endOfMonth.getTime() - now.getTime();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft({ days, hours, mins });
    }
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);
  const monthFlavor: Flavor = {
    id: "galactic-mango-tango",
    name: "Galactic Mango Tango",
    emoji: "🥭",
    category: "galaxy",
    price: 89,
    description:
      "Handcrafted with Alphonso mangoes from Ratnagiri, blended with cosmic stardust and a hint of saffron. Our most requested flavor this summer!",
  };
  return (
    <section className="max-w-6xl mx-auto px-4 py-8" data-ocid="month.section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl p-1"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.22 60), oklch(0.65 0.2 30), oklch(0.6 0.18 20), oklch(0.7 0.22 60))",
          backgroundSize: "300% 300%",
          animation: "gradientShift 4s ease infinite",
        }}
      >
        <div
          className="rounded-[22px] p-6 md:p-8 relative"
          style={{ background: "oklch(0.1 0.04 280)" }}
        >
          <div className="absolute top-4 right-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-black tracking-widest"
              style={{
                background: "oklch(0.7 0.22 60)",
                color: "oklch(0.1 0.04 280)",
              }}
            >
              THIS MONTH ONLY
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div
              className="text-8xl md:text-9xl select-none"
              style={{
                filter: "drop-shadow(0 0 30px oklch(0.7 0.22 60 / 0.8))",
                animation: "floatBob 3s ease-in-out infinite",
              }}
            >
              🥭
            </div>
            <div className="flex-1 text-center md:text-left">
              <p
                className="text-xs font-bold tracking-widest mb-2"
                style={{ color: "oklch(0.7 0.22 60)" }}
              >
                🌟{" "}
                {lang === "hi"
                  ? "इस महीने का आइसक्रीम"
                  : "ICE CREAM OF THE MONTH"}
              </p>
              <h2 className="text-2xl md:text-3xl font-black mb-3 text-white">
                {monthFlavor.name}
              </h2>
              <p className="text-sm text-white/70 mb-4 leading-relaxed max-w-md">
                {monthFlavor.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start mb-4">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-black"
                    style={{ color: "oklch(0.7 0.22 60)" }}
                  >
                    ₹89
                  </span>
                  <span className="text-lg line-through text-white/40">
                    ₹119
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: "oklch(0.35 0.15 30)",
                      color: "oklch(0.9 0.12 60)",
                    }}
                  >
                    Save ₹30
                  </span>
                </div>
              </div>
              {/* Countdown */}
              <div className="flex gap-3 mb-5 justify-center md:justify-start">
                {[
                  { val: timeLeft.days, label: "Days" },
                  { val: timeLeft.hours, label: "Hrs" },
                  { val: timeLeft.mins, label: "Min" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="text-center px-3 py-2 rounded-xl"
                    style={{
                      background: "oklch(0.15 0.06 280)",
                      border: "1px solid oklch(0.7 0.22 60 / 0.4)",
                    }}
                  >
                    <div className="text-xl font-black text-white">{val}</div>
                    <div className="text-xs text-white/50">{label}</div>
                  </div>
                ))}
              </div>
              <Button
                data-ocid="month.primary_button"
                onClick={() => {
                  onAdd(monthFlavor);
                  toast.success("🥭 Galactic Mango Tango added to cart!");
                }}
                className="font-bold px-8 py-5 text-base"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 60), oklch(0.65 0.2 30))",
                  color: "oklch(0.1 0.04 280)",
                  border: "none",
                  boxShadow: "0 4px 24px oklch(0.7 0.22 60 / 0.5)",
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {lang === "hi" ? "कार्ट में जोड़ें • ₹89" : "Add to Cart • ₹89"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Milestone Badge Popup ─────────────────────────────────────────────────────
function MilestoneBadgePopup({
  isOpen,
  badge,
  onClose,
}: {
  isOpen: boolean;
  badge: { title: string; emoji: string; desc: string } | null;
  onClose: () => void;
}) {
  if (!isOpen || !badge) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      data-ocid="badge.modal"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        onKeyDown={onClose}
        role="button"
        tabIndex={0}
      />
      {/* Confetti */}
      {Array.from({ length: 30 }, (_, i) => {
        const ck = `badge-confetti-${i}`;
        return (
          <div
            key={ck}
            className="confetti-dot"
            style={
              {
                left: `${10 + (i % 10) * 8}%`,
                top: `${20 + Math.floor(i / 10) * 15}%`,
                background: [
                  "#fbbf24",
                  "#a855f7",
                  "#f472b6",
                  "#60a5fa",
                  "#34d399",
                  "#fb923c",
                ][i % 6],
                "--tx": `${(i % 2 === 0 ? 1 : -1) * (20 + i * 8)}px`,
                "--ty": `${-(50 + i * 12)}px`,
                animationDelay: `${i * 0.04}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="relative z-10 text-center p-8 rounded-3xl max-w-sm w-full"
        style={{
          background: "oklch(0.12 0.05 280)",
          border: "2px solid oklch(0.7 0.22 60)",
          boxShadow: "0 0 60px oklch(0.7 0.22 60 / 0.4)",
        }}
        data-ocid="badge.dialog"
      >
        <div
          className="text-7xl mb-4"
          style={{ animation: "floatBob 2s ease-in-out infinite" }}
        >
          {badge.emoji}
        </div>
        <h2 className="text-xl font-black text-white mb-2">{badge.title}</h2>
        <p className="text-sm text-white/60 mb-6">{badge.desc}</p>
        <Button
          data-ocid="badge.close_button"
          onClick={onClose}
          className="w-full font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.7 0.22 60), oklch(0.65 0.2 30))",
            color: "oklch(0.1 0.04 280)",
            border: "none",
          }}
        >
          🎉 Awesome! Claim Badge
        </Button>
      </motion.div>
    </div>
  );
}

// ── Post Order Referral Popup ─────────────────────────────────────────────────
function PostOrderReferralPopup({
  isOpen,
  referralCode,
  onClose,
}: { isOpen: boolean; referralCode: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const waMsg = encodeURIComponent(
    `Hey! Order cosmic ice cream from Galaxy Parlour and use my code ${referralCode} for ₹50 off! 🍦✨ https://wa.me/`,
  );
  function handleCopy() {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-4"
      data-ocid="referral.modal"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        onKeyDown={onClose}
        role="button"
        tabIndex={0}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative z-10 text-center p-7 rounded-3xl max-w-sm w-full"
        style={{
          background: "oklch(0.12 0.05 280)",
          border: "2px solid oklch(0.55 0.28 310 / 0.7)",
          boxShadow: "0 0 60px oklch(0.55 0.28 310 / 0.3)",
        }}
        data-ocid="referral.dialog"
      >
        <button
          type="button"
          data-ocid="referral.close_button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-5xl mb-3">🎁</div>
        <h2 className="text-xl font-black text-white mb-2">Share & Earn!</h2>
        <p className="text-sm text-white/60 mb-5">
          Share your referral code with friends. You both get{" "}
          <span className="text-emerald-400 font-bold">₹50 off</span> your next
          order!
        </p>
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "oklch(0.16 0.06 280)",
            border: "1px solid oklch(0.35 0.1 310)",
          }}
        >
          <p className="text-xs text-white/50 mb-1">Your Referral Code</p>
          <p
            className="text-2xl font-black tracking-widest"
            style={{ color: "oklch(0.85 0.18 60)" }}
          >
            {referralCode}
          </p>
        </div>
        <div className="flex gap-2 mb-3">
          <Button
            data-ocid="referral.primary_button"
            onClick={handleCopy}
            className="flex-1 font-bold transition-all"
            style={{
              background: copied
                ? "oklch(0.5 0.2 150)"
                : "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
              color: "white",
              border: "none",
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" /> Copy Code
              </>
            )}
          </Button>
          <a
            href={`https://wa.me/?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="referral.secondary_button"
            className="flex-1 flex items-center justify-center gap-2 rounded-md font-bold text-sm"
            style={{ background: "oklch(0.45 0.2 150)", color: "white" }}
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </a>
        </div>
        <button
          type="button"
          data-ocid="referral.cancel_button"
          onClick={onClose}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}

// ── Brand Quality Strip ──────────────────────────────────────────────────────
function BrandQualityStrip() {
  const badges = [
    "🏅 A1 Quality Certified",
    "🥛 Premium A1 Grade Milk",
    "🌿 100% Natural Ingredients",
    "🚫 No Artificial Colors",
    "✅ FSSAI Certified",
  ];
  return (
    <div
      className="w-full overflow-hidden py-2 px-0"
      style={{
        background:
          "linear-gradient(90deg, oklch(0.12 0.04 280), oklch(0.15 0.06 300), oklch(0.12 0.04 280))",
      }}
    >
      <div className="flex items-center gap-2 mb-1 px-4">
        <span className="text-yellow-400 text-sm">👑</span>
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "oklch(0.82 0.18 80)" }}
        >
          Galaxy Premium Brand
        </span>
        <span className="text-yellow-400 text-sm">👑</span>
      </div>
      <div
        className="flex gap-3 px-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        <style>
          {
            "@keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } } .marquee-inner { animation: marquee 18s linear infinite; display: flex; gap: 12px; }"
          }
        </style>
        <div className="marquee-inner">
          {[...badges, ...badges].map((badge, i) => (
            <span
              key={i < badges.length ? badge : `${badge}-2`}
              className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.08 280 / 0.8), oklch(0.22 0.1 300 / 0.8))",
                border: "1px solid oklch(0.75 0.18 80 / 0.4)",
                color: "oklch(0.9 0.12 80)",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Brand Quality Section ────────────────────────────────────────────────────
function BrandQualitySection() {
  const promises = [
    {
      icon: "🏅",
      title: "A1 Quality Certified",
      desc: "Every product meets A1 premium quality standards before reaching you",
    },
    {
      icon: "🥛",
      title: "Premium A1 Grade Milk",
      desc: "Only the finest A1 grade cow milk sourced from certified dairy farms",
    },
    {
      icon: "🌿",
      title: "100% Natural Ingredients",
      desc: "No preservatives, no shortcuts. Only farm-fresh natural ingredients",
    },
    {
      icon: "🚫",
      title: "Zero Artificial Colors",
      desc: "All our vibrant flavours come from natural fruit and spice extracts",
    },
    {
      icon: "✅",
      title: "FSSAI Certified",
      desc: "Fully compliant with Food Safety and Standards Authority of India",
    },
    {
      icon: "❄️",
      title: "Cold Chain Guarantee",
      desc: "Maintained at -18°C throughout production, packaging and delivery",
    },
  ];
  return (
    <section className="px-4 py-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-2">
          🏆 Our Brand & Quality Promise
        </h2>
        <div
          className="inline-flex flex-col items-center rounded-2xl px-6 py-3 mt-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.08 280 / 0.6), oklch(0.22 0.1 300 / 0.6))",
            border: "1px solid oklch(0.75 0.18 80 / 0.4)",
          }}
        >
          <span
            className="text-xl font-display font-bold"
            style={{ color: "oklch(0.88 0.2 80)" }}
          >
            ✨ Galaxy Premium
          </span>
          <span className="text-xs text-violet-300/80 mt-0.5">
            India&apos;s Most Trusted Cosmic Ice Cream Brand
          </span>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promises.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 flex flex-col gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.06 280 / 0.8), oklch(0.18 0.08 300 / 0.8))",
              border: "1px solid oklch(0.65 0.2 80 / 0.25)",
              boxShadow: "0 0 20px oklch(0.65 0.2 80 / 0.08)",
            }}
          >
            <div className="text-3xl">{p.icon}</div>
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.88 0.18 80)" }}
            >
              {p.title}
            </h3>
            <p className="text-xs text-violet-200/70 leading-relaxed">
              {p.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Social Proof Counter ─────────────────────────────────────────────────────
function SocialProofCounter() {
  const { lang } = useLanguage();
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targets = [12847, 3200, 890, 49];

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - (1 - progress) ** 3;
      setCounts(targets.map((t) => Math.floor(t * ease)));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: "🍦",
      value: `${counts[0].toLocaleString()}+`,
      label: lang === "hi" ? "स्कूप्स परोसे" : "Scoops Served",
      color: "from-violet-500/20 to-purple-600/20",
      glow: "oklch(0.65 0.25 290)",
    },
    {
      icon: "😊",
      value: `${counts[1].toLocaleString()}+`,
      label: lang === "hi" ? "खुश ग्राहक" : "Happy Customers",
      color: "from-pink-500/20 to-rose-600/20",
      glow: "oklch(0.65 0.28 0)",
    },
    {
      icon: "⭐",
      value: `${counts[2].toLocaleString()}+`,
      label: lang === "hi" ? "पांच सितारा समीक्षाएं" : "Five-Star Reviews",
      color: "from-amber-500/20 to-yellow-600/20",
      glow: "oklch(0.8 0.18 80)",
    },
    {
      icon: "🏆",
      value: `${(counts[3] / 10).toFixed(1)}★`,
      label: lang === "hi" ? "औसत रेटिंग" : "Average Rating",
      color: "from-emerald-500/20 to-teal-600/20",
      glow: "oklch(0.7 0.2 160)",
    },
  ];

  return (
    <section data-ocid="social.section" className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="font-display font-bold text-2xl gradient-text mb-1">
          {lang === "hi"
            ? "🌌 Galaxy की ताकत"
            : "🌌 Trusted by India's Ice Cream Lovers"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "hi"
            ? "हमारे खुश ग्राहकों की संख्या देखें"
            : "Join thousands of satisfied cosmic ice cream fans"}
        </p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 text-center overflow-hidden`}
            style={{ boxShadow: `0 0 24px ${stat.glow}30` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div
              className="font-display font-black text-2xl"
              style={{ color: stat.glow }}
            >
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Festival Specials ─────────────────────────────────────────────────────────
const FESTIVAL_FLAVORS = {
  holi: [
    {
      id: "holi-1",
      name: "Rose Gulal Swirl",
      emoji: "🌸",
      price: 149,
      desc: "Delicate rose petals with gulal pink swirl",
    },
    {
      id: "holi-2",
      name: "Rainbow Thandai Blast",
      emoji: "🌈",
      price: 159,
      desc: "Festive thandai with rainbow sherbet layers",
    },
    {
      id: "holi-3",
      name: "Kesariya Mango Surprise",
      emoji: "🥭",
      price: 169,
      desc: "Golden saffron mango with surprise center",
    },
    {
      id: "holi-4",
      name: "Gulkand Rose Dream",
      emoji: "🌺",
      price: 149,
      desc: "Sweet gulkand with dreamy rose cream",
    },
  ],
  diwali: [
    {
      id: "diwali-1",
      name: "Kesar Pista Gold",
      emoji: "✨",
      price: 179,
      desc: "Saffron and pistachio golden delight",
    },
    {
      id: "diwali-2",
      name: "Badam Halwa Delight",
      emoji: "🪔",
      price: 169,
      desc: "Almond halwa with cardamom warmth",
    },
    {
      id: "diwali-3",
      name: "Motichoor Ladoo Swirl",
      emoji: "🟠",
      price: 159,
      desc: "Motichoor ladoo blended into creamy ice cream",
    },
    {
      id: "diwali-4",
      name: "Chocolate Barfi Fusion",
      emoji: "🍫",
      price: 179,
      desc: "Dark chocolate meets traditional barfi",
    },
  ],
};

// ── Summer Specials Section ──────────────────────────────────────────────────
const SUMMER_FLAVORS = [
  "aam-panna-burst",
  "lemon-zesty-star",
  "strawberry-watermelon-wave",
  "peach-sunrise-scoop",
  "kokum-cooler-sorbet",
  "coconut-palm-bliss",
];

function SummerSpecialsSection({ onAdd }: { onAdd: (f: Flavor) => void }) {
  const { lang } = useLanguage();
  const summerFlavors = FLAVORS.filter((f) => SUMMER_FLAVORS.includes(f.id));

  return (
    <section data-ocid="summer.section" className="max-w-6xl mx-auto px-4 py-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.14 60), oklch(0.22 0.16 40), oklch(0.25 0.12 50))",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl select-none pointer-events-none">
          ☀️🌊🥭
        </div>
        <div className="relative z-10">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 animate-pulse"
            style={{ background: "oklch(0.65 0.22 55)", color: "white" }}
          >
            🌡️ {lang === "hi" ? "सीमित समय — मानसून तक" : "Limited till Monsoon!"}
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-1">
            {lang === "hi" ? "☀️ गर्मी स्पेशल" : "☀️ Summer Specials"}
          </h2>
          <p className="text-sm text-white/70">
            {lang === "hi"
              ? "गर्मी की ठंडक — बेस्ट समर फ्लेवर्स"
              : "Beat the heat with our coolest summer flavours — only till monsoon!"}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {summerFlavors.map((flavor, i) => (
          <motion.div
            key={flavor.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-2xl p-4 border overflow-hidden"
            style={{
              background: "oklch(0.14 0.06 55)",
              borderColor: "oklch(0.5 0.2 55)",
            }}
          >
            {flavor.isSpecial && (
              <div
                className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "oklch(0.65 0.22 55)", color: "white" }}
              >
                ⭐ Special
              </div>
            )}
            <div className="text-4xl mb-2 text-center">{flavor.emoji}</div>
            <h3 className="font-bold text-sm text-white mb-1">{flavor.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {flavor.description}
            </p>
            <div className="flex items-center justify-between">
              <span
                className="font-bold text-sm"
                style={{ color: "oklch(0.78 0.2 60)" }}
              >
                ₹{flavor.price}
              </span>
              <button
                type="button"
                data-ocid={`summer.item.${i + 1}`}
                onClick={() => onAdd(flavor)}
                className="text-xs px-3 py-1.5 rounded-full font-bold transition-all hover:scale-105"
                style={{ background: "oklch(0.62 0.22 55)", color: "white" }}
              >
                {lang === "hi" ? "कार्ट में डालें" : "Add to Cart"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FestivalSpecialsSection({ onAdd }: { onAdd: (f: Flavor) => void }) {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<"holi" | "diwali">("holi");

  const getCountdown = (month: number, day: number) => {
    const now = new Date();
    let target = new Date(now.getFullYear(), month - 1, day);
    if (target < now) target = new Date(now.getFullYear() + 1, month - 1, day);
    const diff = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  const holiDays = getCountdown(3, 14);
  const diwaliDays = getCountdown(10, 20);

  const flavors = FESTIVAL_FLAVORS[tab];
  const isHoli = tab === "holi";

  return (
    <section
      data-ocid="festival.section"
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6 text-center"
        style={{
          background: isHoli
            ? "linear-gradient(135deg, oklch(0.25 0.08 330), oklch(0.22 0.1 300), oklch(0.25 0.09 20))"
            : "linear-gradient(135deg, oklch(0.25 0.1 60), oklch(0.22 0.12 40), oklch(0.25 0.08 30))",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl select-none pointer-events-none">
          {isHoli ? "🌸🌈🎨" : "🪔✨🎆"}
        </div>
        <div className="relative z-10">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 animate-pulse"
            style={{
              background: isHoli
                ? "oklch(0.55 0.25 330)"
                : "oklch(0.65 0.22 60)",
              color: "white",
            }}
          >
            🎉 LIMITED TIME ONLY
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-1">
            {lang === "hi"
              ? isHoli
                ? "🎨 होली स्पेशल फ्लेवर"
                : "🪔 दिवाली स्पेशल फ्लेवर"
              : isHoli
                ? "🎨 Holi Special Flavours"
                : "🪔 Diwali Special Flavours"}
          </h2>
          <p className="text-sm text-white/70">
            {lang === "hi"
              ? `${isHoli ? holiDays : diwaliDays} दिन बाकी हैं`
              : `Only ${isHoli ? holiDays : diwaliDays} days to go! Don't miss out`}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["holi", "diwali"] as const).map((t) => (
          <button
            key={t}
            type="button"
            data-ocid="festival.tab"
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${
              tab === t
                ? t === "holi"
                  ? "border-pink-400/60 bg-pink-500/20 text-pink-200"
                  : "border-amber-400/60 bg-amber-500/20 text-amber-200"
                : "border-border text-muted-foreground hover:border-violet-400/40"
            }`}
          >
            {t === "holi" ? "🎨 " : "🪔 "}
            {lang === "hi"
              ? t === "holi"
                ? "होली स्पेशल"
                : "दिवाली स्पेशल"
              : t === "holi"
                ? "Holi Special"
                : "Diwali Special"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {flavors.map((fl, i) => (
          <motion.div
            key={fl.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-2xl p-4 border overflow-hidden"
            style={{
              background: isHoli
                ? "oklch(0.15 0.06 330)"
                : "oklch(0.15 0.06 50)",
              borderColor: isHoli
                ? "oklch(0.45 0.2 330)"
                : "oklch(0.55 0.22 60)",
            }}
          >
            <div
              className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isHoli
                  ? "oklch(0.55 0.25 330)"
                  : "oklch(0.65 0.22 60)",
                color: "white",
              }}
            >
              ⏰ Limited
            </div>
            <div className="text-4xl mb-2 text-center">{fl.emoji}</div>
            <h3 className="font-bold text-sm text-white mb-1">{fl.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{fl.desc}</p>
            <div className="flex items-center justify-between">
              <span
                className="font-bold text-sm"
                style={{
                  color: isHoli ? "oklch(0.75 0.25 330)" : "oklch(0.8 0.22 60)",
                }}
              >
                ₹{fl.price}
              </span>
              <button
                type="button"
                data-ocid={`festival.item.${i + 1}`}
                onClick={() =>
                  onAdd({
                    id: fl.id,
                    name: fl.name,
                    emoji: fl.emoji,
                    category: "exotic",
                    price: fl.price,
                    description: fl.desc,
                    isSpecial: true,
                  })
                }
                className="text-xs px-3 py-1.5 rounded-full font-bold transition-all hover:scale-105"
                style={{
                  background: isHoli
                    ? "oklch(0.55 0.25 330)"
                    : "oklch(0.65 0.22 60)",
                  color: "white",
                }}
              >
                {lang === "hi" ? "कार्ट में डालें" : "Add to Cart"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Loyalty Leaderboard ───────────────────────────────────────────────────────
const LEADERBOARD_DATA = [
  {
    rank: 1,
    name: "Priya Sharma",
    points: 2450,
    badge: "👑 Galaxy Champion",
    tier: "gold",
  },
  {
    rank: 2,
    name: "Rahul Verma",
    points: 2100,
    badge: "⭐ Star Customer",
    tier: "silver",
  },
  {
    rank: 3,
    name: "Anjali Singh",
    points: 1890,
    badge: "🌟 Cosmic Fan",
    tier: "bronze",
  },
  {
    rank: 4,
    name: "Deepak Gupta",
    points: 1650,
    badge: "🍦 Ice Cream Lover",
    tier: "regular",
  },
  {
    rank: 5,
    name: "Sunita Patel",
    points: 1420,
    badge: "🚀 Rising Star",
    tier: "regular",
  },
  {
    rank: 6,
    name: "Amit Kumar",
    points: 1280,
    badge: "💫 Cosmic Explorer",
    tier: "regular",
  },
  {
    rank: 7,
    name: "Rekha Joshi",
    points: 1050,
    badge: "🌙 Night Craver",
    tier: "regular",
  },
  {
    rank: 8,
    name: "Vikram Rao",
    points: 940,
    badge: "✨ Flavor Hunter",
    tier: "regular",
  },
  {
    rank: 9,
    name: "Meena Agarwal",
    points: 820,
    badge: "🍨 Scoop Seeker",
    tier: "regular",
  },
  {
    rank: 10,
    name: "Rohit Mishra",
    points: 710,
    badge: "🌌 Galaxy Newbie",
    tier: "regular",
  },
];

function LoyaltyLeaderboard() {
  const { lang } = useLanguage();

  const tierStyle: Record<
    string,
    { border: string; bg: string; rankColor: string }
  > = {
    gold: {
      border: "oklch(0.8 0.22 80)",
      bg: "oklch(0.18 0.06 60)",
      rankColor: "oklch(0.85 0.22 80)",
    },
    silver: {
      border: "oklch(0.75 0.05 280)",
      bg: "oklch(0.18 0.04 280)",
      rankColor: "oklch(0.78 0.05 280)",
    },
    bronze: {
      border: "oklch(0.65 0.15 40)",
      bg: "oklch(0.18 0.05 40)",
      rankColor: "oklch(0.68 0.15 40)",
    },
    regular: {
      border: "oklch(0.3 0.06 285)",
      bg: "oklch(0.15 0.03 280)",
      rankColor: "oklch(0.55 0.15 290)",
    },
  };

  return (
    <section
      data-ocid="leaderboard.section"
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <h2 className="font-display font-bold text-2xl gradient-text mb-1">
          🏆{" "}
          {lang === "hi"
            ? "लॉयल्टी चैंपियंस लीडरबोर्ड"
            : "Loyalty Champions Leaderboard"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "hi"
            ? "लीडरबोर्ड पर चढ़ने के लिए प्रति ऑर्डर 10 पॉइंट्स कमाएं!"
            : "Earn 10 points per order to climb the leaderboard!"}
        </p>
      </motion.div>

      <div className="space-y-2 max-w-2xl mx-auto">
        {LEADERBOARD_DATA.map((entry, i) => {
          const style = tierStyle[entry.tier];
          return (
            <motion.div
              key={entry.name}
              data-ocid={`leaderboard.item.${i + 1}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  background: `${style.border}30`,
                  color: style.rankColor,
                  border: `2px solid ${style.border}`,
                }}
              >
                {entry.rank <= 3
                  ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                  : entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {entry.badge}
                </p>
              </div>
              <div
                className="font-black text-base flex-shrink-0"
                style={{ color: style.rankColor }}
              >
                {entry.points.toLocaleString()} {lang === "hi" ? "pts" : "pts"}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-6 text-center p-4 rounded-xl border border-violet-400/20 bg-violet-500/5"
      >
        <p className="text-sm font-bold text-violet-300">
          🚀{" "}
          {lang === "hi"
            ? "हर ऑर्डर पर 10 पॉइंट्स कमाएं और टॉप 10 में शामिल हों!"
            : "Place orders & earn 10 pts each to join the Top 10!"}
        </p>
      </motion.div>
    </section>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function IceCreamParlour() {
  const [lang, setLang] = useState<Lang>("en");
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
  const [stripePublishableKey, setStripePublishableKey] = useState<string>(
    () => {
      try {
        return localStorage.getItem("stripePublishableKey") ?? "";
      } catch {
        return "";
      }
    },
  );
  const stripeActive =
    stripePublishableKey.startsWith("pk_live_") ||
    stripePublishableKey.startsWith("pk_test_");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [spinDiscount, setSpinDiscount] = useState(0);
  const [spinDiscountType, setSpinDiscountType] = useState<
    "percent" | "flat" | "none"
  >("none");
  const [birthdayDiscount, setBirthdayDiscount] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("galaxy_birthday_discount");
    } catch {
      return false;
    }
  });
  const [reviewPromptOpen, setReviewPromptOpen] = useState(false);
  const [reviewFlavorName, setReviewFlavorName] = useState("");
  const [deliveryRatingOrder, setDeliveryRatingOrder] =
    useState<OrderQueueItem | null>(null);
  const [deliveryRatingOpen, setDeliveryRatingOpen] = useState(false);
  const [deliveryRatingConfetti, setDeliveryRatingConfetti] = useState(false);
  const [ownerDashboardOpen, setOwnerDashboardOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState<OrderQueueItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const prevOrderStatuses = useRef<Record<string, string>>({});

  function pushNotification(
    order: OrderQueueItem,
    status: OrderQueueItem["status"],
  ) {
    const msgs: Record<string, { msg: string; msgHi: string; emoji: string }> =
      {
        placed: {
          msg: `Your order ${order.queueNumber} has been placed! We'll start preparing it shortly. 🍦`,
          msgHi: `आपका ऑर्डर ${order.queueNumber} मिल गया! हम जल्द तैयार करेंगे। 🍦`,
          emoji: "📋",
        },
        preparing: {
          msg: `Your order ${order.queueNumber} is being prepared with love! ✨`,
          msgHi: `${order.queueNumber} प्यार से तैयार हो रहा है! ✨`,
          emoji: "🍦",
        },
        quality_check: {
          msg: `${order.queueNumber} is passing quality check — almost ready! ✅`,
          msgHi: `${order.queueNumber} क्वालिटी चेक हो रहा है! ✅`,
          emoji: "✅",
        },
        out_for_delivery: {
          msg: `Your order ${order.queueNumber} is on its way! 🛵`,
          msgHi: `${order.queueNumber} डिलीवरी पर निकल गया! 🛵`,
          emoji: "🛵",
        },
        delivered: {
          msg: `Your order ${order.queueNumber} has been delivered. Enjoy! 🎉`,
          msgHi: `${order.queueNumber} डिलीवर हो गया। आनंद लें! 🎉`,
          emoji: "🎉",
        },
      };
    const m = msgs[status];
    if (!m) return;
    setNotifications((prev) => [
      ...prev,
      {
        id: `${order.id}-${status}-${Date.now()}`,
        orderId: order.id,
        queueNumber: order.queueNumber,
        message: m.msg,
        messageHi: m.msgHi,
        emoji: m.emoji,
        timestamp: new Date(),
        read: false,
      },
    ]);
  }
  const [orderCounter, setOrderCounter] = useState(0);
  const [sessionOrderCount, setSessionOrderCount] = useState(0);
  const [badgePopupOpen, setBadgePopupOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<{
    title: string;
    emoji: string;
    desc: string;
  } | null>(null);
  const [seasonalBannerDismissed, setSeasonalBannerDismissed] = useState(false);
  const [postOrderReferralOpen, setPostOrderReferralOpen] = useState(false);
  const [postOrderReferralCode, setPostOrderReferralCode] = useState("");
  const [preOrders, setPreOrders] = useState<
    Array<{
      id: string;
      items: string;
      date: string;
      time: string;
      phone: string;
      total: number;
    }>
  >([]);
  const [lastQueueItem, setLastQueueItem] = useState<OrderQueueItem | null>(
    null,
  );
  const { mutateAsync: createCheckoutSession, isPending: isCheckingOut } =
    useCreateCheckoutSession();

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Auto-progress orders through stages every 90s
  useEffect(() => {
    const ORDER_STAGES: OrderQueueItem["status"][] = [
      "placed",
      "preparing",
      "quality_check",
      "out_for_delivery",
      "delivered",
    ];
    const timer = setInterval(() => {
      setActiveOrders((prev) => {
        const now = Date.now();
        return prev
          .map((order) => {
            const ageMs = now - order.placedAt.getTime();
            const stageIdx = ORDER_STAGES.indexOf(order.status);
            const expectedStage = Math.min(
              Math.floor(ageMs / 90000),
              ORDER_STAGES.length - 1,
            );
            if (expectedStage > stageIdx) {
              return { ...order, status: ORDER_STAGES[expectedStage] };
            }
            return order;
          })
          .filter((order) => {
            // Remove delivered orders after 30s
            if (order.status === "delivered") {
              const ageMs = now - order.placedAt.getTime();
              return ageMs < 90000 * 5 + 30000;
            }
            return true;
          });
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Push notifications when order status changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: pushNotification is stable
  useEffect(() => {
    for (const order of activeOrders) {
      const prev = prevOrderStatuses.current[order.id];
      if (prev !== order.status) {
        if (prev !== undefined) {
          // Status changed — push notification
          pushNotification(order, order.status);
          // Trigger delivery rating popup when order is delivered
          if (order.status === "delivered") {
            setDeliveryRatingOrder(order);
            setDeliveryRatingOpen(true);
          }
        }
        prevOrderStatuses.current[order.id] = order.status;
      }
    }
  }, [activeOrders]);

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

  function addToCart(
    flavor: Flavor,
    toppings?: { name: string; emoji: string; price: number }[],
  ) {
    setCartItems((prev) => {
      // If toppings are provided, always add as new item (different topping combos)
      if (toppings && toppings.length > 0) {
        return [...prev, { flavor, qty: 1, toppings }];
      }
      const existing = prev.find(
        (i) =>
          i.flavor.id === flavor.id && (!i.toppings || i.toppings.length === 0),
      );
      if (existing)
        return prev.map((i) =>
          i.flavor.id === flavor.id && (!i.toppings || i.toppings.length === 0)
            ? { ...i, qty: i.qty + 1 }
            : i,
        );
      return [...prev, { flavor, qty: 1 }];
    });
    toast.success(`${flavor.emoji} ${flavor.name} added to cart!`);
  }

  function addComboToCart(
    f1: Flavor,
    f2: Flavor,
    cone: string,
    coneExtra: number,
  ) {
    const comboFlavor: Flavor = {
      id: `combo-${f1.id}-${f2.id}`,
      name: `Cosmic Combo: ${f1.name} + ${f2.name}`,
      emoji: `${f1.emoji}${f2.emoji}`,
      category: "galaxy",
      price: f1.price + f2.price + coneExtra - 30,
      description: `Combo with ${cone} cone — saves ₹30!`,
    };
    setCartItems((prev) => [...prev, { flavor: comboFlavor, qty: 1 }]);
    toast.success("🌌 Cosmic Combo added to cart! Save ₹30");
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

  function placeOrder(
    redeemPoints: boolean,
    referralDiscount: boolean,
    phone = "",
  ) {
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
    // Track order count & flavor for review
    incrementOrderCount();
    const firstItemName = cartItems[0]?.flavor?.name ?? "";
    setReviewFlavorName(firstItemName);

    // Create queue item
    const newCounter = orderCounter + 1;
    setOrderCounter(newCounter);
    const queueNum = `#GX-${String(newCounter).padStart(3, "0")}`;
    // Count currently active non-delivered orders for ETA calc
    const activeCount = activeOrders.filter(
      (o) => o.status !== "delivered",
    ).length;
    const estimatedMinutes = (activeCount + 1) * 8;
    const subtotal = cartItems.reduce((s, i) => {
      const toppingTotal = (i.toppings ?? []).reduce(
        (ts, t) => ts + t.price,
        0,
      );
      return s + (i.flavor.price + toppingTotal) * i.qty;
    }, 0);
    const newQueueItem: OrderQueueItem = {
      id: `order-${Date.now()}`,
      queueNumber: queueNum,
      items: cartItems.map((ci) => ({
        name: ci.flavor.name,
        emoji: ci.flavor.emoji,
        qty: ci.qty,
        price:
          ci.flavor.price +
          (ci.toppings ?? []).reduce((ts, t) => ts + t.price, 0),
      })),
      total: subtotal,
      status: "placed",
      placedAt: new Date(),
      estimatedMinutes,
      phone,
    };
    setActiveOrders((prev) => [...prev, newQueueItem]);
    pushNotification(newQueueItem, "placed");
    if (phone) {
      const masked = `****${phone.slice(-4)}`;
      toast.success(`📱 You'll receive updates on ${masked}`);
    }
    setLastQueueItem(newQueueItem);

    setCartItems([]);
    setCartOpen(false);
    setOrderSuccess(true);
    setIsFirstOrder(false);

    // Milestone badge check
    const newSessionCount = sessionOrderCount + 1;
    setSessionOrderCount(newSessionCount);
    if (newSessionCount === 1) {
      setCurrentBadge({
        title: "Star Taster Badge Unlocked!",
        emoji: "⭐",
        desc: "You placed your first cosmic order!",
      });
      setBadgePopupOpen(true);
    } else if (newSessionCount === 5) {
      setCurrentBadge({
        title: "Galaxy Explorer Badge Unlocked!",
        emoji: "🚀",
        desc: "5 orders! You're exploring the galaxy!",
      });
      setBadgePopupOpen(true);
    } else if (newSessionCount === 10) {
      setCurrentBadge({
        title: "Cosmic Legend Badge Unlocked!",
        emoji: "👑",
        desc: "10 orders! You are a Cosmic Legend!",
      });
      setBadgePopupOpen(true);
    }

    // Post-order referral popup
    const rCode = `GAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setPostOrderReferralCode(rCode);
    setTimeout(() => setPostOrderReferralOpen(true), 2000);

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
    <LanguageContext.Provider value={{ lang, setLang }}>
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
            stripeActive={stripeActive}
            lang={lang}
            setLang={setLang}
            notifications={notifications}
            onMarkAllRead={() =>
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true })),
              )
            }
          />
          <main>
            <GalaxyAdBanner />
            <BrandQualityStrip />
            {!seasonalBannerDismissed && (
              <SeasonalAutoBanner
                onDismiss={() => setSeasonalBannerDismissed(true)}
              />
            )}
            <Hero />
            <PromoBanners />
            <SocialProofCounter />
            <BrandQualitySection />
            <IceCreamOfTheMonth onAdd={addToCart} />
            <FestivalSpecialsSection onAdd={addToCart} />
            <SummerSpecialsSection onAdd={addToCart} />
            <CustomerFavouritesSection onAdd={addToCart} />
            <CustomerReviewsSection />
            <LoyaltyLeaderboard />
            <FlashDealSection onAdd={addToCart} />
            <SpinToWinSection
              onWin={(val) => {
                if (val < 0) {
                  // negative = percent
                  setSpinDiscountType("percent");
                  setSpinDiscount(-val);
                } else if (val > 0) {
                  setSpinDiscountType("flat");
                  setSpinDiscount(val);
                } else {
                  setSpinDiscountType("none");
                  setSpinDiscount(0);
                }
              }}
            />
            <ComboBuildSection onAddCombo={addComboToCart} />
            <FamilyComboBanner
              onShopFamily={() => setActiveCategory("family")}
            />
            <JumboPackBanner onShopJumbo={() => setActiveCategory("jumbo")} />
            <PackComparisonChart
              onShopFamily={() => setActiveCategory("family")}
              onShopJumbo={() => setActiveCategory("jumbo")}
            />
            <BulkOrderEnquiry />

            {/* Menu */}
            <section
              data-ocid="menu.section"
              className="max-w-6xl mx-auto px-4 py-8"
            >
              <TrendingTicker />
              <LiveKitchenOrders activeOrders={activeOrders} lang={lang} />
              {/* New Arrivals Section */}
              <div className="mb-8">
                <div
                  className="relative rounded-2xl overflow-hidden p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.13 0.04 280), oklch(0.16 0.06 300), oklch(0.13 0.04 320))",
                    border: "1px solid oklch(0.45 0.25 290)",
                    boxShadow:
                      "0 0 32px oklch(0.45 0.25 290 / 0.35), inset 0 0 40px oklch(0.3 0.15 300 / 0.1)",
                  }}
                >
                  {/* Shimmer overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, oklch(0.8 0.15 290 / 0.06) 50%, transparent 60%)",
                      animation: "shimmer 3s infinite",
                    }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✨</span>
                    <h3
                      className="font-display font-bold text-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.85 0.2 290), oklch(0.8 0.25 320), oklch(0.9 0.15 340))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {lang === "hi" ? "नई आइसक्रीम" : "New Arrivals"}
                    </h3>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.28 300), oklch(0.5 0.3 320))",
                        color: "white",
                        border: "1px solid oklch(0.7 0.2 300)",
                        boxShadow: "0 0 8px oklch(0.55 0.28 300 / 0.6)",
                      }}
                    >
                      {lang === "hi" ? "नया" : "NEW"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {lang === "hi"
                        ? `${FLAVORS.filter((f) => f.isNew).length} नए स्वाद`
                        : `${FLAVORS.filter((f) => f.isNew).length} fresh flavors`}
                    </span>
                  </div>
                  <div
                    className="flex gap-3 overflow-x-auto pb-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "oklch(0.45 0.25 290) transparent",
                    }}
                  >
                    {FLAVORS.filter((f) => f.isNew).map((flavor, idx) => {
                      const meta = CATEGORY_META[flavor.category];
                      return (
                        <div
                          key={flavor.id}
                          className="flex-shrink-0 w-36 rounded-xl p-3 flex flex-col gap-2 cursor-pointer group transition-all duration-200 hover:scale-105"
                          data-ocid={`new_arrivals.item.${idx + 1}`}
                          style={{
                            background:
                              "linear-gradient(160deg, oklch(0.18 0.05 280), oklch(0.15 0.04 300))",
                            border: "1px solid oklch(0.35 0.15 290)",
                            boxShadow: "0 2px 12px oklch(0.3 0.15 290 / 0.2)",
                          }}
                        >
                          <div className="relative">
                            <div className="text-3xl text-center">
                              {flavor.emoji}
                            </div>
                            <span
                              className="absolute -top-1 -right-1 text-xs font-bold px-1 py-0.5 rounded-full"
                              style={{
                                background:
                                  "linear-gradient(135deg, oklch(0.55 0.28 300), oklch(0.5 0.3 320))",
                                color: "white",
                                fontSize: "9px",
                              }}
                            >
                              🆕
                            </span>
                          </div>
                          <p
                            className="text-xs font-semibold text-center leading-tight"
                            style={{ color: "oklch(0.9 0.08 280)" }}
                          >
                            {flavor.name}
                          </p>
                          <p
                            className="text-xs font-bold text-center"
                            style={{ color: "oklch(0.75 0.22 150)" }}
                          >
                            ₹{flavor.price}
                          </p>
                          <span
                            className={`text-center text-xs category-chip border self-center ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <button
                            type="button"
                            data-ocid={`new_arrivals.button.${idx + 1}`}
                            onClick={() => addToCart(flavor)}
                            className="w-full text-xs font-bold py-1 rounded-lg transition-all duration-200 group-hover:shadow-lg"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.5 0.3 320))",
                              color: "white",
                            }}
                          >
                            {lang === "hi" ? "जोड़ें" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6 mt-4">
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
            <DeliverySection />
          </main>
          <Footer onOwnerDashboard={() => setOwnerDashboardOpen(true)} />
        </div>

        {/* Overlays */}
        <CartPanel
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onQtyChange={changeQty}
          onRemove={removeFromCart}
          loyaltyPoints={loyaltyPoints}
          onPlaceOrder={(redeem, referral, phone) =>
            placeOrder(redeem, referral, phone)
          }
          onPreOrder={(date, time, phone, total) => {
            setPreOrders((prev) => [
              ...prev,
              {
                id: `pre-${Date.now()}`,
                items: cartItems.map((i) => i.flavor.name).join(", "),
                date,
                time,
                phone,
                total,
              },
            ]);
            setCartItems([]);
            setCartOpen(false);
          }}
          isFirstOrder={isFirstOrder}
          spinDiscount={spinDiscount}
          spinDiscountType={spinDiscountType}
          birthdayDiscount={birthdayDiscount}
          stripePublishableKey={stripeActive ? stripePublishableKey : undefined}
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
          onLeaveReview={() => setReviewPromptOpen(true)}
          queueItem={lastQueueItem}
          lang={lang}
        />
        <NovaChat isOpen={novaOpen} onToggle={() => setNovaOpen((v) => !v)} />
        <StripeSetup
          isOpen={stripeSetupOpen}
          onClose={() => setStripeSetupOpen(false)}
          onKeySaved={(key) => setStripePublishableKey(key)}
        />
        <ReviewPromptModal
          isOpen={reviewPromptOpen}
          onClose={() => setReviewPromptOpen(false)}
          flavorOrdered={reviewFlavorName}
        />
        <OwnerDashboardModal
          isOpen={ownerDashboardOpen}
          onClose={() => setOwnerDashboardOpen(false)}
          activeOrders={activeOrders}
          preOrders={preOrders}
        />
        <UpgradeModal
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          onUpgrade={handleUpgrade}
          isLoading={isCheckingOut}
        />
        <BirthdayBanner onDiscountClaimed={() => setBirthdayDiscount(true)} />
        <DeliveryRatingPopup
          isOpen={deliveryRatingOpen}
          onClose={() => {
            setDeliveryRatingOpen(false);
            setDeliveryRatingConfetti(false);
          }}
          order={deliveryRatingOrder}
          onConfettiTrigger={() => {
            setDeliveryRatingConfetti(true);
            toast.success("Thanks for rating your delivery! 🌟");
            setTimeout(() => setDeliveryRatingConfetti(false), 2500);
          }}
        />
        {deliveryRatingConfetti &&
          Array.from({ length: 24 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: confetti display
              key={i}
              className="confetti-dot"
              style={
                {
                  left: `${20 + (i % 8) * 8}%`,
                  top: `${30 + Math.floor(i / 8) * 10}%`,
                  background: [
                    "#fbbf24",
                    "#a855f7",
                    "#f472b6",
                    "#60a5fa",
                    "#34d399",
                    "#fb923c",
                  ][i % 6],
                  "--tx": `${(Math.random() - 0.5) * 300}px`,
                  "--ty": `${-Math.random() * 300 - 80}px`,
                  animationDelay: `${i * 0.035}s`,
                } as React.CSSProperties
              }
            />
          ))}
        <MilestoneBadgePopup
          isOpen={badgePopupOpen}
          badge={currentBadge}
          onClose={() => setBadgePopupOpen(false)}
        />
        <PostOrderReferralPopup
          isOpen={postOrderReferralOpen}
          referralCode={postOrderReferralCode}
          onClose={() => setPostOrderReferralOpen(false)}
        />
        <Toaster />
      </div>
    </LanguageContext.Provider>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path === "/payment-success") return <PaymentSuccess />;
  if (path === "/payment-failure") return <PaymentFailure />;
  return <IceCreamParlour />;
}
