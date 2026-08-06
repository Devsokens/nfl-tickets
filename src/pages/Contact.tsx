import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { MapPin, Phone, Mail, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HomeContentAPI, SiteSettingsAPI, type HomeContent, type SiteSettings } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableImage } from "@/components/admin/editable/EditableImage";
import { AddInlineButton } from "@/components/admin/editable/EditableListControls";

import louisePhoto from "@/assets/louise photo.jpeg";
import louisePhoto2 from "@/assets/louise2.jpeg";

type ContactPageContent = Required<NonNullable<HomeContent["contactPage"]>>;

const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  hero: {
    eyebrow: "NOUS CONTACTER",
    title: "À votre service pour l'excellence & le prestige.",
    description: "NFL Courtier & Service vous accompagne à Libreville dans vos projets de courtage, d'ingénierie financière et d'événementiel de luxe. Notre équipe est à votre disposition pour une consultation privée.",
  },
  about: {
    title: "A propos de",
    badgeNumber: "35 ans",
    badgeLabel: "d'expérience",
    bullets: [
      "Première Directrice Pays africaine Air France Gabon",
      "Experte en stratégie commerciale",
      "Plusieurs centaines d'impactés",
      "Directrice Commerciale Toyota",
      "Fondatrice NFL Courtier et Service",
      "Conférencière",
    ],
    photo: "",
  },
  info: {
    businessHours: "Lundi - Vendredi : 08h30 - 18h00",
    responseTime: "Réponse sous 24h ouvrées",
  },
  ctaSection: { title: "Votre succès mérite l'excellence." },
};

function mergeContactContent(fetched?: HomeContent["contactPage"]): ContactPageContent {
  const f = fetched || {};
  return {
    hero: { ...DEFAULT_CONTACT_CONTENT.hero, ...f.hero },
    about: { ...DEFAULT_CONTACT_CONTENT.about, ...f.about, bullets: f.about?.bullets?.length ? f.about.bullets : DEFAULT_CONTACT_CONTENT.about.bullets },
    info: { ...DEFAULT_CONTACT_CONTENT.info, ...f.info },
    ctaSection: { ...DEFAULT_CONTACT_CONTENT.ctaSection, ...f.ctaSection },
  };
}

const Contact = () => {
  const { toast } = useToast();
  const isEditMode = useIsEditMode();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: homeContentRaw } = useQuery<HomeContent>({
    queryKey: ["homeContent"],
    queryFn: HomeContentAPI.get,
  });
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });
  const merged = mergeContactContent(homeContentRaw?.contactPage);
  const [override, setOverride] = useState<ContactPageContent | null>(null);
  useEffect(() => setOverride(null), [homeContentRaw]);
  const content = override || merged;

  const saveContactSection = async (patch: Partial<ContactPageContent>) => {
    const nextContactPage = { ...content, ...patch };
    setOverride(nextContactPage);
    const updated = await HomeContentAPI.update({ contactPage: nextContactPage });
    queryClient.setQueryData(["homeContent"], (prev: HomeContent | undefined) => ({ ...(prev || {}), ...updated }));
  };

  const makeContactFieldSaver = <K extends keyof ContactPageContent>(sectionKey: K, fieldKey: string) =>
    async (value: any) => {
      await saveContactSection({ [sectionKey]: { ...(content as any)[sectionKey], [fieldKey]: value } } as any);
    };

  const bullets = content.about.bullets || [];
  const updateBullet = (idx: number, value: string) => {
    const list = [...bullets];
    list[idx] = value;
    return saveContactSection({ about: { ...content.about, bullets: list } });
  };
  const addBullet = () => saveContactSection({ about: { ...content.about, bullets: [...bullets, "Nouvel élément"] } });
  const removeBullet = (idx: number) => saveContactSection({ about: { ...content.about, bullets: bullets.filter((_, i) => i !== idx) } });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
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
    toast({
      title: "Message envoyé !",
      description: "Notre équipe vous répondra dans les plus brefs délais.",
    });

    const whatsappMsg = `Bonjour NFL Courtier & Service,\n\n` +
                        `*Nouveau message via le site web :*\n` +
                        `- *Nom* : ${fullName}\n` +
                        `- *Email* : ${email}\n` +
                        `- *Sujet* : ${subject || "Consultation"}\n` +
                        `- *Message* : ${message}\n\n` +
                        `Merci.`;

    const whatsappUrl = `https://wa.me/24166692338?text=${encodeURIComponent(whatsappMsg)}`;
    setTimeout(() => {
      window.location.href = whatsappUrl;
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d0e11] flex flex-col text-white">
      <Helmet>
        <title>Contact & À Propos | NFL Courtier & Service</title>
        <meta name="description" content="À votre service pour l'excellence & le prestige. Contactez l'équipe de NFL Courtier & Service à Libreville." />
      </Helmet>
      <Navbar />

      {/* 1. HERO HEADER */}
      <section className="pt-24 pb-14 md:pt-28 md:pb-16 bg-[#0d0e11] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-4 max-w-3xl">
            <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em] block">
              <EditableText value={content.hero.eyebrow} onSave={makeContactFieldSaver("hero", "eyebrow")} label="Eyebrow" />
            </span>
            <h1 className="text-lvl-hero text-white leading-tight">
              <EditableText value={content.hero.title} onSave={makeContactFieldSaver("hero", "title")} label="Titre" multiline />
            </h1>
            <p className="text-white/70 text-lvl-body font-light max-w-2xl pt-2">
              <EditableText value={content.hero.description} onSave={makeContactFieldSaver("hero", "description")} label="Description" multiline as="div" />
            </p>
          </div>
        </div>
      </section>

      {/* 2. SECTION A PROPOS DE */}
      <section className="section-y bg-[#4a4e54] text-white border-b border-black/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Photo with "35 ans d'expérience" overlay badge */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-none overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                <EditableImage
                  src={content.about.photo || louisePhoto}
                  alt="LOUISE AUDYLL Ongoum — Fondatrice NFL Courtier"
                  className="w-full h-[400px] sm:h-[480px] object-cover object-top"
                  wrapperClassName="w-full h-[400px] sm:h-[480px]"
                  onSave={(url) => saveContactSection({ about: { ...content.about, photo: url } })}
                />
                {/* Gold Overlay Badge */}
                <div className="absolute bottom-6 right-6 bg-[#e3bd51] text-black p-5 shadow-2xl border border-black/10 text-center">
                  <span className="text-lvl-subtitle font-bold block leading-none">
                    <EditableText value={content.about.badgeNumber} onSave={makeContactFieldSaver("about", "badgeNumber")} label="Chiffre" />
                  </span>
                  <span className="italic text-lvl-footer font-normal block mt-1">
                    <EditableText value={content.about.badgeLabel} onSave={makeContactFieldSaver("about", "badgeLabel")} label="Légende" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: A propos de */}
            <div className="lg:col-span-6">
              <div className="bg-[#383b40]/90 border border-white/10 p-8 sm:p-12 rounded-none space-y-6 shadow-2xl">
                <h2 className="text-lvl-title text-[#e3bd51]">
                  <EditableText value={content.about.title} onSave={makeContactFieldSaver("about", "title")} label="Titre" />
                </h2>

                <div className="space-y-4 pt-2">
                  {bullets.map((item, idx) => (
                    <div key={idx} className="group relative flex items-center gap-3.5 text-lvl-body text-white font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#e3bd51]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#e3bd51]" />
                      </div>
                      <span className="flex-1"><EditableText value={item} onSave={(v) => updateBullet(idx, v)} label="Élément" /></span>
                      {isEditMode && bullets.length > 1 && (
                        <button onClick={() => removeBullet(idx)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditMode && <AddInlineButton onClick={addBullet} label="Ajouter un élément" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ENVOYEZ-NOUS UN MESSAGE & COORDONNÉES */}
      <section className="section-y bg-[#0c0d0f]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Form Box */}
            <div className="lg:col-span-7">
              <div className="border-l-2 border-[#e3bd51] pl-6 mb-8">
                <h2 className="text-lvl-subtitle text-white">
                  Envoyez-nous un message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="bg-[#17191d] border border-white/10 p-8 sm:p-10 rounded-none space-y-5 shadow-2xl">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      NOM COMPLET
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : MOUSSAVOU ALEX"
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      ADRESSE EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="moussavou@gmail.com"
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                    SUJET DE VOTRE DEMANDE
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex : Demande de consultation privée"
                    className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                    VOTRE MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre besoin..."
                    className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-6 rounded-none transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? "ENVOI..." : "ENVOYER LA DEMANDE"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right 3 Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1 */}
              <div className="bg-[#17191d] border border-white/10 p-6 rounded-none flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 bg-[#22252b] flex items-center justify-center rounded-none shrink-0 border border-white/5">
                  <MapPin className="w-5 h-5 text-[#e3bd51]" />
                </div>
                <div>
                  <h3 className="text-lvl-footer font-bold uppercase tracking-widest text-[#e3bd51] mb-1">
                    SIÈGE SOCIAL
                  </h3>
                  <p className="text-white/80 text-lvl-footer">
                    {isEditMode ? (
                      <EditableText
                        value={siteSettings?.address || "Libreville, Gabon"}
                        onSave={async (v) => { await SiteSettingsAPI.update({ address: v }); queryClient.invalidateQueries({ queryKey: ["siteSettings"] }); }}
                        label="Adresse (réglages du site)"
                        multiline
                      />
                    ) : (siteSettings?.address || "Libreville, Gabon")}
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#17191d] border border-white/10 p-6 rounded-none flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 bg-[#22252b] flex items-center justify-center rounded-none shrink-0 border border-white/5">
                  <Phone className="w-5 h-5 text-[#e3bd51]" />
                </div>
                <div>
                  <h3 className="text-lvl-footer font-bold uppercase tracking-widest text-[#e3bd51] mb-1">
                    LIGNE DIRECTE
                  </h3>
                  <p className="text-white/90 text-lvl-footer font-bold">
                    {isEditMode ? (
                      <EditableText
                        value={siteSettings?.phone || ""}
                        onSave={async (v) => { await SiteSettingsAPI.update({ phone: v }); queryClient.invalidateQueries({ queryKey: ["siteSettings"] }); }}
                        label="Téléphone (réglages du site)"
                      />
                    ) : siteSettings?.phone}
                  </p>
                  <p className="text-white/50 text-lvl-footer mt-0.5">
                    <EditableText value={content.info.businessHours} onSave={makeContactFieldSaver("info", "businessHours")} label="Horaires" />
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#17191d] border border-white/10 p-6 rounded-none flex items-start gap-4 shadow-xl">
                <div className="w-12 h-12 bg-[#22252b] flex items-center justify-center rounded-none shrink-0 border border-white/5">
                  <Mail className="w-5 h-5 text-[#e3bd51]" />
                </div>
                <div>
                  <h3 className="text-lvl-footer font-bold uppercase tracking-widest text-[#e3bd51] mb-1">
                    EMAIL DE CONTACT
                  </h3>
                  {isEditMode ? (
                    <EditableText
                      value={siteSettings?.contact_email || ""}
                      onSave={async (v) => { await SiteSettingsAPI.update({ contact_email: v }); queryClient.invalidateQueries({ queryKey: ["siteSettings"] }); }}
                      label="Email (réglages du site)"
                    />
                  ) : (
                    <a href={`mailto:${siteSettings?.contact_email || ""}`} className="text-white/90 text-lvl-footer font-bold hover:text-[#e3bd51] transition-colors">
                      {siteSettings?.contact_email}
                    </a>
                  )}
                  <p className="text-white/50 text-lvl-footer mt-0.5">
                    <EditableText value={content.info.responseTime} onSave={makeContactFieldSaver("info", "responseTime")} label="Délai de réponse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VOTRE SUCCÈS MÉRITE L'EXCELLENCE. */}
      <section className="section-y bg-[#090a0c] text-center border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <h2 className="text-lvl-title text-white">
            <EditableText value={content.ctaSection.title} onSave={makeContactFieldSaver("ctaSection", "title")} label="Titre" />
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-8 rounded-none transition-colors shadow-lg"
            >
              PRENDRE RENDEZ-VOUS
            </button>
            <button
              onClick={isEditMode ? undefined : () => window.location.href = "/catalogue-formations"}
              className="border border-white/30 bg-transparent hover:bg-white/10 text-white font-bold text-lvl-footer uppercase tracking-widest py-4 px-8 rounded-none transition-colors"
            >
              NOS SERVICES
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
