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

import imgConference from "@/assets/Affiche conférence LA RE DE MOTIVATION.jpg";

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
    title: "Gala de l'Émergence",
    description: "Une soirée exclusive au bord de l'estuaire. Dress code : Prestige et Elégance. Gastronomie fine et animation musicale d'exception.",
    date: "2026-04-15",
    time: "20:00",
    location: "Radisson Blu, Libreville",
    price: 50000,
    currency: "FCFA",
    image: "",
    category: "soirée",
    capacity: 150,
    ticketsSold: 85,
    whatsappNumber: "+24177757383",
  },
  {
    id: "2",
    title: "Forum Tech Gabon 2026",
    description: "Le grand rendez-vous de l'innovation technologique à Libreville. Conférences, ateliers et networking avec les acteurs du numérique.",
    date: "2026-04-20",
    time: "09:00",
    location: "Hôtel Nomad, Libreville",
    price: 15000,
    currency: "FCFA",
    image: imgConference,
    category: "conférence",
    capacity: 250,
    ticketsSold: 120,
    whatsappNumber: "+24177757383",
  },
  {
    id: "3",
    title: "Atelier Art & Culture Urbaine",
    description: "Découvrez les talents locaux et participez à un atelier de création artistique au cœur de la capitale.",
    date: "2026-04-28",
    time: "15:00",
    location: "Institut Français du Gabon, Libreville",
    price: 10000,
    currency: "FCFA",
    image: "",
    category: "atelier",
    capacity: 50,
    ticketsSold: 42,
    whatsappNumber: "+24177757383",
  },
  {
    id: "4",
    title: "Concert Live : Nuit du Kompa",
    description: "Une ambiance tropicale inoubliable avec les meilleurs groupes de Kompa et Zouk en direct.",
    date: "2026-05-10",
    time: "21:00",
    location: "Stade de l'Amitié, Libreville",
    price: 25000,
    currency: "FCFA",
    image: "",
    category: "concert",
    capacity: 1000,
    ticketsSold: 450,
    whatsappNumber: "+24177757383",
  },
  {
    id: "5",
    title: "Soirée Networking Port-Gentil",
    description: "Rencontre exclusive pour les professionnels et entrepreneurs de la capitale économique.",
    date: "2026-05-15",
    time: "19:00",
    location: "Hôtel du Parc, Port-Gentil",
    price: 30000,
    currency: "FCFA",
    image: "",
    category: "soirée",
    capacity: 100,
    ticketsSold: 65,
    whatsappNumber: "+24177757383",
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
