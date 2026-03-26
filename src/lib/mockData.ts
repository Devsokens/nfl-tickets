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

export interface Ticket {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  qrCode: string;
  status: "valid" | "used" | "cancelled";
  createdAt: string;
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Soirée Élégance Dorée",
    description: "Une soirée exclusive dans un cadre raffiné. Dress code : chic et élégant. DJ set, cocktails premium et surprises toute la nuit.",
    date: "2026-04-15",
    time: "21:00",
    location: "Le Palais Royal, Abidjan",
    price: 15000,
    currency: "FCFA",
    image: "",
    category: "soirée",
    capacity: 200,
    ticketsSold: 142,
    whatsappNumber: "+2250700000000",
  },
  {
    id: "2",
    title: "Conférence Leadership & Innovation",
    description: "Rejoignez les leaders d'industrie pour une journée d'échanges inspirants sur le futur du business en Afrique.",
    date: "2026-04-22",
    time: "09:00",
    location: "Sofitel Hôtel Ivoire, Abidjan",
    price: 25000,
    currency: "FCFA",
    image: "",
    category: "conférence",
    capacity: 150,
    ticketsSold: 89,
    whatsappNumber: "+2250700000000",
  },
  {
    id: "3",
    title: "Atelier Créatif : Art & Culture",
    description: "Un atelier immersif mêlant art contemporain et traditions africaines. Matériel fourni, ouvert à tous les niveaux.",
    date: "2026-05-03",
    time: "14:00",
    location: "Galerie Cécile Fakhoury, Abidjan",
    price: 10000,
    currency: "FCFA",
    image: "",
    category: "atelier",
    capacity: 40,
    ticketsSold: 28,
    whatsappNumber: "+2250700000000",
  },
  {
    id: "4",
    title: "Concert Live : Afrobeats Night",
    description: "Les meilleurs artistes afrobeats sur scène pour une nuit inoubliable. Sound system premium, ambiance garantie.",
    date: "2026-05-10",
    time: "20:00",
    location: "Palais de la Culture, Abidjan",
    price: 20000,
    currency: "FCFA",
    image: "",
    category: "concert",
    capacity: 500,
    ticketsSold: 312,
    whatsappNumber: "+2250700000000",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "TK-001",
    eventId: "1",
    name: "Kouadio Jean",
    email: "jean@email.com",
    phone: "+2250701234567",
    qrCode: "EVT1-TK001-2026",
    status: "valid",
    createdAt: "2026-03-20",
  },
  {
    id: "TK-002",
    eventId: "1",
    name: "Aya Marie",
    email: "marie@email.com",
    phone: "+2250709876543",
    qrCode: "EVT1-TK002-2026",
    status: "used",
    createdAt: "2026-03-21",
  },
  {
    id: "TK-003",
    eventId: "2",
    name: "Traoré Ibrahim",
    email: "ibrahim@email.com",
    phone: "+2250705551234",
    qrCode: "EVT2-TK003-2026",
    status: "valid",
    createdAt: "2026-03-22",
  },
  {
    id: "TK-004",
    eventId: "3",
    name: "Coulibaly Fatou",
    email: "fatou@email.com",
    phone: "+2250703334444",
    qrCode: "EVT3-TK004-2026",
    status: "cancelled",
    createdAt: "2026-03-23",
  },
];
