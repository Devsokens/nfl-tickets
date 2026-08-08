import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventsAPI, FormationsAPI, type Event, type Formation } from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight, X as XIcon, Images, Loader2 } from "lucide-react";

interface GalleryPageProps {
  type: "event" | "formation";
}

/**
 * Page dédiée à la galerie complète d'un événement ou d'une formation —
 * ouverte depuis la bannière "album" de la fiche de détail. Séparée en
 * route à part (plutôt qu'un simple lightbox en place) pour offrir une
 * vraie page de consultation (URL partageable, grille + visionneuse).
 */
const GalleryPage = ({ type }: GalleryPageProps) => {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => EventsAPI.getOne(id as string),
    enabled: type === "event" && !!id,
  });

  const { data: formation, isLoading: formationLoading } = useQuery<Formation>({
    queryKey: ["formation", id],
    queryFn: () => FormationsAPI.getOne(id as string),
    enabled: type === "formation" && !!id,
  });

  const isLoading = type === "event" ? eventLoading : formationLoading;
  const title = type === "event" ? event?.title : formation?.title;
  const gallery = (type === "event" ? event?.gallery : formation?.gallery) || [];
  const backHref = type === "event" ? `/event/${event?.slug || id}` : `/formation/${formation?.slug || id}`;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length));
  }, [gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, showPrev, showNext]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      <Helmet>
        <title>{title ? `Galerie — ${title}` : "Galerie photos"} | NFL Courtier & Service</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />

      <section className="pt-28 pb-12 md:pt-36 md:pb-16 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#e3bd51] text-lvl-footer font-semibold uppercase tracking-wider transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à la fiche
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <Images className="w-6 h-6 text-[#e3bd51]" />
            <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-widest">Galerie photos</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">{title || (type === "event" ? "Événement" : "Formation")}</h1>
          {gallery.length > 0 && (
            <p className="text-white/50 mt-3">{gallery.length} photo{gallery.length > 1 ? "s" : ""}</p>
          )}
        </div>
      </section>

      <section className="section-y">
        <div className="container mx-auto px-4 max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#e3bd51]" /></div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-24 text-white/40">
              Aucune photo n'a encore été ajoutée pour {type === "event" ? "cet événement" : "cette formation"}.
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="block w-full break-inside-avoid rounded-xl overflow-hidden group relative"
                >
                  <img
                    src={src}
                    alt={`${title || ""} — photo ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="Fermer"
          >
            <XIcon className="w-8 h-8" />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 bg-white/5 hover:bg-white/10 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 bg-white/5 hover:bg-white/10 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <img
            src={gallery[lightboxIndex]}
            alt={`${title || ""} — photo ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-lvl-footer font-semibold">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
