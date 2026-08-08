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
  slug?: string;
  certificates_sent?: boolean;
  certificates_sent_at?: string;
  speakers?: EventSpeaker[];
  program?: EventProgramStep[];
}

export interface EventSpeaker {
  name: string;
  role?: string;
  company?: string;
  photo_url?: string;
}

export interface EventProgramStep {
  time?: string;
  title: string;
  description?: string;
}

export interface SiteSettings {
  id?: number;
  site_name?: string;
  tagline?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  phone?: string;
  whatsapp_number?: string;
  contact_email?: string;
  address?: string;
  site_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  meta_title_suffix?: string;
  meta_description_default?: string;
  og_image_url?: string | null;
  legal_mentions_url?: string;
  privacy_policy_url?: string;
  footer_tagline?: string;
  copyright_text?: string;
}

export interface HomeContent {
  hero?: {
    badge?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
    badgeCardTitle?: string;
    badgeCardSubtitle?: string;
    images?: string[];
  };
  featureStrip?: { icon?: string; title?: string; subtitle?: string }[];
  /** Logos partenaires & sponsors — marquee partagé (accueil, catalogue formations). */
  partners?: { name?: string; logo_url?: string }[];
  pillars?: { icon?: string; title?: string; description?: string; ctaText?: string; link?: string }[];
  eventsSection?: { eyebrow?: string; title?: string; ctaText?: string; ctaLink?: string };
  spotlight?: {
    badge?: string;
    titleLines?: string[];
    description?: string;
    bullets?: string[];
    ctaText?: string;
    ctaLink?: string;
    image?: string;
  };
  about?: { title?: string; subtitle?: string; paragraph?: string; valuesIntro?: string; values?: string[] };
  ctaSection?: { title?: string; description?: string; primaryBtnText?: string; secondaryBtnText?: string };
  contactPage?: {
    hero?: { eyebrow?: string; title?: string; description?: string };
    about?: { title?: string; badgeNumber?: string; badgeLabel?: string; bullets?: string[]; photo?: string };
    info?: { businessHours?: string; responseTime?: string };
    ctaSection?: { title?: string };
  };
  formationsPage?: {
    hero?: { eyebrow?: string; title?: string; description?: string; image?: string };
  };
  eventsPage?: {
    hero?: { badge?: string; titleLine1?: string; titleLine2?: string; ctaPrimaryText?: string; ctaSecondaryText?: string; footnote?: string };
    stats?: { number?: string; label?: string }[];
    agenda?: { eyebrow?: string; title?: string; subtitle?: string; description?: string };
    newsletterBox?: { title?: string; description?: string };
  };
  [key: string]: any;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role?: string;
  author_company?: string;
  quote: string;
  avatar_url?: string;
  display_order?: number;
  status?: 'publié' | 'brouillon';
  /** Renseigné si soumis par un participant via le lien privé post-certificat (voir TestimonialsTab). */
  ticket_id?: string | null;
}

export interface Formation {
  id: string;
  slug?: string;
  badge?: string;
  title: string;
  description?: string;
  image_url?: string;
  bullets?: string[];
  program?: any[];
  price?: number;
  currency?: string;
  category?: string;
  display_order?: number;
  status?: 'publié' | 'brouillon';
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

// Intercepteur de réponse : un 401 signifie token absent/invalide/expiré.
// On nettoie la session et on renvoie vers la connexion admin, sauf si on
// est déjà sur la page de login (évite une boucle de redirection).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !window.location.pathname.startsWith('/admin/login')) {
      localStorage.removeItem('nfl_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Services d'API
export const EventsAPI = {
  getUpcoming: async () => {
    const res = await api.get('/events/upcoming');
    return res.data;
  },
  getAll: async (includeDrafts = false): Promise<Event[]> => {
    const cacheKey = `nfl_events_cache_${includeDrafts}`;
    try {
      const res = await api.get(`/events${includeDrafts ? '?all=true' : ''}`);
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed, trying local storage cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      // If cache is empty, we fall back to mock data
      const { mockEvents } = await import('./mockData');
      return mockEvents.map(e => ({
        ...e,
        image_url: e.image,
        whatsapp_number: e.whatsappNumber,
        status: 'publié' as const
      }));
    }
  },
  getOne: async (id: string): Promise<Event> => {
    const cacheKey = `nfl_event_cache_${id}`;
    try {
      const res = await api.get(`/events/${id}`);
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed, trying local storage cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      // Try from list cache
      const listCache = localStorage.getItem(`nfl_events_cache_false`);
      if (listCache) {
        try {
          const events = JSON.parse(listCache) as Event[];
          const found = events.find(e => e.id === id || e.slug === id);
          if (found) return found;
        } catch (_) {}
      }
      // Try mock
      const { mockEvents } = await import('./mockData');
      const foundMock = mockEvents.find(e => e.id === id);
      if (foundMock) {
        return {
          ...foundMock,
          image_url: foundMock.image,
          whatsapp_number: foundMock.whatsappNumber,
          status: 'publié' as const
        };
      }
      throw err;
    }
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
  getHistory: async () => {
    const res = await api.get('/newsletter/history');
    return res.data;
  },
  sendManual: async (data: { subject: string; content: string; recipientEmails: string[]; attachmentUrl?: string; attachmentName?: string; }) => {
    const res = await api.post('/newsletter/send', data);
    return res.data;
  },
  unsubscribe: async (email: string) => {
    const res = await api.delete(`/newsletter/${email}`);
    return res.data;
  }
};

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export const AuthAPI = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getProfile: async (): Promise<AdminProfile> => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
  updateProfile: async (data: { full_name?: string; avatar_url?: string; password?: string }): Promise<AdminProfile> => {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },
};

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'rdv_programme' | 'refuse' | string;
  appointment_at?: string | null;
  appointment_notes?: string | null;
  rejection_reason?: string | null;
  handled_at?: string | null;
  created_at?: string;
}

export const ContactAPI = {
  send: async (contactData: { name: string; email: string; subject: string; message: string }) => {
    const res = await api.post('/contact', contactData);
    return res.data;
  },
  getAll: async (): Promise<ContactRequest[]> => {
    const res = await api.get('/contact');
    return res.data;
  },
  scheduleAppointment: async (id: string, data: { appointment_at: string; notes?: string }) => {
    const res = await api.patch(`/contact/${id}/schedule`, data);
    return res.data;
  },
  reject: async (id: string, data: { reason?: string }) => {
    const res = await api.patch(`/contact/${id}/reject`, data);
    return res.data;
  },
};

export interface EmailTemplate {
  key: string;
  label: string;
  subject: string;
  body_html: string;
}

export const EmailTemplatesAPI = {
  getAll: async (): Promise<EmailTemplate[]> => {
    const res = await api.get('/email-templates');
    return res.data;
  },
  update: async (key: string, data: { subject?: string; body_html?: string }): Promise<EmailTemplate> => {
    const res = await api.patch(`/email-templates/${key}`, data);
    return res.data;
  },
};

export const AnalyticsAPI = {
  track: async (path: string) => {
    try {
      const res = await api.post('/analytics/track', { path });
      return res.data;
    } catch (e) {
      console.warn("Analytics tracking failed", e);
    }
  },
  getStats: async () => {
    const res = await api.get('/analytics/stats');
    return res.data;
  }
};

export const CertificatesAPI = {
  generateAndSend: async (eventId: string, ticketIds: string[]) => {
    const res = await api.post(`/certificates/generate/${eventId}`, { ticketIds });
    return res.data;
  }
};

export const SiteSettingsAPI = {
  get: async (): Promise<SiteSettings> => {
    const cacheKey = 'nfl_site_settings_cache';
    try {
      const res = await api.get('/site-settings');
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed for site-settings, trying cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (_) {}
      }
      return {};
    }
  },
  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await api.patch('/site-settings', data);
    return res.data;
  },
};

export const HomeContentAPI = {
  get: async (): Promise<HomeContent> => {
    const cacheKey = 'nfl_home_content_cache';
    try {
      const res = await api.get('/home-content');
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed for home-content, trying cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (_) {}
      }
      return {};
    }
  },
  update: async (content: HomeContent): Promise<HomeContent> => {
    const res = await api.patch('/home-content', { content });
    return res.data;
  },
};

export const TestimonialsAPI = {
  getAll: async (includeDrafts = false): Promise<Testimonial[]> => {
    const cacheKey = `nfl_testimonials_cache_${includeDrafts}`;
    try {
      const res = await api.get(`/testimonials${includeDrafts ? '?all=true' : ''}`);
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed for testimonials, trying cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (_) {}
      }
      return [];
    }
  },
  create: async (data: Partial<Testimonial>) => {
    const res = await api.post('/testimonials', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Testimonial>) => {
    const res = await api.patch(`/testimonials/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/testimonials/${id}`);
    return res.data;
  },
  getSubmissionInfo: async (ticketId: string, token: string): Promise<{ author_name: string; event_title: string | null }> => {
    const res = await api.get(`/testimonials/submission-info/${ticketId}`, { params: { token } });
    return res.data;
  },
  submit: async (data: { ticket_id: string; token: string; quote: string; author_role?: string; author_company?: string; avatar_url?: string }) => {
    const res = await api.post('/testimonials/submit', data);
    return res.data;
  },
};

export const FormationsAPI = {
  getAll: async (includeDrafts = false): Promise<Formation[]> => {
    const cacheKey = `nfl_formations_cache_${includeDrafts}`;
    try {
      const res = await api.get(`/formations${includeDrafts ? '?all=true' : ''}`);
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Network fetch failed for formations, trying cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { return JSON.parse(cached); } catch (_) {}
      }
      return [];
    }
  },
  getOne: async (id: string): Promise<Formation> => {
    const res = await api.get(`/formations/${id}`);
    return res.data;
  },
  create: async (data: Partial<Formation>) => {
    const res = await api.post('/formations', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Formation>) => {
    const res = await api.patch(`/formations/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/formations/${id}`);
    return res.data;
  },
};
