import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ActiveOrderQueueTable, type OrderQueueItem } from "./OrderQueue";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  flavorOrdered: string;
}

// ── LocalStorage helpers ───────────────────────────────────────────────────
export function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem("galaxy_reviews");
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

export function saveReview(review: Review): void {
  try {
    const existing = loadReviews();
    localStorage.setItem(
      "galaxy_reviews",
      JSON.stringify([review, ...existing]),
    );
  } catch {
    // ignore
  }
}

export function getOrderCount(): number {
  try {
    return Number.parseInt(
      localStorage.getItem("galaxy_order_count") ?? "0",
      10,
    );
  } catch {
    return 0;
  }
}

export function incrementOrderCount(): void {
  try {
    localStorage.setItem("galaxy_order_count", String(getOrderCount() + 1));
  } catch {
    // ignore
  }
}

// ── Star Rating Input ──────────────────────────────────────────────────────
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          data-ocid={`review.star.${star}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className="w-7 h-7"
            style={{
              fill:
                star <= (hovered || value)
                  ? "oklch(0.82 0.2 75)"
                  : "transparent",
              color:
                star <= (hovered || value)
                  ? "oklch(0.82 0.2 75)"
                  : "oklch(0.45 0.06 280)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ── Review Prompt Modal ────────────────────────────────────────────────────
interface ReviewPromptProps {
  isOpen: boolean;
  onClose: () => void;
  flavorOrdered: string;
}

export function ReviewPromptModal({
  isOpen,
  onClose,
  flavorOrdered,
}: ReviewPromptProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    const review: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      flavorOrdered,
    };
    saveReview(review);
    setSubmitted(true);
  }

  function handleClose() {
    setName("");
    setRating(0);
    setComment("");
    setSubmitted(false);
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="review.modal"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl p-7 border border-violet-400/40"
              style={{
                background: "oklch(0.1 0.03 280)",
                boxShadow: "0 0 80px oklch(0.55 0.28 310 / 0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg gradient-text">
                  ⭐ Rate Your Experience
                </h2>
                <button
                  type="button"
                  data-ocid="review.close_button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitted ? (
                <motion.div
                  data-ocid="review.success_state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-5xl mb-4">🥰</div>
                  <h3 className="font-display font-bold text-xl gradient-text mb-2">
                    Thank You!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your review means the world to us. We&apos;re over the moon!
                    🌌
                  </p>
                  <Button
                    data-ocid="review.confirm_button"
                    onClick={handleClose}
                    className="w-full font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
                      border: "none",
                      color: "white",
                    }}
                  >
                    Back to the Stars 🌟
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-violet-300/70">
                    You ordered:{" "}
                    <span className="text-violet-200 font-semibold">
                      {flavorOrdered || "a cosmic flavour"}
                    </span>
                  </p>

                  <div className="space-y-1.5">
                    <Label className="text-violet-200 text-xs">Your Name</Label>
                    <Input
                      data-ocid="review.input"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Priya S."
                      className="bg-white/5 border-violet-500/30 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-violet-200 text-xs">
                      Star Rating
                    </Label>
                    <StarRatingInput value={rating} onChange={setRating} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-violet-200 text-xs">
                      Comment{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      data-ocid="review.textarea"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your cosmic experience..."
                      rows={3}
                      className="bg-white/5 border-violet-500/30 text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>

                  {error && (
                    <p
                      data-ocid="review.error_state"
                      className="text-xs text-red-400"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      data-ocid="review.cancel_button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 border-border"
                    >
                      Skip
                    </Button>
                    <Button
                      data-ocid="review.submit_button"
                      onClick={handleSubmit}
                      className="flex-1 font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.3 280))",
                        border: "none",
                        color: "white",
                      }}
                    >
                      Submit Review ✨
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Star Display ───────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3.5 h-3.5"
          style={{
            fill: star <= rating ? "oklch(0.82 0.2 75)" : "transparent",
            color:
              star <= rating ? "oklch(0.82 0.2 75)" : "oklch(0.45 0.06 280)",
          }}
        />
      ))}
    </div>
  );
}

// ── Customer Reviews Section ───────────────────────────────────────────────
export function CustomerReviewsSection() {
  const reviews = loadReviews();
  const latest6 = reviews.slice(0, 6);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section
      data-ocid="reviews.section"
      className="max-w-6xl mx-auto px-4 py-10"
    >
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-3xl gradient-text mb-2">
          💬 What Our Customers Say
        </h2>
        {reviews.length > 0 ? (
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-5 h-5"
                  style={{
                    fill:
                      star <= Math.round(avg)
                        ? "oklch(0.82 0.2 75)"
                        : "transparent",
                    color:
                      star <= Math.round(avg)
                        ? "oklch(0.82 0.2 75)"
                        : "oklch(0.45 0.06 280)",
                  }}
                />
              ))}
            </div>
            <span className="text-amber-300 font-bold text-lg">
              {avg.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Be the first to share your cosmic experience!
          </p>
        )}
      </div>

      {latest6.length === 0 ? (
        <motion.div
          data-ocid="reviews.empty_state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border border-violet-400/20 rounded-2xl bg-violet-950/30"
        >
          <div className="text-5xl mb-4">🌌</div>
          <h3 className="font-display font-bold text-lg text-violet-200 mb-2">
            No reviews yet — the galaxy awaits!
          </h3>
          <p className="text-muted-foreground text-sm">
            Place an order and be the first cosmic reviewer.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest6.map((review, idx) => (
            <motion.div
              key={review.id}
              data-ocid={`reviews.item.${idx + 1}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              className="relative bg-violet-950/60 border border-violet-400/25 rounded-2xl p-5 flex flex-col gap-3 hover:border-violet-400/50 transition-colors"
            >
              {/* Glow accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.65 0.25 310 / 0.6), transparent)",
                }}
              />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.28 310), oklch(0.4 0.3 280))",
                      color: "white",
                    }}
                  >
                    {review.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-100">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-violet-200/80 leading-relaxed line-clamp-3">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
              {review.flavorOrdered && (
                <span className="text-xs text-violet-400/70 bg-violet-400/10 border border-violet-400/20 rounded-full px-2 py-0.5 self-start">
                  🍦 {review.flavorOrdered}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Stripe Status Card ──────────────────────────────────────────────────────
function StripeStatusCard() {
  const isActive = (() => {
    try {
      const key = localStorage.getItem("stripePublishableKey") ?? "";
      return key.startsWith("pk_live_") || key.startsWith("pk_test_");
    } catch {
      return false;
    }
  })();

  if (isActive) {
    return (
      <div
        data-ocid="dashboard.stripe.success_state"
        className="flex items-center gap-3 p-4 rounded-xl border border-emerald-400/30"
        style={{ background: "oklch(0.12 0.04 150)" }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-xl">
          ✅
        </div>
        <div>
          <p className="font-bold text-emerald-300 text-sm">Stripe Active</p>
          <p className="text-xs text-emerald-300/70">
            Real payments are enabled! Customers can pay with their debit/credit
            cards.
          </p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      data-ocid="dashboard.stripe.error_state"
      className="flex items-center gap-3 p-4 rounded-xl border border-amber-400/30"
      style={{ background: "oklch(0.12 0.04 80)" }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-xl">
        ⚠️
      </div>
      <div>
        <p className="font-bold text-amber-300 text-sm">Stripe Not Activated</p>
        <p className="text-xs text-amber-300/70">
          You are not receiving real payments. Click the ⚙️ gear icon in the
          header to add your Stripe Publishable Key.
        </p>
      </div>
    </div>
  );
}

// ── Owner Dashboard Modal ──────────────────────────────────────────────────
interface PreOrderItem {
  id: string;
  items: string;
  date: string;
  time: string;
  phone: string;
  total: number;
}

interface OwnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrders?: OrderQueueItem[];
  preOrders?: PreOrderItem[];
}

export function OwnerDashboardModal({
  isOpen,
  onClose,
  activeOrders = [],
  preOrders = [],
}: OwnerDashboardProps) {
  const reviews = loadReviews();
  const orderCount = getOrderCount();
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Star breakdown
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxStarCount = Math.max(...starCounts.map((s) => s.count), 1);

  // Top 3 most ordered flavors from reviews
  const flavorMap: Record<string, number> = {};
  for (const r of reviews) {
    if (r.flavorOrdered) {
      flavorMap[r.flavorOrdered] = (flavorMap[r.flavorOrdered] ?? 0) + 1;
    }
  }
  const top3Flavors = Object.entries(flavorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            data-ocid="dashboard.modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-violet-400/30 overflow-hidden"
              style={{
                background: "oklch(0.08 0.025 280)",
                boxShadow: "0 0 100px oklch(0.55 0.28 310 / 0.25)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-violet-400/20"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.15 0.05 280 / 0.8), oklch(0.12 0.04 310 / 0.8))",
                }}
              >
                <h2 className="font-display font-bold text-lg flex items-center gap-2 gradient-text">
                  <BarChart3 className="w-5 h-5" /> Owner Analytics Dashboard
                </h2>
                <button
                  type="button"
                  data-ocid="dashboard.close_button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ScrollArea className="h-[70vh]">
                <div className="p-6 space-y-6">
                  {/* Stripe Status Card */}
                  <StripeStatusCard />

                  {/* Active Order Queue */}
                  <div>
                    <h3 className="font-semibold text-sm text-violet-200 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      📋 Active Order Queue
                      <span className="ml-auto text-xs font-normal text-violet-400">
                        {activeOrders.length} orders
                      </span>
                    </h3>
                    <ActiveOrderQueueTable activeOrders={activeOrders} />
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-violet-950/60 border border-violet-400/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-violet-100">
                        {orderCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total Orders
                      </p>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-400/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-amber-300">
                        {reviews.length > 0 ? avg.toFixed(1) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg Rating
                      </p>
                    </div>
                    <div className="bg-pink-950/40 border border-pink-400/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-pink-300">
                        {reviews.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total Reviews
                      </p>
                    </div>
                  </div>

                  {/* Star breakdown */}
                  <div className="bg-violet-950/40 border border-violet-400/15 rounded-xl p-5">
                    <h3 className="font-semibold text-sm text-violet-200 mb-4">
                      ⭐ Rating Breakdown
                    </h3>
                    <div className="space-y-2">
                      {starCounts.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-amber-300 w-6 shrink-0">
                            {star}★
                          </span>
                          <div className="flex-1 bg-violet-900/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(count / maxStarCount) * 100}%`,
                              }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              className="h-full rounded-full"
                              style={{
                                background:
                                  "linear-gradient(90deg, oklch(0.82 0.2 75), oklch(0.75 0.22 60))",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top 3 flavors */}
                  {top3Flavors.length > 0 && (
                    <div className="bg-violet-950/40 border border-violet-400/15 rounded-xl p-5">
                      <h3 className="font-semibold text-sm text-violet-200 mb-4">
                        🏆 Top Ordered Flavors (from reviews)
                      </h3>
                      <div className="space-y-2">
                        {top3Flavors.map(([flavor, count], i) => (
                          <div key={flavor} className="flex items-center gap-3">
                            <span className="text-sm">
                              {["🥇", "🥈", "🥉"][i]}
                            </span>
                            <span className="flex-1 text-sm text-violet-100 truncate">
                              {flavor}
                            </span>
                            <span className="text-xs text-violet-400/70 bg-violet-400/10 px-2 py-0.5 rounded-full">
                              {count} order{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All reviews list */}
                  <div>
                    <h3 className="font-semibold text-sm text-violet-200 mb-4">
                      📝 All Customer Reviews
                    </h3>
                    {reviews.length === 0 ? (
                      <div
                        data-ocid="dashboard.empty_state"
                        className="text-center py-8 text-muted-foreground text-sm border border-violet-400/15 rounded-xl"
                      >
                        No reviews yet. They&apos;ll appear here after customers
                        rate their orders!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review, idx) => (
                          <div
                            key={review.id}
                            data-ocid={`dashboard.item.${idx + 1}`}
                            className="bg-violet-950/50 border border-violet-400/15 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, oklch(0.45 0.28 310), oklch(0.4 0.3 280))",
                                    color: "white",
                                  }}
                                >
                                  {review.name[0]?.toUpperCase() ?? "?"}
                                </div>
                                <span className="text-sm font-semibold text-violet-100">
                                  {review.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className="w-3 h-3"
                                      style={{
                                        fill:
                                          s <= review.rating
                                            ? "oklch(0.82 0.2 75)"
                                            : "transparent",
                                        color:
                                          s <= review.rating
                                            ? "oklch(0.82 0.2 75)"
                                            : "oklch(0.45 0.06 280)",
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                            {review.flavorOrdered && (
                              <p className="text-xs text-violet-400/60 mb-1">
                                🍦 {review.flavorOrdered}
                              </p>
                            )}
                            {review.comment && (
                              <p className="text-sm text-violet-200/70 leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Pre-Orders Section */}
                {preOrders.length > 0 && (
                  <div
                    className="mt-6 p-4 rounded-2xl"
                    style={{
                      background: "oklch(0.1 0.04 280)",
                      border: "1px solid oklch(0.3 0.08 240 / 0.5)",
                    }}
                  >
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                      📅 Pre-Orders ({preOrders.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-white/70">
                        <thead>
                          <tr className="text-white/40 border-b border-white/10">
                            <th className="text-left py-1.5">Date</th>
                            <th className="text-left py-1.5">Time</th>
                            <th className="text-left py-1.5">Items</th>
                            <th className="text-left py-1.5">Phone</th>
                            <th className="text-right py-1.5">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preOrders.map((po) => (
                            <tr key={po.id} className="border-b border-white/5">
                              <td className="py-1.5 text-violet-300">
                                {po.date}
                              </td>
                              <td className="py-1.5">{po.time}</td>
                              <td className="py-1.5 max-w-[120px] truncate">
                                {po.items}
                              </td>
                              <td className="py-1.5">
                                {po.phone ? `****${po.phone.slice(-4)}` : "—"}
                              </td>
                              <td
                                className="py-1.5 text-right font-bold"
                                style={{ color: "oklch(0.85 0.18 60)" }}
                              >
                                ₹{po.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Delivery Rating Popup ──────────────────────────────────────────────────
interface DeliveryRatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    queueNumber: string;
    items: { name: string; emoji: string; qty: number; price: number }[];
  } | null;
  onConfettiTrigger: () => void;
}

export function DeliveryRatingPopup({
  isOpen,
  onClose,
  order,
  onConfettiTrigger,
}: DeliveryRatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setRating(0);
    setHovered(0);
    setComment("");
    setSubmitted(false);
    onClose();
  }

  function handleSubmit() {
    if (rating === 0) return;
    const flavorOrdered =
      order?.items
        .slice(0, 2)
        .map((i) => `${i.emoji} ${i.name}`)
        .join(", ") ?? "Cosmic Flavour";
    const review: Review = {
      id: Date.now().toString(),
      name: "Cosmic Customer",
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      flavorOrdered,
    };
    saveReview(review);
    setSubmitted(true);
    onConfettiTrigger();
    // toast is triggered from the parent via onConfettiTrigger callback side-effect
    setTimeout(() => {
      handleClose();
    }, 1800);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            data-ocid="delivery_rating.dialog"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 220 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-3xl p-7 border border-amber-400/30 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.09 0.04 280), oklch(0.11 0.05 310))",
                boxShadow:
                  "0 0 60px oklch(0.82 0.2 75 / 0.15), 0 0 120px oklch(0.55 0.28 310 / 0.2)",
              }}
            >
              {/* Glow top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.82 0.2 75 / 0.8), oklch(0.65 0.3 310 / 0.6), transparent)",
                }}
              />

              {/* Close button */}
              <button
                type="button"
                data-ocid="delivery_rating.close_button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-violet-300"
              >
                <X className="w-4 h-4" />
              </button>

              {submitted ? (
                <motion.div
                  data-ocid="delivery_rating.success_state"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl mb-3"
                  >
                    🌟
                  </motion.div>
                  <h3
                    className="font-display font-black text-xl mb-2"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.85 0.15 60), oklch(0.8 0.22 40))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Thanks for Rating! 🚀
                  </h3>
                  <p className="text-sm text-violet-300/70">
                    Your feedback powers the galaxy! ✨
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-5 pr-6">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                      }}
                      className="text-3xl mb-2"
                    >
                      🎉
                    </motion.div>
                    <h2
                      className="font-display font-black text-xl leading-tight"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.85 0.15 60), oklch(0.75 0.22 40))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Your Order Arrived!
                    </h2>
                    <p className="text-xs text-violet-300/60 mt-1">
                      {order?.queueNumber} — How was your delivery?
                    </p>
                  </div>

                  {/* Star rating */}
                  <div className="mb-5">
                    <p className="text-xs text-violet-300/70 mb-2 uppercase tracking-wider">
                      Rate Your Delivery
                    </p>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          data-ocid={`delivery_rating.star.${star}`}
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => setRating(star)}
                          className="relative"
                        >
                          <Star
                            className="w-9 h-9 transition-all duration-150"
                            style={{
                              fill:
                                star <= (hovered || rating)
                                  ? "oklch(0.82 0.2 75)"
                                  : "transparent",
                              color:
                                star <= (hovered || rating)
                                  ? "oklch(0.82 0.2 75)"
                                  : "oklch(0.35 0.05 280)",
                              filter:
                                star <= (hovered || rating)
                                  ? "drop-shadow(0 0 8px oklch(0.82 0.2 75 / 0.8))"
                                  : "none",
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-xs mt-2 text-amber-300/80"
                      >
                        {
                          [
                            "",
                            "😞 Poor",
                            "😐 Fair",
                            "🙂 Good",
                            "😊 Great!",
                            "🤩 Cosmic!",
                          ][rating]
                        }
                      </motion.p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mb-5">
                    <p className="text-xs text-violet-300/70 mb-2 uppercase tracking-wider">
                      Any feedback?{" "}
                      <span className="normal-case opacity-60">(optional)</span>
                    </p>
                    <Textarea
                      data-ocid="delivery_rating.textarea"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your cosmic delivery experience..."
                      rows={3}
                      className="bg-white/5 border-violet-500/30 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none rounded-xl"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid="delivery_rating.cancel_button"
                      onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl text-sm text-violet-300/60 hover:text-violet-200 border border-violet-400/20 hover:border-violet-400/40 transition-all"
                    >
                      Skip
                    </button>
                    <motion.button
                      type="button"
                      data-ocid="delivery_rating.submit_button"
                      whileHover={{ scale: rating > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: rating > 0 ? 0.97 : 1 }}
                      onClick={handleSubmit}
                      disabled={rating === 0}
                      className="flex-2 flex-grow py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.28 310), oklch(0.5 0.25 280))",
                        boxShadow:
                          rating > 0
                            ? "0 0 20px oklch(0.55 0.28 310 / 0.4)"
                            : "none",
                      }}
                    >
                      Submit Review ✨
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
