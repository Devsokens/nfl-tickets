import axios from 'axios';

// En mode développement, on utilise le backend local si le serveur tourne,
// sinon on pointe vers le backend de production sur Render.
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  currency: string;
  image_url?: string;
  image?: string;
  category: string;
  capacity: number;
  ticketsSold?: number; // S'il y a une agrégation
  whatsapp_number?: string;
  newsletter_status?: string;
  send_newsletter?: boolean;
  status?: 'publié' | 'brouillon' | 'annulé';
}

export interface Ticket {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  phone: string;
  payer_phone?: string;
  event_id: string;
  eventId?: string;
  qr_code_data: string;
  qrCode?: string;
  status: 'soumis' | 'validé' | 'utilisé' | 'annulé' | string;
  created_at?: string;
}

// On pointe par défaut sur le backend de production sur Render
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://backend-nfl.onrender.com/api';
// Sécurité pour éviter le suffixe /docs qui est réservé à Swagger
const API_URL = rawApiUrl.endsWith('/docs') ? rawApiUrl.replace('/docs', '/api') : rawApiUrl;


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nfl_token');

  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    // Assurer que le header Authorization est bien attaché (syntaxe universelle axios)
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Services d'API
export const EventsAPI = {
  getUpcoming: async () => {
    const res = await api.get('/events/upcoming');
    return res.data;
  },
  getAll: async (includeDrafts = false): Promise<Event[]> => {
    const res = await api.get(`/events${includeDrafts ? '?all=true' : ''}`);
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  create: async (eventData: any) => {
    const res = await api.post('/events', eventData);
    return res.data;
  },
  uploadImage: async (formData: FormData) => {
    const res = await api.post('/events/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  update: async (id: string, eventData: any) => {
    const res = await api.patch(`/events/${id}`, eventData);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};

export const TicketsAPI = {
  create: async (ticketData: any) => {
    const res = await api.post('/tickets', ticketData);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/tickets');
    return res.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/tickets/${id}/status`, { status });
    return res.data;
  },
  validate: async (qrCodeData: string) => {
    const res = await api.post('/tickets/validate', { qr_code_data: qrCodeData });
    return res.data;
  },
  getDownloadUrl: (id: string) => `${API_URL}/tickets/${id}/pdf`,
};

export const NewsletterAPI = {
  subscribe: async (email: string) => {
    const res = await api.post('/newsletter/subscribe', { email });
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/newsletter');
    return res.data.subscribers || [];
  },
};

export const AuthAPI = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
};

export const ContactAPI = {
  send: async (contactData: { name: string; email: string; subject: string; message: string }) => {
    const res = await api.post('/contact', contactData);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/contact');
    return res.data;
  },
};
