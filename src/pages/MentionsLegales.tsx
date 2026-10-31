import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiteSettingsAPI, type SiteSettings } from "@/lib/api";

const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-28 space-y-3">
    <h2 className="font-sans text-lg sm:text-xl font-bold text-[#100906]">{title}</h2>
    <div className="text-sm sm:text-base text-[#444] leading-relaxed space-y-2">{children}</div>
  </section>
);

const MentionsLegales = () => {
  const location = useLocation();
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const email = siteSettings?.contact_email || "contact@nfl-ga.com";
  const phone = siteSettings?.phone || "+241 66 69 23 38";

  // Lien "Confidentialité" du footer → /mentions-legales#confidentialite
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col text-[#100906]">
      <Helmet>
        <title>Mentions légales & confidentialité | Cabinet NFL</title>
        <meta name="description" content="Mentions légales et politique de confidentialité du site du Cabinet NFL (NFL Courtier & Service), Libreville, Gabon." />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 lg:pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-10">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#100906] hover:text-[#8c591a] hover:border-[#8c591a] shadow-sm transition-all duration-300 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l'accueil</span>
            </Link>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight">Mentions légales</h1>
          </div>

          <Section title="Éditeur du site">
            <p>
              <strong>NFL Courtier &amp; Service</strong>, nom commercial <strong>Cabinet NFL</strong>
            </p>
            <ul className="space-y-1">
              <li>RCCM : GA-LBV-01-2025-B12-00524</li>
              <li>NIF : 2025010113697T</li>
              <li>Adresse : BP 10898 Libreville, Gabon</li>
              <li>
                Email : <a href={`mailto:${email}`} className="text-[#8c591a] underline underline-offset-2">{email}</a>
              </li>
              <li>
                Téléphone : <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[#8c591a] underline underline-offset-2">{phone}</a>
              </li>
            </ul>
          </Section>

          <Section title="Hébergement">
            <p>
              Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L'ensemble des contenus de ce site (textes, logos, photographies, visuels, supports de formation) est la
              propriété du Cabinet NFL ou de ses partenaires. Toute reproduction ou réutilisation, totale ou partielle,
              sans autorisation écrite préalable est interdite.
            </p>
          </Section>

          <Section id="confidentialite" title="Confidentialité & données personnelles">
            <p>
              Les informations transmises via le formulaire de contact (nom, email, téléphone, message), l'inscription à
              la newsletter ou une inscription à un événement sont utilisées uniquement pour répondre à votre demande,
              gérer votre participation et, si vous l'avez demandé, vous envoyer nos actualités.
            </p>
            <p>
              Ces données ne sont ni vendues ni cédées à des tiers. Elles sont conservées le temps nécessaire au
              traitement de votre demande et à la relation commerciale.
            </p>
            <p>
              Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données en écrivant
              à <a href={`mailto:${email}`} className="text-[#8c591a] underline underline-offset-2">{email}</a>. Chaque
              newsletter contient un lien de désinscription.
            </p>
            <p>
              Le site mesure sa fréquentation (pages consultées) à des fins statistiques et n'utilise pas de cookies
              publicitaires.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentionsLegales;
