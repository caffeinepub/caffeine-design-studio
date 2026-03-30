import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
// Local types matching backend.d.ts
export interface CustomerProfile {
  sessionKey: string;
  name: string;
  email: string;
  loyaltyPoints: bigint;
  totalOrders: bigint;
  referralCode: string;
  joinedAt: bigint;
}

export interface CustomerOrder {
  orderId: string;
  items: string;
  total: bigint;
  paymentMethod: string;
  timestamp: bigint;
}
import { useActor } from "./hooks/useActor";

// ── Helpers ────────────────────────────────────────────────────────────────
function generateSessionKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "GAL-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateReferralCode(name: string): string {
  const prefix = name
    .slice(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")
    .padEnd(4, "X");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `GAL-${prefix}${digits}`;
}

export function getLoyaltyTierFromPoints(pts: number) {
  if (pts >= 1000)
    return {
      name: "Diamond Universe",
      emoji: "💎",
      color: "oklch(0.82 0.12 220)",
    };
  if (pts >= 600)
    return {
      name: "Platinum Cosmic",
      emoji: "💎",
      color: "oklch(0.82 0.08 280)",
    };
  if (pts >= 300)
    return { name: "Gold Galaxy", emoji: "🥇", color: "oklch(0.82 0.18 80)" };
  if (pts >= 100)
    return { name: "Silver Nova", emoji: "🥈", color: "oklch(0.78 0.05 240)" };
  return { name: "Bronze Star", emoji: "🥉", color: "oklch(0.68 0.12 50)" };
}

// ── Context ────────────────────────────────────────────────────────────────
interface CustomerAccountContextValue {
  sessionKey: string | null;
  profile: CustomerProfile | null;
  isLoggedIn: boolean;
  openLoginModal: () => void;
  logout: () => void;
  refreshProfile: () => void;
  addOrderToBackend: (
    orderId: string,
    items: string,
    total: number,
    paymentMethod: string,
  ) => Promise<void>;
  redeemPointsOnBackend: (points: number) => Promise<boolean>;
}

const CustomerAccountContext = createContext<CustomerAccountContextValue>({
  sessionKey: null,
  profile: null,
  isLoggedIn: false,
  openLoginModal: () => {},
  logout: () => {},
  refreshProfile: () => {},
  addOrderToBackend: async () => {},
  redeemPointsOnBackend: async () => false,
});

export function useCustomerAccount() {
  return useContext(CustomerAccountContext);
}

// ── Provider ────────────────────────────────────────────────────────────────
export function CustomerAccountProvider({
  children,
  onProfileLoaded,
}: {
  children: React.ReactNode;
  onProfileLoaded?: (points: number) => void;
}) {
  const { actor } = useActor();
  const [sessionKey, setSessionKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem("galaxy_session_key");
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const onProfileLoadedRef = useRef(onProfileLoaded);
  onProfileLoadedRef.current = onProfileLoaded;

  const refreshProfile = useCallback(async () => {
    if (!actor || !sessionKey) return;
    try {
      const p = await (actor as any).getCustomerProfile(sessionKey);
      if (p) {
        setProfile(p);
        onProfileLoadedRef.current?.(Number(p.loyaltyPoints));
      }
    } catch {
      /* ignore */
    }
  }, [actor, sessionKey]);

  // Load profile when actor/sessionKey ready
  useEffect(() => {
    if (sessionKey && actor) {
      refreshProfile();
    }
  }, [sessionKey, actor, refreshProfile]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("galaxy_session_key");
      localStorage.removeItem("galaxy_customer_name");
      localStorage.removeItem("galaxy_customer_email");
    } catch {
      /* ignore */
    }
    setSessionKey(null);
    setProfile(null);
    toast.success("👋 Logged out from Galaxy account");
  }, []);

  const addOrderToBackend = useCallback(
    async (
      orderId: string,
      items: string,
      total: number,
      paymentMethod: string,
    ) => {
      if (!actor || !sessionKey) return;
      try {
        const updated = await (actor as any).addOrderToHistory(
          sessionKey,
          orderId,
          items,
          BigInt(Math.round(total)),
          paymentMethod,
        );
        setProfile(updated);
        onProfileLoadedRef.current?.(Number(updated.loyaltyPoints));
      } catch {
        /* ignore - order still placed locally */
      }
    },
    [actor, sessionKey],
  );

  const redeemPointsOnBackend = useCallback(
    async (points: number): Promise<boolean> => {
      if (!actor || !sessionKey) return false;
      try {
        const updated = await (actor as any).redeemLoyaltyPoints(
          sessionKey,
          BigInt(points),
        );
        setProfile(updated);
        onProfileLoadedRef.current?.(Number(updated.loyaltyPoints));
        return true;
      } catch {
        return false;
      }
    },
    [actor, sessionKey],
  );

  return (
    <CustomerAccountContext.Provider
      value={{
        sessionKey,
        profile,
        isLoggedIn: !!profile,
        openLoginModal: () => setLoginModalOpen(true),
        logout,
        refreshProfile,
        addOrderToBackend,
        redeemPointsOnBackend,
      }}
    >
      {children}
      <AccountLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        actor={actor}
        onSuccess={(key, p) => {
          setSessionKey(key);
          setProfile(p);
          try {
            localStorage.setItem("galaxy_session_key", key);
            localStorage.setItem("galaxy_customer_name", p.name);
            localStorage.setItem("galaxy_customer_email", p.email);
          } catch {
            /* ignore */
          }
          onProfileLoadedRef.current?.(Number(p.loyaltyPoints));
          setLoginModalOpen(false);
        }}
      />
    </CustomerAccountContext.Provider>
  );
}

// ── Login Modal ────────────────────────────────────────────────────────────
function AccountLoginModal({
  isOpen,
  onClose,
  actor,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  actor: any;
  onSuccess: (key: string, profile: CustomerProfile) => void;
}) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("galaxy_customer_name") ?? "";
    } catch {
      return "";
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("galaxy_customer_email") ?? "";
    } catch {
      return "";
    }
  });
  const [loading, setLoading] = useState(false);
  const [referredByCode, setReferredByCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email");
      return;
    }
    if (!actor) {
      toast.error("Connecting to server... please try again in a moment");
      return;
    }
    setLoading(true);
    try {
      let key = localStorage.getItem("galaxy_session_key");
      if (!key) key = generateSessionKey();
      const referralCode = generateReferralCode(name);
      const p = await (actor as any).registerCustomer(
        key,
        name.trim(),
        email.trim(),
        referralCode,
      );
      toast.success(`🌟 Welcome to Galaxy, ${p.name}!`);
      // Award 50 bonus points to the referrer if a referral code was provided
      const enteredCode = referredByCode.trim().toUpperCase();
      if (enteredCode && enteredCode !== referralCode) {
        try {
          const awarded = await (actor as any).awardReferralBonus(
            enteredCode,
            50,
          );
          if (awarded) {
            toast.success(
              "🎁 Your friend earned 50 bonus points for referring you!",
            );
          }
        } catch (_e) {
          // Silently ignore if referral bonus award fails
        }
      }
      onSuccess(key, p);
    } catch (_err) {
      toast.error("Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm border-violet-500/30"
        style={{ background: "oklch(0.09 0.03 280)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-2xl">🌌</span>
            <span
              className="block font-bold text-xl mt-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.18 80), oklch(0.78 0.2 310))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Galaxy Account
            </span>
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-xs text-violet-300/70 -mt-2 mb-4">
          Save your loyalty points, order history & referral code forever
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-ocid="account.modal"
        >
          <div className="space-y-1">
            <Label className="text-violet-300 text-xs">Your Name</Label>
            <Input
              data-ocid="account.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="border-violet-500/30 bg-violet-500/10 text-foreground placeholder:text-violet-400/40 focus:border-violet-400"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-violet-300 text-xs">Email Address</Label>
            <Input
              data-ocid="account.input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@gmail.com"
              className="border-violet-500/30 bg-violet-500/10 text-foreground placeholder:text-violet-400/40 focus:border-violet-400"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-violet-300 text-xs">
              Friend's Referral Code{" "}
              <span className="text-violet-400/50 font-normal">(optional)</span>
            </Label>
            <Input
              data-ocid="account.referral_input"
              value={referredByCode}
              onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
              placeholder="e.g. GAL-PREM1234"
              className="border-amber-500/30 bg-amber-500/10 text-foreground placeholder:text-amber-400/40 focus:border-amber-400"
            />
            <p className="text-[10px] text-amber-300/60">
              Your friend earns 50 bonus points when you sign up!
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            data-ocid="account.submit_button"
            className="w-full font-bold py-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
              border: "none",
              color: "white",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Saving...
              </span>
            ) : (
              "🌟 Create / Login to My Account"
            )}
          </Button>
        </form>
        <p className="text-center text-[10px] text-violet-400/50 mt-2">
          Your data is saved securely on the blockchain 🔒
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ── Profile Chip ────────────────────────────────────────────────────────────
export function AccountProfileChip({
  profile,
  onLogout,
  onOrderHistory,
}: {
  profile: CustomerProfile;
  onLogout: () => void;
  onOrderHistory: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pts = Number(profile.loyaltyPoints);
  const tier = getLoyaltyTierFromPoints(pts);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        data-ocid="account.open_modal_button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-400/40 bg-violet-500/15 text-violet-200 text-sm font-semibold hover:bg-violet-500/25 transition-colors"
      >
        <span>👤</span>
        <span className="hidden sm:inline max-w-[80px] truncate">
          {profile.name.split(" ")[0]}
        </span>
        <span className="text-amber-300">⭐ {pts}</span>
        <span className="text-xs opacity-75 hidden md:inline">
          {tier.emoji} {tier.name}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="account.dropdown_menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-72 rounded-2xl border border-violet-500/30 shadow-2xl z-50 overflow-hidden"
            style={{ background: "oklch(0.1 0.03 280)" }}
          >
            <div
              className="px-4 py-3 border-b border-violet-500/20"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.06 280 / 0.8), oklch(0.13 0.05 310 / 0.8))",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    background: "oklch(0.25 0.1 310)",
                    color: "oklch(0.9 0.15 310)",
                  }}
                >
                  {profile.name[0]?.toUpperCase() ?? "G"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-violet-100 text-sm truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-violet-400/70 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: "oklch(0.08 0.025 280 / 0.6)" }}
              >
                <div className="text-center">
                  <p className="text-amber-300 font-black text-lg leading-none">
                    {pts}
                  </p>
                  <p className="text-[10px] text-violet-400/60">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-violet-200 font-black text-lg leading-none">
                    {Number(profile.totalOrders)}
                  </p>
                  <p className="text-[10px] text-violet-400/60">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-lg leading-none">{tier.emoji}</p>
                  <p className="text-[10px] text-violet-400/60">
                    {tier.name.split(" ")[0]}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-violet-400/50 mt-2 text-center">
                Referral:{" "}
                <span className="text-amber-300/80 font-mono">
                  {profile.referralCode}
                </span>
              </p>
            </div>
            <div className="p-2 space-y-1">
              <button
                type="button"
                data-ocid="account.order_history_button"
                onClick={() => {
                  onOrderHistory();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-violet-200 text-sm hover:bg-violet-500/15 transition-colors text-left"
              >
                <span>📋</span> My Order History
              </button>
              <button
                type="button"
                data-ocid="account.logout_button"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors text-left"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Order History Modal ────────────────────────────────────────────────────
export function OrderHistoryModal({
  isOpen,
  onClose,
  sessionKey,
  actor,
}: {
  isOpen: boolean;
  onClose: () => void;
  sessionKey: string | null;
  actor: any;
}) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !sessionKey || !actor) return;
    setLoading(true);
    (actor as any)
      .getOrderHistory(sessionKey)
      .then((data: CustomerOrder[]) => {
        setOrders([...data].reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, sessionKey, actor]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg border-violet-500/30"
        style={{ background: "oklch(0.09 0.03 280)" }}
        data-ocid="order_history.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            <span
              className="font-bold text-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.18 80), oklch(0.78 0.2 310))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📋 My Order History
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div
            className="text-center py-10"
            data-ocid="order_history.loading_state"
          >
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="text-violet-400/60 mt-2 text-sm">
              Loading your cosmic orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div
            className="text-center py-10"
            data-ocid="order_history.empty_state"
          >
            <span className="text-4xl">🍦</span>
            <p className="text-violet-400/60 mt-2 text-sm">
              No orders yet. Place your first cosmic order!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-2">
              {orders.map((order, i) => (
                <motion.div
                  key={order.orderId}
                  data-ocid={`order_history.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-violet-500/20"
                  style={{ background: "oklch(0.12 0.03 280)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: "oklch(0.82 0.18 80)" }}
                        >
                          {order.orderId}
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              order.paymentMethod === "cod"
                                ? "oklch(0.55 0.22 60 / 0.2)"
                                : "oklch(0.55 0.28 310 / 0.2)",
                            color:
                              order.paymentMethod === "cod"
                                ? "oklch(0.78 0.18 60)"
                                : "oklch(0.78 0.18 310)",
                          }}
                        >
                          {order.paymentMethod === "cod" ? "COD" : "Online"}
                        </span>
                      </div>
                      <p className="text-xs text-violet-300/80 leading-snug">
                        {order.items}
                      </p>
                      <p className="text-[10px] text-violet-400/50 mt-1">
                        {new Date(
                          Number(order.timestamp) / 1_000_000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-sm"
                        style={{ color: "oklch(0.82 0.18 80)" }}
                      >
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-emerald-400/70">+10 pts</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
        <button
          type="button"
          data-ocid="order_history.close_button"
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-xl border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-colors"
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}

// ── Account Button (for header when NOT logged in) ─────────────────────────
export function AccountLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-ocid="account.open_modal_button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-300 text-sm font-semibold hover:bg-violet-500/20 transition-colors"
    >
      👤 <span className="hidden sm:inline">Account</span>
    </button>
  );
}
