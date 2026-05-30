import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Target, Users, BookOpen, Clock, CheckCircle2, Zap, ArrowRight, Building, Laptop, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Données du catalogue
const niveauxData = [
  {
    id: "niveau1",
    label: "Niveau 1 - Juniors",
    title: "Fondamentaux commerciaux",
    objectif: "Structurer les bases indispensables du métier de commercial et sécuriser les premières performances terrain.",
    public: "Nouveaux commerciaux, juniors, profils en reconversion",
    icon: <Target className="w-6 h-6" />,
    formations: [
      { nom: "Les fondamentaux du métier de commercial", duree: "3 jours", desc: "Comprendre le rôle stratégique du commercial et adopter une posture professionnelle." },
      { nom: "Communication commerciale & relation client", duree: "2 jours", desc: "Développer une communication efficace et instaurer une relation de confiance durable." },
      { nom: "Prospecter efficacement – Les bases", duree: "2 jours", desc: "Mettre en place une démarche de prospection structurée et performante." },
      { nom: "Techniques de vente – Niveau 1", duree: "3 jours", desc: "Conduire un entretien de vente clair, structuré et orienté client." },
      { nom: "Organisation personnelle & efficacité commerciale", duree: "2 jours", desc: "Gagner en rigueur, en méthode et en efficacité opérationnelle." }
    ]
  },
  {
    id: "niveau2",
    label: "Niveau 2 - Intermédiaires",
    title: "Maîtrise opérationnelle",
    objectif: "Renforcer l'impact commercial et professionnaliser les pratiques de vente.",
    public: "Commerciaux confirmés, profils autonomes",
    icon: <Zap className="w-6 h-6" />,
    formations: [
      { nom: "Techniques de vente – Niveau 2 (vente conseil)", duree: "3 jours" },
      { nom: "Négociation commerciale – Fondamentaux", duree: "2 jours" },
      { nom: "Gestion des objections & situations complexes", duree: "2 jours" },
      { nom: "Fidélisation & développement du portefeuille clients", duree: "2 jours" }
    ]
  },
  {
    id: "niveau3",
    label: "Niveau 3 - Avancés",
    title: "Expertise & performance",
    objectif: "Maîtriser les ventes complexes et piloter sa performance commerciale avec exigence.",
    public: "Commerciaux seniors, grands comptes, profils à forte responsabilité commerciale",
    icon: <TrophyIcon />,
    formations: [
      { nom: "Négociation commerciale avancée", duree: "3 jours" },
      { nom: "Vente complexe & grands comptes", duree: "2 jours" },
      { nom: "Pilotage de la performance commerciale", duree: "3 jours" }
    ]
  },
  {
    id: "niveau4",
    label: "Niveau 4 - Experts",
    title: "Leadership & stratégie",
    objectif: "Développer une vision stratégique et piloter la performance collective.",
    public: "Commerciaux seniors, grands comptes, profils à forte responsabilité",
    icon: <Users className="w-6 h-6" />,
    formations: [
      { nom: "Management d'équipe", duree: "3 jours" },
      { nom: "Management commercial", duree: "2 jours" },
      { nom: "Motivation et engagement", duree: "3 jours" },
      { nom: "Stratégie commerciale & développement business", duree: "2 jours" },
      { nom: "Coaching (commercial) & accompagnement terrain", duree: "3 jours" },
      { nom: "Conduite du changement & transformation commerciale", duree: "2 jours" }
    ]
  }
];

const skillsBoosters = [
  "Posture commerciale & crédibilité professionnelle",
  "Discours commercial à forte valeur ajoutée",
  "Techniques de questionnement avancé",
  "Closing & sécurisation des ventes",
  "Motivation des équipes",
  "Gestion du stress et des émotions commerciales"
];

function TrophyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}

const CatalogueFormation = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Catalogue des Formations Commerciales | NFL Courtier & Service</title>
        <meta name="description" content="Découvrez nos parcours de montée en compétences commerciales : des fondamentaux au leadership stratégique. Formations sur-mesure au Gabon." />
      </Helmet>
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold font-bold hover:text-gold-dark transition-all mb-12 bg-gold/5 px-6 py-2.5 rounded-full border border-gold/10 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          
          {/* HEADER SECTION */}
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16 animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Une approche progressive, structurée et <span className="text-gradient-gold">orientée résultats</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed mb-4">
              La performance commerciale ne s'improvise pas. Elle se construit étape par étape, en consolidant les fondamentaux, 
              en renforçant l'expertise opérationnelle, puis en développant la vision stratégique.
            </p>
          </div>

          {/* MAIN TABS SECTION */}
          <div className="max-w-6xl mx-auto mb-16 md:mb-24 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Tabs defaultValue="niveau1" className="w-full">
              <div className="flex justify-center mb-8 md:mb-10 w-full px-2 sm:px-0">
                <TabsList className="bg-background/50 border border-gold/20 p-2 sm:p-1.5 rounded-2xl sm:rounded-full grid grid-cols-2 sm:flex sm:flex-row h-auto w-full sm:w-auto gap-2 sm:gap-0">
                  {niveauxData.map((niv) => (
                    <TabsTrigger 
                      key={niv.id} 
                      value={niv.id}
                      className="rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gold data-[state=active]:text-[#32140c] text-foreground/80 transition-all w-full sm:w-auto"
                    >
                      {niv.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {niveauxData.map((niv) => (
                <TabsContent key={niv.id} value={niv.id} className="focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="glass-card rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-12 shadow-2xl bg-white/5 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 relative z-10">
                      <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20 shrink-0">
                        {niv.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{niv.title}</h2>
                        <span className="text-gold font-bold uppercase tracking-widest text-xs">{niv.label}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-10 relative z-10">
                      <div className="space-y-8">
                        <div>
                          <h4 className="flex items-center gap-2 font-bold text-foreground mb-2">
                            <Target className="w-5 h-5 text-gold" /> Objectif du parcours
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">{niv.objectif}</p>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-2 font-bold text-foreground mb-2">
                            <Users className="w-5 h-5 text-gold" /> Public concerné
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">{niv.public}</p>
                        </div>
                      </div>

                      <div className="bg-background/40 border border-border/50 rounded-2xl p-6">
                        <h4 className="flex items-center gap-2 font-bold text-foreground mb-6 pb-4 border-b border-border/50">
                          <BookOpen className="w-5 h-5 text-gold" /> Formations incluses
                        </h4>
                        <ul className="space-y-4">
                          {niv.formations.map((form, idx) => (
                            <li key={idx} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5 border border-gold/20">
                                <span className="text-xs font-bold text-gold">{idx + 1}</span>
                              </div>
                              <div>
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                  <span className="font-bold text-sm text-foreground">{form.nom}</span>
                                  <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                                    <Clock className="w-3 h-3 inline mr-1" /> {form.duree}
                                  </span>
                                </div>
                                {form.desc && <p className="text-xs text-muted-foreground leading-relaxed">{form.desc}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* SKILLS BOOSTERS & POST-FORMATION */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16 md:mb-24">
            
            {/* Skills Boosters */}
            <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gold/20 relative overflow-hidden bg-gradient-to-br from-background/80 to-background/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[50px] pointer-events-none" />
              <div className="inline-flex px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest border border-gold/20 mb-6">
                Formats Courts (1-2 jours)
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Skills <span className="text-gradient-gold">boosters</span></h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-8">
                Renforcer des compétences ciblées pour améliorer immédiatement l'efficacité commerciale. Des formats percutants à fort impact.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {skillsBoosters.map((skill, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-card/50 p-4 rounded-xl border border-border/50 hover:border-gold/30 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Formation & Ateliers */}
            <div className="space-y-8">
              {/* Post-Formation */}
              <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-border/50 bg-card/30">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">Ancrage des compétences</h3>
                <p className="text-xs sm:text-sm text-muted-foreground italic border-l-2 border-gold pl-4 py-1 mb-6">
                  "Une formation n'est réellement efficace que si elle est appliquée, mesurée et ajustée dans le temps."
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <div className="bg-background border border-gold/10 px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[100px] sm:min-w-[140px] text-center">Suivi <br/><span className="text-gold font-bold text-lg">30 jours</span></div>
                  <div className="bg-background border border-gold/10 px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[100px] sm:min-w-[140px] text-center">Approfondissement <br/><span className="text-gold font-bold text-lg">60 jours</span></div>
                  <div className="bg-background border border-gold/10 px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[100px] sm:min-w-[140px] text-center">Performance <br/><span className="text-gold font-bold text-lg">90 jours</span></div>
                </div>
                <div className="mt-4 text-xs font-semibold text-center text-muted-foreground bg-muted/50 py-2 px-2 rounded-lg">
                  Objectif : Garantir le retour sur investissement
                </div>
              </div>

              {/* Ateliers Pratiques */}
              <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-border/50 bg-card/30">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">Ateliers & Cliniques Commerciales</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">Des formats orientés terrain et résultats immédiats.</p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Clinique commerciale (cas réels)", 
                    "Jeux de rôles intensifs & débriefings",
                    "Analyse de pratiques commerciales",
                    "Coaching terrain individuel / collectif"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
          
          {/* BANNIERE SUR-MESURE */}
          <div className="rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 border border-gold/30 text-center relative overflow-hidden bg-[#32140c] shadow-2xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,157,79,0.15),transparent_70%)] pointer-events-none" />
             <div className="relative z-10">
               <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-6 text-white">Parcours <span className="text-gold">Sur-Mesure</span> & Modalités</h2>
               
               <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-8 md:mb-10">
                 <div className="flex justify-center items-center gap-2 text-white/80 bg-white/5 px-4 py-2.5 rounded-xl sm:rounded-full border border-white/10 text-sm sm:text-base">
                   <Target className="w-4 h-4 text-gold shrink-0" /> Enjeux business
                 </div>
                 <div className="flex justify-center items-center gap-2 text-white/80 bg-white/5 px-4 py-2.5 rounded-xl sm:rounded-full border border-white/10 text-sm sm:text-base">
                   <Laptop className="w-4 h-4 text-gold shrink-0" /> Présentiel, distanciel ou hybride
                 </div>
                 <div className="flex justify-center items-center gap-2 text-white/80 bg-white/5 px-4 py-2.5 rounded-xl sm:rounded-full border border-white/10 text-sm sm:text-base">
                   <Building className="w-4 h-4 text-gold shrink-0" /> Intra-entreprise
                 </div>
                 <div className="flex justify-center items-center gap-2 text-white/80 bg-white/5 px-4 py-2.5 rounded-xl sm:rounded-full border border-white/10 text-sm sm:text-base">
                   <Settings className="w-4 h-4 text-gold shrink-0" /> Adaptation sectorielle
                 </div>
               </div>

               <Button 
                 variant="gold" 
                 size="lg" 
                 className="rounded-full px-6 sm:px-12 h-14 sm:h-16 text-sm sm:text-lg font-bold shadow-2xl shadow-gold/30 w-full sm:w-auto hover:scale-105 transition-transform" 
                 onClick={() => window.location.href = '/#contact'}
               >
                 Construire un parcours de formation sur-mesure <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
               </Button>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogueFormation;
