import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "motion/react";

export type OrderStatus =
  | "placed"
  | "preparing"
  | "quality_check"
  | "out_for_delivery"
  | "delivered";

export interface OrderQueueItem {
  id: string;
  queueNumber: string;
  items: { name: string; emoji: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  placedAt: Date;
  estimatedMinutes: number;
  phone?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    labelHi: string;
    color: string;
    bg: string;
    icon: string;
    step: number;
  }
> = {
  placed: {
    label: "Order Placed",
    labelHi: "ऑर्डर मिला",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/40",
    icon: "📋",
    step: 0,
  },
  preparing: {
    label: "Preparing",
    labelHi: "तैयार हो रहा है",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/40",
    icon: "🍦",
    step: 1,
  },
  quality_check: {
    label: "Quality Check",
    labelHi: "क्वालिटी चेक",
    color: "text-purple-300",
    bg: "bg-purple-500/20 border-purple-500/40",
    icon: "✅",
    step: 2,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    labelHi: "डिलीवरी पर है",
    color: "text-orange-300",
    bg: "bg-orange-500/20 border-orange-500/40",
    icon: "🛵",
    step: 3,
  },
  delivered: {
    label: "Delivered! 🎉",
    labelHi: "डिलीवर हो गया! 🎉",
    color: "text-green-300",
    bg: "bg-green-500/20 border-green-500/40",
    icon: "🎉",
    step: 4,
  },
};

const STATUS_STEPS: OrderStatus[] = [
  "placed",
  "preparing",
  "quality_check",
  "out_for_delivery",
  "delivered",
];

// ── Order Confirmation Card ────────────────────────────────────────────────
export function OrderConfirmationCard({
  order,
  lang,
}: {
  order: OrderQueueItem;
  lang: "en" | "hi";
}) {
  const cfg = STATUS_CONFIG[order.status];
  const currentStep = cfg.step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-violet-400/30 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.1 0.04 280), oklch(0.12 0.05 310))",
        boxShadow: "0 0 40px oklch(0.55 0.28 310 / 0.2)",
      }}
    >
      {/* Queue number header */}
      <div
        className="px-5 py-4 text-center border-b border-violet-400/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.06 290 / 0.8), oklch(0.15 0.05 310 / 0.8))",
        }}
      >
        <p className="text-xs text-violet-300/70 uppercase tracking-widest mb-1">
          {lang === "hi" ? "आपका ऑर्डर" : "Your Order"}
        </p>
        <p
          className="text-3xl font-black"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.85 0.15 60), oklch(0.8 0.2 40))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {order.queueNumber}
        </p>
        <p className="text-xs text-violet-300/70 mt-1">
          {lang === "hi"
            ? `आपका आइसक्रीम ~${order.estimatedMinutes} मिनट में आएगा`
            : `Your ice cream will arrive in ~${order.estimatedMinutes} minutes`}
        </p>
      </div>

      {/* Status progress */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          {STATUS_STEPS.map((s, idx) => {
            const sc = STATUS_CONFIG[s];
            const active = idx <= currentStep;
            return (
              <div key={s} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    active
                      ? "border-violet-400 bg-violet-500/30"
                      : "border-violet-400/20 bg-violet-900/30 opacity-40"
                  }`}
                >
                  {sc.icon}
                </motion.div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-full mt-[-18px] -z-10 ${
                      idx < currentStep ? "bg-violet-500" : "bg-violet-500/20"
                    }`}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className={`text-center text-sm font-semibold mt-2 ${cfg.color}`}>
          {lang === "hi" ? cfg.labelHi : cfg.label}
        </p>
      </div>

      {/* Items summary */}
      <div className="px-5 pb-4">
        <div className="bg-violet-950/50 rounded-xl p-3 space-y-1.5 border border-violet-400/15">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={`${item.name}-${item.qty}`}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-violet-200">
                {item.emoji} {item.name} ×{item.qty}
              </span>
              <span className="text-violet-400">₹{item.price * item.qty}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-violet-400/70 text-center">
              +{order.items.length - 3}{" "}
              {lang === "hi" ? "और आइटम" : "more items"}
            </p>
          )}
          <div className="border-t border-violet-400/20 pt-1.5 flex justify-between">
            <span className="text-xs font-bold text-violet-200">
              {lang === "hi" ? "कुल" : "Total"}
            </span>
            <span className="text-xs font-black text-amber-300">
              ₹{order.total}
            </span>
          </div>
        </div>
        <p className="text-center text-xs text-violet-300/50 mt-3">
          {lang === "hi"
            ? "👇 नीचे अपना ऑर्डर ट्रैक करें"
            : "👇 Track your order below"}
        </p>
      </div>
    </motion.div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────
export function StatusBadge({
  status,
  lang,
}: { status: OrderStatus; lang: "en" | "hi" }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg}`}
      style={{ boxShadow: "0 0 8px currentColor" }}
    >
      {cfg.icon} {lang === "hi" ? cfg.labelHi : cfg.label}
    </span>
  );
}

// ── Live Kitchen Orders Section ───────────────────────────────────────────
export function LiveKitchenOrders({
  activeOrders,
  lang,
}: {
  activeOrders: OrderQueueItem[];
  lang: "en" | "hi";
}) {
  const nonDelivered = activeOrders.filter((o) => o.status !== "delivered");
  const isPeakHours = nonDelivered.length >= 3;

  return (
    <section
      data-ocid="live_orders.section"
      className="max-w-6xl mx-auto px-4 py-6"
    >
      {/* Peak Hours Banner */}
      <AnimatePresence>
        {isPeakHours && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3 border border-red-500/40"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.05 30), oklch(0.12 0.04 10))",
              animation: "peakPulse 2s ease-in-out infinite",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              className="text-xl"
            >
              🔥
            </motion.span>
            <p className="font-bold text-red-300 text-sm">
              {lang === "hi"
                ? "⚡ पीक आवर्स — सभी ऑर्डर संभाले जा रहे हैं!"
                : "⚡ Peak Hours — All orders being handled!"}
            </p>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="ml-auto flex items-center gap-1"
            >
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-red-300">
                {lang === "hi" ? "लाइव" : "LIVE"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}
          className="w-3 h-3 rounded-full bg-red-500"
        />
        <h2 className="font-display font-bold text-lg text-violet-100">
          {lang === "hi" ? "🔴 लाइव किचन ऑर्डर" : "🔴 Live Kitchen Orders"}
        </h2>
        <Badge
          variant="outline"
          className="border-violet-400/40 text-violet-300 text-xs"
        >
          {nonDelivered.length} {lang === "hi" ? "सक्रिय" : "active"}
        </Badge>
      </div>

      {nonDelivered.length === 0 ? (
        <motion.div
          data-ocid="live_orders.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-green-500/30 px-6 py-5 text-center"
          style={{ background: "oklch(0.1 0.03 150 / 0.5)" }}
        >
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-semibold text-green-300">
            {lang === "hi"
              ? "किचन आपके ऑर्डर के लिए तैयार है!"
              : "Kitchen is ready for your order!"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {nonDelivered.map((order, idx) => (
              <motion.div
                key={order.id}
                data-ocid={`live_orders.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-violet-400/20 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.03 280 / 0.8), oklch(0.12 0.04 310 / 0.6))",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-sm text-violet-100">
                    {order.queueNumber}
                  </span>
                  <StatusBadge status={order.status} lang={lang} />
                </div>
                <p className="text-xs text-violet-400/70">
                  {order.items
                    .slice(0, 2)
                    .map((i) => `${i.emoji} ${i.name}`)
                    .join(", ")}
                  {order.items.length > 2 && ` +${order.items.length - 2}`}
                </p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-violet-400/50">
                    {order.placedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    ₹{order.total}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

// ── Owner Dashboard Queue Table ────────────────────────────────────────────
export function ActiveOrderQueueTable({
  activeOrders,
}: {
  activeOrders: OrderQueueItem[];
}) {
  if (activeOrders.length === 0) {
    return (
      <div
        data-ocid="dashboard.live_orders.empty_state"
        className="rounded-xl border border-green-500/30 px-6 py-5 text-center"
        style={{ background: "oklch(0.1 0.03 150 / 0.3)" }}
      >
        <p className="text-sm text-green-300">✅ No active orders right now</p>
      </div>
    );
  }

  const statusColorMap: Record<OrderStatus, string> = {
    placed: "text-yellow-300",
    preparing: "text-blue-300",
    quality_check: "text-purple-300",
    out_for_delivery: "text-orange-300",
    delivered: "text-green-300",
  };

  return (
    <div className="rounded-xl border border-violet-400/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-violet-400/20 hover:bg-transparent">
            <TableHead className="text-violet-300 text-xs">Queue #</TableHead>
            <TableHead className="text-violet-300 text-xs">Items</TableHead>
            <TableHead className="text-violet-300 text-xs">Total</TableHead>
            <TableHead className="text-violet-300 text-xs">Status</TableHead>
            <TableHead className="text-violet-300 text-xs">Time</TableHead>
            <TableHead className="text-violet-300 text-xs">ETA</TableHead>
            <TableHead className="text-violet-300 text-xs">Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeOrders.map((order, idx) => (
            <TableRow
              key={order.id}
              data-ocid={`dashboard.live_orders.row.${idx + 1}`}
              className="border-violet-400/10 hover:bg-violet-500/5"
            >
              <TableCell className="font-bold text-xs text-violet-100">
                {order.queueNumber}
              </TableCell>
              <TableCell className="text-xs text-violet-300">
                {order.items
                  .slice(0, 2)
                  .map((i) => `${i.emoji}×${i.qty}`)
                  .join(" ")}
                {order.items.length > 2 && ` +${order.items.length - 2}`}
              </TableCell>
              <TableCell className="text-xs font-bold text-amber-300">
                ₹{order.total}
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs font-semibold ${statusColorMap[order.status]}`}
                >
                  {STATUS_CONFIG[order.status].icon}{" "}
                  {STATUS_CONFIG[order.status].label}
                </span>
              </TableCell>
              <TableCell className="text-xs text-violet-400/70">
                {order.placedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="text-xs text-violet-300">
                ~{order.estimatedMinutes}m
              </TableCell>
              <TableCell className="text-xs text-violet-400/70 font-mono">
                {order.phone ? `****${order.phone.slice(-4)}` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
