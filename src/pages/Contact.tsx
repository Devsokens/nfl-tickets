import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { MapPin, Phone, Mail, ArrowUpRight, ArrowRight, ArrowLeft, Info, Facebook, Linkedin, Youtube, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { SiteSettingsAPI, ContactAPI, type SiteSettings } from "@/lib/api";

const Contact = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir votre nom, email et message.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = phone ? `[Téléphone: ${phone}]\n\n${message}` : message;
      await ContactAPI.send({
        name: fullName,
        email,
        subject: subject || "Demande de contact",
        message: fullMessage,
      });
      toast({
        title: "Message envoyé !",
        description: "Notre équipe vous répondra dans les plus brefs délais.",
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || "Impossible d'envoyer votre message. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col text-[#100906] relative overflow-hidden">
      <Helmet>
        <title>Contactez-nous | NFL Courtier & Service</title>
        <meta name="description" content="Contactez l'équipe de NFL Courtier & Service pour vos accompagnements, formations et événements d'exception." />
      </Helmet>
      
      <Navbar />

      {/* STRIPED GRID BACKGROUND OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#100906 0.75px, transparent 0.75px), radial-gradient(#100906 0.75px, #fdfbf7 0.75px)`,
          backgroundSize: `32px 32px`,
          backgroundPosition: `0 0, 16px 16px`,
          opacity: 0.035
        }}
      />

      {/* MAIN CONTENT SECTION */}
      <main className="flex-grow pt-24 lg:pt-28 pb-4 lg:pb-6 relative z-10 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* GAUCHE : TITRE, INFO CONTACT & RESEAUX RS */}
            <div className="lg:col-span-5 space-y-5 lg:space-y-6">
              
              {/* BOUTON RETOUR À L'ACCUEIL */}
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#100906] hover:text-[#8c591a] hover:border-[#8c591a] shadow-sm hover:shadow transition-all duration-300 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>Retour à l'accueil</span>
                </Link>
              </div>

              {/* TITRE & SOUS-TITRE MAQUETTE */}
              <div className="space-y-2 lg:space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#100906] tracking-tight leading-[1.1]">
                  Entrons en <br />
                  <span className="bg-gradient-to-r from-[#8c591a] via-[#d4af37] to-[#8c591a] bg-clip-text text-transparent">
                    contact
                  </span>
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-ink/70 font-medium leading-relaxed max-w-md">
                  N'hésitez pas à nous contacter pour toute question, formation ou accompagnement sur mesure !
                </p>
              </div>

              {/* TROIS CARTES INTERACTIVES TYPE MAQUETTE */}
              <div className="space-y-2.5 pt-1">
                
                {/* CARTE EMAIL */}
                <a
                  href={`mailto:${siteSettings?.contact_email || "contact@nflprestige.com"}`}
                  className="group flex items-center justify-between bg-white/90 hover:bg-white border border-black/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#8c591a]/10 text-[#8c591a] flex items-center justify-center shrink-0 group-hover:bg-[#8c591a] group-hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-ink/50 block">Envoyez-nous un email</span>
                      <span className="text-xs sm:text-sm font-bold text-[#100906] truncate block">
                        {siteSettings?.contact_email || "contact@nflprestige.com"}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#100906] group-hover:text-white text-ink/70 flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </a>

                {/* CARTE TÉLÉPHONE */}
                <a
                  href={`tel:${siteSettings?.phone || ""}`}
                  className="group flex items-center justify-between bg-white/90 hover:bg-white border border-black/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#8c591a]/10 text-[#8c591a] flex items-center justify-center shrink-0 group-hover:bg-[#8c591a] group-hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-ink/50 block">Appelez-nous</span>
                      <span className="text-xs sm:text-sm font-bold text-[#100906] truncate block">
                        {siteSettings?.phone || "+241 00 00 00 00"}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#100906] group-hover:text-white text-ink/70 flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </a>

                {/* CARTE SIÈGE SOCIAL */}
                <div
                  className="group flex items-center justify-between bg-white/90 hover:bg-white border border-black/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#8c591a]/10 text-[#8c591a] flex items-center justify-center shrink-0 group-hover:bg-[#8c591a] group-hover:text-white transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-ink/50 block">Notre Siège Social</span>
                      <span className="text-xs sm:text-sm font-bold text-[#100906] truncate block">
                        {siteSettings?.address || "Libreville, Gabon"}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#100906] group-hover:text-white text-ink/70 flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>

              {/* SOCIAL LINKS (FOLLOW US ON) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block">
                  Suivez-nous sur
                </span>
                <div className="flex items-center gap-2">
                  <a 
                    href={siteSettings?.facebook_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center text-ink/70 hover:text-[#8c591a] hover:border-[#8c591a] hover:shadow-sm transition-all"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href={siteSettings?.linkedin_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center text-ink/70 hover:text-[#8c591a] hover:border-[#8c591a] hover:shadow-sm transition-all"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href={siteSettings?.twitter_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Twitter X"
                    className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center font-bold text-xs text-ink/70 hover:text-[#8c591a] hover:border-[#8c591a] hover:shadow-sm transition-all"
                  >
                    X
                  </a>
                  <a 
                    href={siteSettings?.youtube_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center text-ink/70 hover:text-[#8c591a] hover:border-[#8c591a] hover:shadow-sm transition-all"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href={siteSettings?.instagram_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center text-ink/70 hover:text-[#8c591a] hover:border-[#8c591a] hover:shadow-sm transition-all"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* DROITE : GRAND FORMULAIRE DANS UNE CARTE DE LUXE BLANCHE */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-black/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#100906] mb-6 tracking-tight">
                  Contactez-nous
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  
                  {/* NOM COMPLET & EMAIL */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink/80 block">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Jean Dupont"
                        className="w-full bg-[#f8f7f4] border border-black/5 text-sm text-[#100906] px-4 py-3 rounded-xl placeholder:text-ink/30 focus:outline-none focus:bg-white focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/15 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink/80 block">
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean.dupont@example.com"
                        className="w-full bg-[#f8f7f4] border border-black/5 text-sm text-[#100906] px-4 py-3 rounded-xl placeholder:text-ink/30 focus:outline-none focus:bg-white focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* NUMÉRO DE TÉLÉPHONE & SUJET */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink/80 block">
                        Numéro de téléphone
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center gap-1.5 text-xs text-ink/60 font-semibold pointer-events-none">
                          <span>🇬🇦 +241</span>
                          <span className="text-ink/20">|</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="06 00 00 00"
                          className="w-full bg-[#f8f7f4] border border-black/5 text-sm text-[#100906] pl-[88px] pr-4 py-3 rounded-xl placeholder:text-ink/30 focus:outline-none focus:bg-white focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink/80 block">
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Entrez votre sujet"
                        className="w-full bg-[#f8f7f4] border border-black/5 text-sm text-[#100906] px-4 py-3 rounded-xl placeholder:text-ink/30 focus:outline-none focus:bg-white focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink/80 block">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Écrivez votre texte ici..."
                      className="w-full bg-[#f8f7f4] border border-black/5 text-sm text-[#100906] px-4 py-3 rounded-xl placeholder:text-ink/30 focus:outline-none focus:bg-[#fdfbf7]/50 focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/15 transition-all resize-none"
                    />
                  </div>

                  {/* BOUTON SOUMETTRE */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#100906] via-[#8c591a] to-[#100906] hover:opacity-95 text-white font-bold text-sm sm:text-base uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <span>Envoyer le message</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
