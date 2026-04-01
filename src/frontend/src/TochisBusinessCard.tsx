import { useState } from "react";

const products = [
  {
    name: "Classic Black Machine",
    img: "/assets/img_20260401_093506-019d4781-d591-731c-911d-a7b5211513d1.jpg",
  },
  {
    name: "High Speed Motor",
    img: "/assets/img_20260401_103806-019d4781-fa4c-753c-8244-76652422751b.jpg",
  },
  {
    name: "Heavy Duty Armature",
    img: "/assets/img_20260401_104038-019d4782-0e0e-761d-858b-d0384899d1f7.jpg",
  },
  {
    name: "Speed Regulator",
    img: "/assets/img_20260401_104003-019d4782-7232-76b0-9ddb-4637c9f93c96.jpg",
  },
  {
    name: "Super Deluxe Machine",
    img: "/assets/img_20260401_093450-019d4782-8bfe-7158-9a7e-191ad0b5b4d3.jpg",
  },
  {
    name: "Special Machine (Red)",
    img: "/assets/img_20260401_093528-019d4782-8ec4-7182-b223-5d1c3a5945a4.jpg",
  },
  {
    name: "Machine With Regulator",
    img: "/assets/img_20260401_104016-019d4782-9359-7421-aa35-a5febdf837bc.jpg",
  },
  {
    name: "Motor Box",
    img: "/assets/img_20260401_103940-019d4782-ae70-7748-81e9-059a10020b50.jpg",
  },
  {
    name: "Eco Powerful Motor",
    img: "/assets/img_20260401_103927-019d4782-af1b-77a0-8db9-0c85e6c7f591.jpg",
  },
];

const contacts = [
  { number: "8653172850", label: "Primary" },
  { number: "9434389844", label: "Secondary" },
  { number: "7001558704", label: "WhatsApp" },
];

export default function TochisBusinessCard() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const msg = `*TOCHI'S*\nA Product of Purba Sewing Machine Co.\n\n📍 Leighton Street, Pucca Bazar, Asansol W.B.\nOpposite JoharMal Jalan H.S. School\n\n📞 8653172850 / 9434389844 / 7001558704\n\nFor all sewing machine needs — Industrial, Domestic, Spare Parts & Servicing.`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          style={{
            background:
              "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            border: "1px solid rgba(212,175,55,0.4)",
            boxShadow:
              "0 0 40px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.5)",
          }}
          className="rounded-2xl overflow-hidden"
        >
          {/* Gold top stripe */}
          <div
            style={{
              background: "linear-gradient(90deg, #b8960c, #f0d060, #b8960c)",
              height: "5px",
            }}
          />

          {/* Header */}
          <div className="px-7 pt-7 pb-5 text-center">
            <p
              style={{
                color: "#c9a227",
                letterSpacing: "0.12em",
                fontSize: "0.75rem",
              }}
              className="uppercase font-semibold mb-1"
            >
              A Product of Purba Sewing Machine Co.
            </p>

            <h1
              style={{
                background:
                  "linear-gradient(135deg, #f0d060, #c9a227, #f0d060)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2.8rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              TOCHI'S
            </h1>

            <div
              style={{
                background:
                  "linear-gradient(90deg, transparent, #c9a227, transparent)",
                height: "1px",
              }}
              className="mt-3 mb-4"
            />

            <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
              Sewing Machine Specialists · Asansol, W.B.
            </p>
          </div>

          {/* Products Photo Grid */}
          <div className="px-6 pb-4">
            <p
              style={{
                color: "#c9a227",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
              }}
              className="uppercase font-bold mb-3"
            >
              Our Products & Services
            </p>
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                  className="rounded-xl p-1.5"
                >
                  <div
                    style={{
                      border: "1px solid rgba(212,175,55,0.3)",
                    }}
                    className="rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.6rem",
                      textAlign: "center",
                    }}
                    className="mt-1 leading-tight"
                  >
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ background: "rgba(212,175,55,0.15)", height: "1px" }}
            className="mx-6"
          />

          {/* Address */}
          <div className="px-6 py-4">
            <div className="flex items-start gap-2">
              <span style={{ fontSize: "1rem" }}>📍</span>
              <div>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  Leighton Street, Pucca Bazar, Asansol W.B.
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                  Opposite JoharMal Jalan H.S. School
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ background: "rgba(212,175,55,0.15)", height: "1px" }}
            className="mx-6"
          />

          {/* Contact Numbers */}
          <div className="px-6 py-4">
            <p
              style={{
                color: "#c9a227",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
              }}
              className="uppercase font-bold mb-3"
            >
              Contact Us
            </p>
            <div className="flex flex-col gap-2">
              {contacts.map((c) => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    color: "#e2e8f0",
                    textDecoration: "none",
                  }}
                  className="rounded-xl px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    📞 {c.number}
                  </span>
                  <span
                    style={{
                      background: "rgba(212,175,55,0.2)",
                      color: "#c9a227",
                      fontSize: "0.65rem",
                      borderRadius: "999px",
                      padding: "2px 10px",
                    }}
                  >
                    {c.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ background: "rgba(212,175,55,0.15)", height: "1px" }}
            className="mx-6"
          />

          {/* Action Buttons */}
          <div className="px-6 py-5 flex gap-3">
            <button
              type="button"
              onClick={handleShare}
              style={{
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 0",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                flex: 1,
              }}
            >
              💬 Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copied
                  ? "rgba(34,197,94,0.2)"
                  : "rgba(212,175,55,0.15)",
                color: copied ? "#4ade80" : "#c9a227",
                border: "1px solid",
                borderColor: copied ? "#4ade80" : "rgba(212,175,55,0.4)",
                borderRadius: "12px",
                padding: "10px 16px",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "✅ Copied!" : "🔗 Copy Link"}
            </button>
          </div>

          {/* Gold bottom stripe */}
          <div
            style={{
              background: "linear-gradient(90deg, #b8960c, #f0d060, #b8960c)",
              height: "4px",
            }}
          />
        </div>

        <p
          style={{
            color: "#475569",
            fontSize: "0.7rem",
            textAlign: "center",
            marginTop: "12px",
          }}
        >
          TOCHI'S · Purba Sewing Machine Co. · Asansol
        </p>
      </div>
    </div>
  );
}
