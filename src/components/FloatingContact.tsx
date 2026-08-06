import { useState, useEffect } from "react";
import { MessageCircle, X, Mail, Phone, MessageSquarePlus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const goToContact = () => {
    setIsOpen(false);
    if (location.pathname !== "/contact") {
      navigate("/contact");
      setTimeout(() => {
        document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed z-40 transition-all duration-250 ease-out left-5 ${
          isOpen
            ? "bottom-[4.75rem] md:bottom-[5.25rem] opacity-100 translate-y-0 pointer-events-auto"
            : "bottom-[4.75rem] md:bottom-[5.25rem] opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="w-64 sm:w-72 bg-[#141518]/97 border border-[#e3bd51]/20 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
          <div className="p-2 space-y-1.5">
            <a
              href="mailto:contact@nfl-ga.com"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#e3bd51] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 leading-none mb-1">
                  Email
                </p>
                <p className="text-xs text-white font-semibold truncate">contact@nfl-ga.com</p>
              </div>
            </a>

            <a
              href="tel:+24100000000"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#e3bd51] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 leading-none mb-1">
                  Téléphone
                </p>
                <p className="text-xs text-white font-semibold truncate">+241 00 00 00 00</p>
              </div>
            </a>

            <button
              onClick={goToContact}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-[#e3bd51]/10 hover:bg-[#e3bd51]/15 transition-colors border-t border-white/5 mt-1"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#e3bd51] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#e3bd51]/80 leading-none mb-1">
                  Formulaire
                </p>
                <p className="text-xs text-white font-semibold">Laisser un message</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Trigger button — left side to not overlap with the back-to-top arrow on right */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Contact"
        aria-expanded={isOpen}
        className={`fixed z-40 bottom-20 left-5 md:bottom-24 md:left-6 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-out shadow-lg hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-[#141518] border border-[#e3bd51]/30"
            : "bg-gradient-to-br from-[#c29c38] to-[#e3bd51] border border-[#c29c38]/50"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#e3bd51]" strokeWidth={2.2} />
        ) : (
          <MessageCircle className="w-5 h-5 md:w-5.5 md:h-5.5 text-black" strokeWidth={2.3} />
        )}
      </button>
    </>
  );
};

export default FloatingContact;
