import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, Rocket, ShieldCheck, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const FormationCard = ({ icon: Icon, title, subtitle, phrase, description, badge, phases, caseStudy }: any) => {
  return (
    <div className="glass-card rounded-[2rem] p-8 border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:shadow-2xl flex flex-col h-full bg-white/5 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
          <Icon className="h-7 w-7 text-gold" />
        </div>
        <div className="bg-muted/50 px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground border border-border/50">
          {badge}
        </div>
      </div>

      <h2 className="text-3xl font-display font-bold text-foreground mb-1">{title}</h2>
      <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">{subtitle}</h3>
      
      <p className="italic text-muted-foreground mb-4">"{phrase}"</p>
      
      <p className="text-foreground/80 leading-relaxed mb-8 flex-grow">
        {description}
      </p>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="phases" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2 group">
              <span className="text-sm font-bold flex items-center gap-2 group-hover:text-gold transition-colors">
                Les 3 phases du parcours : <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <ul className="space-y-4">
                {phases.map((phase: any, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-gold">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-sm block">{phase.name} :</span>
                      <span className="text-xs text-muted-foreground">{phase.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-gold/5 border border-gold/10 rounded-2xl p-5">
           <div className="flex items-center gap-2 mb-2">
             <Trophy className="h-4 w-4 text-gold" />
             <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Étude de cas — {caseStudy.label}</span>
           </div>
           <p className="text-xs text-muted-foreground italic leading-relaxed">
             {caseStudy.desc}
           </p>
        </div>
      </div>
      

    </div>
  );
};

const FormationsPage = () => {
  const formations = [
    {
      icon: Rocket,
      title: "Accélérateur de Rampe",
      subtitle: "Onboarding & Montée en Puissance",
      badge: "Réduction du délai de première vente de 30%",
      phrase: "Vos nouvelles recrues mettent trop de temps à performer ?",
      description: "Sécurisez les bases du métier et accélérez les premières performances terrain. Un parcours intensif pour transformer vos juniors en commerciaux opérationnels.",
      phases: [
        { name: "Diagnostic", desc: "Évaluation des compétences initiales et identification des freins" },
        { name: "Transformation", desc: "Fondamentaux du métier, prospection efficace, techniques de vente niveau 1" },
        { name: "Ancrage", desc: "Suivi 30/60/90 jours avec coaching terrain personnalisé" }
      ],
      caseStudy: { label: "Location automobile", desc: "Temps de montée en compétence réduit de 45% chez Hertz/Avis" }
    },
    {
      icon: ShieldCheck,
      title: "Marge & Défense du Prix",
      subtitle: "Programme Anti-Discount",
      badge: "Augmentation de la marge brute par contrat de 15-25%",
      phrase: "Vos commerciaux accordent trop de remises en fin de mois ?",
      description: "Armez vos équipes face aux acheteurs professionnels. Maîtrisez la négociation complexe et défendez vos marges avec méthode.",
      phases: [
        { name: "Diagnostic", desc: "Audit des pratiques de négociation actuelles et analyse des remises accordées" },
        { name: "Transformation", desc: "Techniques de vente avancées, négociation commerciale, gestion des objections" },
        { name: "Ancrage", desc: "Cliniques commerciales sur vos dossiers réels en cours" }
      ],
      caseStudy: { label: "Transport aérien", desc: "Division par deux des remises accordées chez Air France Cargo" }
    },
    {
      icon: Trophy,
      title: "Architecture de Performance",
      subtitle: "Direction & Leadership Commercial",
      badge: "Réduction du turnover et hausse du CA par commercial",
      phrase: "Vos managers peinent à piloter la performance collective ?",
      description: "Développez une vision stratégique et transformez vos managers en leaders inspirants capables de piloter la performance de leurs équipes.",
      phases: [
        { name: "Diagnostic", desc: "Audit du management commercial et des pratiques de pilotage" },
        { name: "Transformation", desc: "Leadership, coaching commercial, pilotage par KPIs, conduite du changement" },
        { name: "Ancrage", desc: "Coaching individuel des managers + ateliers de co-développement" }
      ],
      caseStudy: { label: "Automobile", desc: "Restructuration réussie de la force de vente Toyota France" }
    },
    {
      icon: Users,
      title: "Alignement Stratégique",
      subtitle: "Séminaires & Engagement Collectif",
      badge: "Validation et appropriation du Plan Stratégique 2025-2028",
      phrase: "Vos équipes ne sont pas alignées sur la vision de l'entreprise ?",
      description: "Fédérez vos équipes autour d'une vision commune. Construisez ensemble votre stratégie commerciale et engagez le collectif dans sa mise en œuvre.",
      phases: [
        { name: "Diagnostic", desc: "Entretiens préalables et cartographie des enjeux stratégiques" },
        { name: "Transformation", desc: "Séminaire de co-construction stratégique, ateliers collaboratifs" },
        { name: "Ancrage", desc: "Plan d'action collectif et rituels de suivi trimestriels" }
      ],
      caseStudy: { label: "Services B2B", desc: "Engagement collectif et +18% de performance commerciale" }
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold font-bold hover:text-gold-dark transition-all mb-12 bg-gold/5 px-6 py-2.5 rounded-full border border-gold/10 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Nos Parcours de <span className="text-gradient-gold">Transformation</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Des interventions intensives, ancrées dans la réalité du terrain et orientées vers des résultats mesurables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {formations.map((f, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <FormationCard {...f} />
              </div>
            ))}
          </div>
          
          <div className="mt-20 glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-16 border border-gold/20 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -z-10" />
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4 md:mb-6">Prêt à transformer vos équipes ?</h2>
             <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto">
               Chaque parcours est adapté à vos objectifs spécifiques. Parlons de votre projet.
             </p>
             <Button 
               variant="gold" 
               size="lg" 
               className="rounded-full px-6 sm:px-12 h-14 sm:h-16 text-base sm:text-lg font-bold shadow-xl shadow-gold/20 w-full sm:w-auto" 
               onClick={() => window.location.href = '/#contact'}
             >
               Contacter NFL Courtier & Service
             </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FormationsPage;
