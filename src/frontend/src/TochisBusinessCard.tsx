import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { MapPin, Phone, Scissors, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const products = [
  {
    image: "/assets/generated/sewing-machine-1.dim_400x300.jpg",
    label: "Industrial Sewing Machine",
    desc: "Heavy-duty performance",
  },
  {
    image: "/assets/generated/sewing-machine-2.dim_400x300.jpg",
    label: "Domestic Sewing Machine",
    desc: "Home & boutique use",
  },
  {
    image: "/assets/generated/sewing-accessories.dim_400x300.jpg",
    label: "Accessories & Parts",
    desc: "Genuine spare parts",
  },
];

const phones = [
  { number: "8653172850", display: "86531 72850" },
  { number: "9434389844", display: "94343 89844" },
  { number: "7001558704", display: "70015 58704" },
];

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
      <div className="w-2 h-2 rotate-45 bg-[#D4AF37] shrink-0" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
    </div>
  );
}

export default function TochisBusinessCard() {
  function handleShare() {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link Copied! Share with your contacts.");
      })
      .catch(() => {
        toast.error("Could not copy link.");
      });
  }

  return (
    <div className="min-h-screen bg-[#0D0608] flex flex-col items-center justify-start py-10 px-4">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#3A0A14_0%,_#0D0608_60%)]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(-45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 40px)`,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Card wrapper */}
        <div className="rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30">
          {/* ===== HERO SECTION ===== */}
          <div className="bg-gradient-to-b from-[#1A0810] to-[#0D0608] px-6 pt-10 pb-8 flex flex-col items-center gap-4">
            {/* Scissors icon */}
            <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center bg-[#7B1C2E]/20 mb-1">
              <Scissors className="text-[#D4AF37]" size={26} />
            </div>

            {/* A Product of */}
            <p className="text-[#D4AF37] text-xs tracking-[0.25em] uppercase font-light">
              A Product of
            </p>

            {/* Company name */}
            <h2 className="text-white text-center font-serif font-bold text-xl tracking-widest uppercase">
              Purba Sewing Machine Co.
            </h2>

            {/* Gold divider */}
            <GoldDivider />

            {/* TOCHI'S - THE HERO */}
            <div className="relative py-2">
              <h1 className="tochis-glow font-playfair text-7xl sm:text-8xl font-black text-center tracking-wider">
                TOCHI&#39;S
              </h1>
              <div className="absolute inset-0 blur-2xl bg-[#D4AF37]/10 rounded-full -z-10" />
            </div>

            {/* Tagline */}
            <p className="text-[#C8A87A] text-sm tracking-widest uppercase text-center">
              Quality Sewing Machines &amp; Accessories
            </p>

            <GoldDivider />
          </div>

          {/* ===== PRODUCTS SECTION ===== */}
          <div className="bg-[#0F0508] px-6 py-8">
            <h3 className="text-[#D4AF37] text-center text-xs tracking-[0.3em] uppercase mb-6">
              ✦ Our Products ✦
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {products.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_12px_rgba(212,175,55,0.1)]">
                    <img
                      src={p.image}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-center text-[10px] font-semibold leading-tight">
                    {p.label}
                  </p>
                  <p className="text-[#9A7A4A] text-center text-[9px]">
                    {p.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ===== ADDRESS SECTION ===== */}
          <div className="bg-[#0D0608] border-t border-[#D4AF37]/15 px-6 py-7 flex flex-col items-center gap-2">
            <h3 className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-2">
              ✦ Find Us ✦
            </h3>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-center">
                <p className="text-white text-sm font-semibold">
                  Leighton Street, Pucca Bazar
                </p>
                <p className="text-[#C8A87A] text-sm">Asansol, West Bengal</p>
                <p className="text-[#9A7A4A] text-xs mt-1">
                  Opp. JoharMal Jalan H.S. School
                </p>
              </div>
            </div>
          </div>

          {/* ===== CONTACT SECTION ===== */}
          <div className="bg-[#0F0508] border-t border-[#D4AF37]/15 px-6 py-7 flex flex-col items-center gap-4">
            <h3 className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
              ✦ Contact Us ✦
            </h3>
            <div className="flex flex-col gap-2 w-full">
              {phones.map((p) => (
                <a
                  key={p.number}
                  href={`tel:+91${p.number}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#D4AF37]/20 bg-[#1A0810]/50 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <Phone size={14} className="text-[#D4AF37]" />
                  <span className="text-white text-sm tracking-wide">
                    +91 {p.display}
                  </span>
                </a>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full mt-2">
              <a
                href="https://wa.me/918653172850"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
                data-ocid="tochis.whatsapp_button"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold tracking-wide gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </Button>
              </a>
              <a
                href="tel:+918653172850"
                className="flex-1"
                data-ocid="tochis.call_button"
              >
                <Button className="w-full bg-[#1E6FD9] hover:bg-[#1860C4] text-white font-bold tracking-wide gap-2 shadow-[0_0_20px_rgba(30,111,217,0.3)]">
                  <Phone size={16} />
                  Call Now
                </Button>
              </a>
            </div>
          </div>

          {/* ===== SHARE SECTION ===== */}
          <div className="bg-[#0D0608] border-t border-[#D4AF37]/15 px-6 py-5 flex justify-center">
            <Button
              variant="outline"
              onClick={handleShare}
              data-ocid="tochis.share_button"
              className="gap-2 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] bg-transparent tracking-widest text-xs uppercase"
            >
              <Share2 size={14} />
              Share This Card
            </Button>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="bg-[#0A0306] border-t border-[#D4AF37]/10 px-6 py-4">
            <p className="text-[#5A4020] text-center text-[10px] tracking-wider">
              © {new Date().getFullYear()} TOCHI&#39;S | Purba Sewing Machine
              Co. | Asansol, W.B.
            </p>
            <p className="text-[#3A2A10] text-center text-[9px] tracking-wide mt-1">
              Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#5A4020]"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </motion.div>
      <Toaster />
    </div>
  );
}
