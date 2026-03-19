import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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

// ── Owner Dashboard Modal ──────────────────────────────────────────────────
interface OwnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OwnerDashboardModal({ isOpen, onClose }: OwnerDashboardProps) {
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
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
