import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface RoadShowAdProps {
  isOpen: boolean;
  onClose: () => void;
}

function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: 0.7,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

const badges = [
  "⭐ 58+ Cosmic Flavours",
  "🏅 A1 Quality Certified",
  "🎉 Jumbo Party Packs ₹799+",
  "🛵 COD Available",
  "💎 Galaxy Premium Brand",
  "🌟 India's Most Trusted",
  "🌿 FSSAI Certified",
  "🚀 Pan-India Delivery 24/7",
];

export function RoadShowAd({ isOpen, onClose }: RoadShowAdProps) {
  const [view, setView] = useState<"landscape" | "standee">("landscape");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      "🍦 Check out Galaxy Ice Cream Parlour - India's Most Trusted Cosmic Ice Cream Brand! 58+ Premium Flavours, Jumbo Party Packs, COD Available. Order Now! 🌟 #GalaxyIceCream #CosmicFlavours",
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px oklch(0.82 0.18 80 / 0.8), 0 0 40px oklch(0.82 0.18 80 / 0.4); }
          50% { text-shadow: 0 0 30px oklch(0.82 0.18 80 / 1), 0 0 60px oklch(0.82 0.18 80 / 0.6), 0 0 80px oklch(0.82 0.18 80 / 0.3); }
        }
        .glow-gold {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .float-badge {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="roadshow.advertisement_modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: "oklch(0.05 0.03 280 / 0.97)" }}
          >
            {/* Starfield */}
            <Starfield />

            {/* Nebula glow blobs */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 20% 30%, oklch(0.35 0.15 290 / 0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 80% 70%, oklch(0.30 0.12 260 / 0.2) 0%, transparent 70%)",
              }}
            />

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative z-10 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.08 0.04 280)",
                border: "1.5px solid oklch(0.82 0.18 80 / 0.4)",
                boxShadow:
                  "0 0 60px oklch(0.82 0.18 80 / 0.15), 0 0 120px oklch(0.65 0.25 290 / 0.1), inset 0 0 40px oklch(0.05 0.03 280 / 0.8)",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                data-ocid="roadshow.close_button"
                onClick={onClose}
                className="absolute top-3 right-3 z-20 p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "oklch(0.82 0.18 80)" }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div
                className="relative px-6 pt-8 pb-5 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.10 0.05 280) 0%, transparent 100%)",
                }}
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight glow-gold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.95 0.15 85), oklch(0.82 0.20 75), oklch(0.90 0.18 80))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    🌌 GALAXY ICE CREAM PARLOUR
                  </h1>
                  <p
                    className="mt-2 text-sm sm:text-base font-semibold tracking-widest uppercase"
                    style={{ color: "oklch(0.75 0.12 290)" }}
                  >
                    Galaxy Premium · India&apos;s Most Trusted Cosmic Ice Cream
                    Brand
                  </p>
                </motion.div>
              </div>

              {/* Toggle */}
              <div className="flex justify-center gap-3 px-6 pb-4">
                <button
                  type="button"
                  data-ocid="roadshow.landscape_tab"
                  onClick={() => setView("landscape")}
                  className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                  style={{
                    background:
                      view === "landscape"
                        ? "oklch(0.82 0.18 80)"
                        : "oklch(0.15 0.05 280)",
                    color:
                      view === "landscape"
                        ? "oklch(0.08 0.03 280)"
                        : "oklch(0.75 0.10 80)",
                    border: "1px solid oklch(0.82 0.18 80 / 0.5)",
                  }}
                >
                  🖼 Landscape Banner
                </button>
                <button
                  type="button"
                  data-ocid="roadshow.standee_tab"
                  onClick={() => setView("standee")}
                  className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                  style={{
                    background:
                      view === "standee"
                        ? "oklch(0.82 0.18 80)"
                        : "oklch(0.15 0.05 280)",
                    color:
                      view === "standee"
                        ? "oklch(0.08 0.03 280)"
                        : "oklch(0.75 0.10 80)",
                    border: "1px solid oklch(0.82 0.18 80 / 0.5)",
                  }}
                >
                  📋 Standee View
                </button>
              </div>

              {/* Banner Image */}
              <div className="px-6 pb-4">
                <AnimatePresence mode="wait">
                  {view === "landscape" ? (
                    <motion.div
                      key="landscape"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: "2px solid oklch(0.82 0.18 80 / 0.6)",
                        boxShadow:
                          "0 0 30px oklch(0.82 0.18 80 / 0.2), 0 0 60px oklch(0.65 0.25 290 / 0.15)",
                      }}
                    >
                      <img
                        src="/assets/generated/roadshow-banner.dim_1920x640.jpg"
                        alt="Galaxy Ice Cream Parlour Road Show Banner"
                        className="w-full object-cover"
                        style={{ maxHeight: 320 }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="standee"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center"
                    >
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          border: "2px solid oklch(0.82 0.18 80 / 0.6)",
                          boxShadow:
                            "0 0 30px oklch(0.82 0.18 80 / 0.2), 0 0 60px oklch(0.65 0.25 290 / 0.15)",
                          maxWidth: 240,
                        }}
                      >
                        <img
                          src="/assets/generated/roadshow-standee.dim_600x1800.jpg"
                          alt="Galaxy Ice Cream Parlour Standee"
                          className="w-full object-cover"
                          style={{ maxHeight: 400 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating Badges */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {badges.map((badge, i) => (
                    <motion.span
                      key={badge}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                      className="float-badge px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        animationDelay: `${i * 0.4}s`,
                        background: "oklch(0.15 0.08 280)",
                        border: "1px solid oklch(0.82 0.18 80 / 0.4)",
                        color: "oklch(0.90 0.15 80)",
                        boxShadow: "0 0 10px oklch(0.82 0.18 80 / 0.1)",
                      }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Marquee */}
              <div
                className="overflow-hidden py-3 mb-2"
                style={{
                  background: "oklch(0.12 0.06 280)",
                  borderTop: "1px solid oklch(0.82 0.18 80 / 0.2)",
                  borderBottom: "1px solid oklch(0.82 0.18 80 / 0.2)",
                }}
              >
                <div
                  className="flex whitespace-nowrap text-sm font-semibold"
                  style={{
                    animation: "marquee 18s linear infinite",
                    color: "oklch(0.85 0.15 80)",
                  }}
                >
                  {[0, 1].map((rep) => (
                    <span key={rep} className="px-8">
                      ✨ Chocolate Galaxy Supreme · 🍑 Peach Planet · 🫐 Berry
                      Nebula · 🥭 Mango Moonbeam · 🌿 Mint Aurora · 🍓
                      Strawberry Cosmos · 🍦 Vanilla Stardust · 🍫 Dark Galaxy
                      Truffle · 🌸 Gulkand Rose Swirl · 💜 Taro Twilight · 🌾
                      Oat Milk Nebula · 🧊 Kulfi Frost Pop ✨
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4">
                <p
                  className="text-xs text-center sm:text-left"
                  style={{ color: "oklch(0.55 0.08 280)" }}
                >
                  🌌 Galaxy Premium · A1 Quality · FSSAI Certified · Pan-India
                  Delivery 24/7
                </p>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    data-ocid="roadshow.whatsapp_button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors"
                    style={{
                      background: "oklch(0.52 0.20 145)",
                      color: "white",
                      boxShadow: "0 0 16px oklch(0.52 0.20 145 / 0.4)",
                    }}
                  >
                    📲 Share on WhatsApp
                  </motion.button>
                  <motion.button
                    type="button"
                    data-ocid="roadshow.close_footer_button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors"
                    style={{
                      background: "oklch(0.15 0.05 280)",
                      color: "oklch(0.75 0.10 80)",
                      border: "1px solid oklch(0.82 0.18 80 / 0.3)",
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
