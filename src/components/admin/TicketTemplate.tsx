import React, { forwardRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import nflLogo from "@/assets/LOGO_NFL-removebg-preview.png";

interface TicketTemplateProps {
  ticket: {
    id: string;
    name: string;
    phone: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    qrCode: string;
  };
}

const TicketTemplate = forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ ticket }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "600px",
          background: "linear-gradient(135deg, #2a2800 0%, #3d3800 50%, #2a2800 100%)",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "24px 32px",
            borderBottom: "2px solid rgba(242,140,40,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <img src={nflLogo} alt="NFL" style={{ height: "50px", width: "auto" }} />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "#f28c28",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Billet Officiel
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px" }}>
              {ticket.id}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", padding: "32px" }}>
          {/* Left: info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#f28c28",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Événement
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: "24px",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {ticket.eventTitle}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ color: "#f28c28", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>
                  Titulaire
                </div>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>{ticket.name}</div>
              </div>
              <div>
                <div style={{ color: "#f28c28", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>
                  Contact
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>{ticket.phone}</div>
              </div>
              <div>
                <div style={{ color: "#f28c28", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>
                  Date &amp; Heure
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>{ticket.eventDate} à {ticket.eventTime}</div>
              </div>
              <div>
                <div style={{ color: "#f28c28", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>
                  Lieu
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>{ticket.eventLocation}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              background: "rgba(242,140,40,0.3)",
              margin: "0 28px",
              borderLeft: "2px dashed rgba(242,140,40,0.3)",
            }}
          />

          {/* Right: QR */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div
              style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "12px",
              }}
            >
              <QRCode value={ticket.qrCode} size={120} level="H" />
            </div>
            <div style={{ fontSize: "10px", opacity: 0.6, textAlign: "center", maxWidth: "140px" }}>
              Scanner pour vérifier la validité
            </div>
          </div>
        </div>

        {/* Footer stripe */}
        <div
          style={{
            background: "linear-gradient(90deg, #f28c28, #e67520, #f28c28)",
            padding: "10px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#2a2800", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
            NFL COURTIER &amp; SERVICE
          </span>
          <span style={{ color: "#2a2800", fontSize: "11px", fontWeight: 600 }}>
            Statut : PAYÉ ✓
          </span>
        </div>
      </div>
    );
  }
);

TicketTemplate.displayName = "TicketTemplate";
export default TicketTemplate;
