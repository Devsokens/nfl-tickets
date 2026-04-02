export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  currency: string;
  image: string;
  category: "soirée" | "conférence" | "atelier" | "concert";
  capacity: number;
  ticketsSold: number;
  whatsappNumber: string;
}

import nflImg5 from "@/assets/nfl img 5.jpeg";

export interface Ticket {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  qrCode: string;
  status: "validé" | "utilisé" | "annulé" | "soumis";
  createdAt: string;
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Forum Entreprises & Leadership",
    description: "Journée professionnelle dédiée aux dirigeants et équipes projet autour du leadership, de la performance et de la transformation digitale.",
    date: "2026-04-15",
    time: "20:00",
    location: "Radisson Blu, Libreville",
    price: 25000,
    currency: "XAF",
    image: "",
    category: "soirée",
    capacity: 150,
    ticketsSold: 61,
    whatsappNumber: "+241077617776",
  },
  {
    id: "2",
    title: "Masterclass Digitalisation",
    description: "Session pratique sur la digitalisation des processus metier : outils, methodes et feuille de route operationnelle pour PME et grandes entreprises.",
    date: "2026-04-20",
    time: "09:00",
    location: "Hôtel Nomad, Libreville",
    price: 25000,
    currency: "XAF",
    image: nflImg5,
    category: "conférence",
    capacity: 250,
    ticketsSold: 94,
    whatsappNumber: "+241077617776",
  },
  {
    id: "3",
    title: "Atelier Opérations Terrain",
    description: "Atelier oriente execution pour equipes evenementielles : accueil participants, securite, coordination terrain et gestion des imprevus.",
    date: "2026-04-28",
    time: "15:00",
    location: "Centre de Formation, Libreville",
    price: 15000,
    currency: "XAF",
    image: "",
    category: "atelier",
    capacity: 50,
    ticketsSold: 38,
    whatsappNumber: "+241077617776",
  },
  {
    id: "4",
    title: "Conférence Voyage & Mobilité",
    description: "Conference dediee aux solutions de voyage d'affaires : billetterie, mobilite des equipes, conformite et optimisation des couts.",
    date: "2026-05-10",
    time: "10:00",
    location: "Nomad, Libreville",
    price: 20000,
    currency: "XAF",
    image: "",
    category: "conférence",
    capacity: 300,
    ticketsSold: 167,
    whatsappNumber: "+241077617776",
  },
  {
    id: "5",
    title: "Soirée Partenaires NFL",
    description: "Rencontre de networking pour partenaires, sponsors et clients autour des prochaines operations evenementielles au Gabon.",
    date: "2026-05-15",
    time: "19:00",
    location: "Hôtel du Parc, Port-Gentil",
    price: 30000,
    currency: "XAF",
    image: "",
    category: "soirée",
    capacity: 100,
    ticketsSold: 57,
    whatsappNumber: "+241077617776",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "TK-001",
    eventId: "1",
    name: "Moussa Obiang",
    email: "moussa@email.ga",
    phone: "+241077123456",
    qrCode: "EVT1-TK001-2026",
    status: "validé",
    createdAt: "2026-03-20",
  },
  {
    id: "TK-002",
    eventId: "1",
    name: "Sylvie Mba",
    email: "sylvie@email.ga",
    phone: "+241066987654",
    qrCode: "EVT1-TK002-2026",
    status: "utilisé",
    createdAt: "2026-03-21",
  },
  {
    id: "TK-003",
    eventId: "2",
    name: "Jean-Pierre Nguema",
    email: "jp@email.ga",
    phone: "+241077555123",
    qrCode: "EVT2-TK003-2026",
    status: "soumis",
    createdAt: "2026-03-22",
  },
  {
    id: "TK-004",
    eventId: "3",
    name: "Alice Bongo",
    email: "alice@email.ga",
    phone: "+241066333444",
    qrCode: "EVT3-TK004-2026",
    status: "annulé",
    createdAt: "2026-03-23",
  },
];
