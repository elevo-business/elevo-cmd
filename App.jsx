import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';

// ============================================================================
// CONSTANTS
// ============================================================================
const C = {
  bg: '#0A0A0C', bgCard: '#111114', bgHover: '#1a1a1f', bgInput: '#0d0d10',
  border: '#1e1e24', borderLight: '#2a2a32',
  gold: '#D4A853', goldDim: 'rgba(212,168,83,0.15)', goldHover: '#e0b96a',
  text: '#e8e6e1', textDim: '#8a8a8e', textMuted: '#5a5a5e',
  green: '#4ade80', greenDim: 'rgba(74,222,128,0.15)',
  red: '#f87171', redDim: 'rgba(248,113,113,0.15)',
  blue: '#60a5fa', blueDim: 'rgba(96,165,250,0.15)',
  orange: '#fb923c', orangeDim: 'rgba(251,146,60,0.15)',
  purple: '#a78bfa', purpleDim: 'rgba(167,139,250,0.15)',
};

const font = { head: "'Cormorant Garamond', serif", body: "'DM Sans', sans-serif" };

const DEAL_STAGES = ['Lead', 'Kontakt', 'Angebot', 'Verhandlung', 'Gewonnen', 'Verloren'];
const ACTIVITY_TYPES = ['Anruf', 'E-Mail', 'Loom', 'Meeting', 'Notiz', 'Follow-up', 'Sonstiges'];
const TASK_CATEGORIES = ['Outreach', 'Ads', 'Projekt', 'Vertrieb', 'Admin'];
const SERVICES = ['Website', 'SEO', 'Google Ads', 'Beratung', 'Komplett-Paket'];

// ============================================================================
// ICONS (compact SVG components)
// ============================================================================
const Icon = ({ d, size = 18, color = C.textDim, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>{typeof d === 'string' ? <path d={d} /> : d}</svg>
);

const Icons = {
  dashboard: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  companies: <Icon d={<><path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h0M6 7V3h12v4" /><rect x="9" y="18" width="6" height="3" /></>} />,
  contacts: <Icon d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>} />,
  pipeline: <Icon d={<><rect x="1" y="3" width="7" height="18" rx="1" /><rect x="9" y="6" width="7" height="15" rx="1" /><rect x="17" y="9" width="6" height="12" rx="1" /></>} />,
  projects: <Icon d={<><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></>} />,
  websites: <Icon d={<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>} />,
  tasks: <Icon d={<><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>} />,
  outreach: <Icon d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></>} />,
  ads: <Icon d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></>} />,
  sops: <Icon d={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>} />,
  finances: <Icon d={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>} />,
  notes: <Icon d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>} />,
  ai: <Icon d={<><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>} />,
  search: <Icon d={<><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>} />,
  plus: <Icon d="M12 5v14M5 12h14" />,
  chevLeft: <Icon d="M15 18l-6-6 6-6" />,
  chevRight: <Icon d="M9 18l6-6-6-6" />,
  x: <Icon d="M18 6L6 18M6 6l12 12" />,
  phone: <Icon d={<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></>} />,
  mail: <Icon d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></>} />,
  video: <Icon d={<><rect x="2" y="4" width="15" height="16" rx="2" /><path d="M17 8l5-3v14l-5-3" /></>} />,
  calendar: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>} />,
  alert: <Icon d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" /></>} color={C.orange} />,
  clock: <Icon d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} />,
  check: <Icon d="M20 6L9 17l-5-5" />,
  edit: <Icon d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>} />,
  trash: <Icon d={<><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>} />,
  filter: <Icon d={<><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></>} />,
};

// ============================================================================
// INITIAL DATA
// ============================================================================
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const INITIAL_DATA = {
  companies: [
    { id: 'c1', name: 'Bar Lighthouse', industry: 'Gastronomie', website: 'lighthouse-bar.de', email: 'info@lighthouse-bar.de', phone: '', address: 'Aachen', size: 'Klein', source: 'Referenz', tags: ['referenz', 'gastronomie'], created: '2025-01-15' },
    { id: 'c2', name: 'Ristorante Luigi', industry: 'Gastronomie', website: 'ristorante-luigi.de', email: 'info@ristorante-luigi.de', phone: '', address: 'Aachen', size: 'Klein', source: 'Referenz', tags: ['referenz', 'gastronomie'], created: '2025-01-20' },
    { id: 'c3', name: 'Heilpraxis Weber', industry: 'Gesundheit', website: 'heilpraxis-weber.de', email: 'info@heilpraxis-weber.de', phone: '', address: 'Remote', size: 'Klein', source: 'Referenz', tags: ['referenz', 'gesundheit'], created: '2025-02-01' },
    { id: 'c4', name: 'Beispiel GmbH', industry: 'Handel', website: '', email: 'info@beispiel-gmbh.de', phone: '', address: 'Aachen', size: 'KMU', source: 'Outreach', tags: ['prospect'], created: '2025-03-01' },
  ],
  contacts: [
    { id: 'ct1', companyId: 'c1', firstName: 'Tom', lastName: 'Barkeeper', email: 'tom@lighthouse-bar.de', phone: '', position: 'Inhaber', source: 'Direkt', tags: [], lastContact: '2025-03-01' },
    { id: 'ct2', companyId: 'c2', firstName: 'Luigi', lastName: 'Rossi', email: 'luigi@ristorante-luigi.de', phone: '', position: 'Inhaber', source: 'Direkt', tags: [], lastContact: '2025-03-05' },
    { id: 'ct3', companyId: 'c3', firstName: 'Anna', lastName: 'Weber', email: 'anna@heilpraxis-weber.de', phone: '', position: 'Inhaberin', source: 'Direkt', tags: [], lastContact: '2025-02-20' },
    { id: 'ct4', companyId: 'c4', firstName: 'Max', lastName: 'Mustermann', email: 'max@beispiel-gmbh.de', phone: '', position: 'Geschäftsführer', source: 'Outreach', tags: [], lastContact: '2025-03-10' },
  ],
  deals: [
    { id: 'd1', companyId: 'c4', contactId: 'ct4', title: 'Website Relaunch', status: 'Lead', service: 'Website', volume: 1500, source: 'Outreach', followUp: '2025-04-01', notes: 'Erster potenzieller Kunde über Outreach.', created: '2025-03-10' },
  ],
  projects: [
    { id: 'p1', companyId: 'c1', dealId: null, name: 'Website Bar Lighthouse', status: 'In Arbeit', progress: 75, deadline: '2025-05-01', notes: '' },
    { id: 'p2', companyId: 'c2', dealId: null, name: 'Website Ristorante Luigi', status: 'In Arbeit', progress: 60, deadline: '2025-05-15', notes: '' },
    { id: 'p3', companyId: 'c3', dealId: null, name: 'Website Heilpraxis Weber', status: 'Planung', progress: 30, deadline: '2025-06-01', notes: '' },
  ],
  websites: [
    { id: 'w1', companyId: 'c1', projectId: 'p1', name: 'Bar Lighthouse', url: 'lighthouse-bar.de', status: 'Entwicklung', hosting: 'Coolify', footerLink: true },
    { id: 'w2', companyId: 'c2', projectId: 'p2', name: 'Ristorante Luigi', url: 'ristorante-luigi.de', status: 'Entwicklung', hosting: 'Coolify', footerLink: true },
    { id: 'w3', companyId: 'c3', projectId: 'p3', name: 'Heilpraxis Weber', url: 'heilpraxis-weber.de', status: 'Entwicklung', hosting: 'Coolify', footerLink: true },
  ],
  activities: [
    { id: 'a1', companyId: 'c4', contactId: 'ct4', dealId: 'd1', type: 'E-Mail', subject: 'Erstansprache', content: 'Cold Outreach E-Mail an Max Mustermann gesendet.', date: '2025-03-10T10:00:00' },
    { id: 'a2', companyId: 'c4', contactId: 'ct4', dealId: 'd1', type: 'Notiz', subject: 'Deal erstellt', content: 'Deal "Website Relaunch" automatisch geloggt.', date: '2025-03-10T10:05:00' },
  ],
  tasks: [
    { id: 't1', companyId: null, text: 'Outreach-Domains kaufen', done: true, priority: 'hoch', category: 'Outreach', due: '2025-03-01' },
    { id: 't2', companyId: null, text: 'Google Workspace einrichten', done: true, priority: 'hoch', category: 'Outreach', due: '2025-03-01' },
    { id: 't3', companyId: null, text: 'DNS für alle Domains setzen', done: true, priority: 'hoch', category: 'Outreach', due: '2025-03-02' },
    { id: 't4', companyId: null, text: 'Instantly starten + Warmup', done: false, priority: 'hoch', category: 'Outreach', due: '2025-03-15' },
    { id: 't5', companyId: null, text: 'Outscraper: Kontakte scrapen', done: false, priority: 'mittel', category: 'Outreach', due: '2025-03-20' },
    { id: 't6', companyId: null, text: 'E-Mail-Vorlagen finalisieren', done: false, priority: 'mittel', category: 'Outreach', due: '2025-03-20' },
    { id: 't7', companyId: null, text: 'Loom-Routine etablieren', done: false, priority: 'mittel', category: 'Outreach', due: '2025-03-25' },
    { id: 't8', companyId: null, text: 'Erste 10 Looms aufnehmen', done: false, priority: 'hoch', category: 'Outreach', due: '2025-04-01' },
    { id: 't9', companyId: null, text: 'Google Ads Konto einrichten', done: false, priority: 'hoch', category: 'Ads', due: '2025-03-15' },
    { id: 't10', companyId: null, text: 'Keywords & Anzeigen erstellen', done: false, priority: 'hoch', category: 'Ads', due: '2025-03-20' },
    { id: 't11', companyId: null, text: 'Ads live schalten', done: false, priority: 'hoch', category: 'Ads', due: '2025-03-25' },
    { id: 't12', companyId: 'c1', text: 'Website Bar Lighthouse fertigstellen', done: false, priority: 'hoch', category: 'Projekt', due: '2025-05-01' },
    { id: 't13', companyId: 'c2', text: 'Website Ristorante Luigi fertigstellen', done: false, priority: 'hoch', category: 'Projekt', due: '2025-05-15' },
    { id: 't14', companyId: 'c3', text: 'Website Heilpraxis Weber fertigstellen', done: false, priority: 'mittel', category: 'Projekt', due: '2025-06-01' },
    { id: 't15', companyId: null, text: 'Empfehlungs-Briefing erstellen', done: false, priority: 'mittel', category: 'Vertrieb', due: '2025-04-01' },
    { id: 't16', companyId: null, text: 'Referenz-Seite auf elevo.solutions', done: false, priority: 'niedrig', category: 'Vertrieb', due: '2025-04-15' },
    { id: 't17', companyId: null, text: 'Wöchentliche Review einführen', done: false, priority: 'mittel', category: 'Admin', due: '2025-03-17' },
  ],
  sops: [
    { id: 's1', title: 'Neuer Lead – Erstansprache', steps: ['Lead recherchieren (Website, Social, Branche)', 'Personalisierte E-Mail verfassen', 'Loom-Video aufnehmen (optional)', 'E-Mail senden über Instantly', 'Follow-up in 3 Tagen einstellen', 'Aktivität loggen im Command Center'] },
    { id: 's2', title: 'Website-Projekt – Ablauf', steps: ['Kick-off Meeting', 'Inhalte & Texte sammeln', 'Design-Konzept erstellen', 'Wireframe abstimmen', 'Design umsetzen', 'Responsive optimieren', 'Inhalte einpflegen', 'SEO Basics', 'Testing & QA', 'Kunde abnehmen lassen', 'Go-Live + DNS umstellen'] },
    { id: 's3', title: 'Wöchentliche Review', steps: ['Pipeline prüfen (offene Deals, Follow-ups)', 'Outreach-Zahlen checken (Öffnungen, Antworten)', 'Ads-Performance prüfen', 'Projekte-Status updaten', 'Tasks für nächste Woche planen', 'Finanzen prüfen'] },
    { id: 's4', title: 'Tägliche Outreach-Routine', steps: ['Instantly Dashboard checken', '5 neue Leads recherchieren', '3-5 personalisierte E-Mails senden', 'Follow-ups beantworten', 'Aktivitäten loggen'] },
  ],
  outreach: {
    domains: [
      { name: 'elevo-digital.de', mailboxes: ['info@elevo-digital.de', 'hello@elevo-digital.de'], warmup: 'Aktiv' },
      { name: 'elevo-aachen.de', mailboxes: ['info@elevo-aachen.de', 'hello@elevo-aachen.de'], warmup: 'Aktiv' },
      { name: 'elevo-web.de', mailboxes: ['info@elevo-web.de', 'hello@elevo-web.de'], warmup: 'Aktiv' },
    ],
    sequences: [
      { name: 'Webdesign Cold Outreach', steps: [
        { day: 1, subject: 'Kurze Frage zu eurer Website', body: 'Personalisierter Einstieg + Loom-Link' },
        { day: 4, subject: 'Follow-up', body: 'Kurzer Nachfasser mit Mehrwert' },
        { day: 8, subject: 'Letzter Versuch', body: 'Break-up E-Mail mit CTA' },
      ]},
    ],
    lists: [
      { name: 'Gastronomie Aachen', count: 0, source: 'Outscraper' },
      { name: 'Handwerker Aachen', count: 0, source: 'Outscraper' },
      { name: 'Praxen Aachen', count: 0, source: 'Outscraper' },
    ],
    looms: [],
  },
  ads: {
    campaigns: [
      { name: 'Website erstellen Aachen', status: 'Geplant', budget: 75, clicks: 0, impressions: 0, ctr: 0, conversions: 0 },
      { name: 'Digitalisierung KMU', status: 'Geplant', budget: 75, clicks: 0, impressions: 0, ctr: 0, conversions: 0 },
    ],
    budget: 150, region: 'Aachen + 30km', excluded: ['Geilenkirchen'],
    negativeKeywords: ['kostenlos', 'gratis', 'selber machen', 'template', 'baukasten', 'wix', 'jimdo'],
  },
  finances: {
    fixcosts: [
      { name: 'Google Ads', amount: 150, category: 'Marketing' },
      { name: 'Google Workspace', amount: 36, category: 'Tools' },
      { name: 'Instantly', amount: 28, category: 'Tools' },
      { name: 'Domains', amount: 2, category: 'Infrastruktur' },
      { name: 'Outscraper', amount: 25, category: 'Tools' },
      { name: 'Loom', amount: 0, category: 'Tools' },
    ],
    revenue: [],
  },
  notes: [],
  settings: { pin: '', apiKey: '' },
};

// ============================================================================
// HOOKS
// ============================================================================
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [val, set];
}

// ============================================================================
// SHARED STYLES
// ============================================================================
const S = {
  page: { padding: '32px', maxWidth: 1400, margin: '0 auto' },
  pageTitle: { fontFamily: font.head, fontSize: 28, fontWeight: 600, color: C.text, margin: 0 },
  pageSub: { fontFamily: font.body, fontSize: 14, color: C.textDim, marginTop: 4 },
  card: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px' },
  cardHover: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'all 0.2s' },
  btn: { fontFamily: font.body, fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnGold: { background: C.gold, color: C.bg },
  btnGhost: { background: 'transparent', color: C.textDim, border: `1px solid ${C.border}` },
  input: { fontFamily: font.body, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, outline: 'none', width: '100%' },
  select: { fontFamily: font.body, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, outline: 'none' },
  label: { fontFamily: font.body, fontSize: 12, fontWeight: 500, color: C.textDim, marginBottom: 4, display: 'block' },
  badge: (bg, color) => ({ fontFamily: font.body, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: bg, color, display: 'inline-block' }),
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: font.body, fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', color: C.textDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` },
  td: { padding: '12px', borderBottom: `1px solid ${C.border}`, color: C.text },
  link: { color: C.gold, textDecoration: 'none', cursor: 'pointer' },
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: S.badge(C.goldDim, C.gold),
    green: S.badge(C.greenDim, C.green),
    red: S.badge(C.redDim, C.red),
    blue: S.badge(C.blueDim, C.blue),
    orange: S.badge(C.orangeDim, C.orange),
    purple: S.badge(C.purpleDim, C.purple),
  };
  return <span style={variants[variant] || variants.default}>{children}</span>;
};

const statusBadge = (status) => {
  const map = { Lead: 'blue', Kontakt: 'purple', Angebot: 'default', Verhandlung: 'orange', Gewonnen: 'green', Verloren: 'red', 'In Arbeit': 'blue', Planung: 'purple', Fertig: 'green', Aktiv: 'green', Geplant: 'orange', Entwicklung: 'blue' };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

const Empty = ({ text }) => (
  <div style={{ padding: 40, textAlign: 'center', color: C.textMuted, fontFamily: font.body, fontSize: 13 }}>{text}</div>
);

const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ ...S.card, position: 'relative', width, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', zIndex: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: font.head, fontSize: 22, color: C.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{React.cloneElement(Icons.x, { color: C.textDim })}</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FormRow = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

const BackButton = ({ to, label }) => {
  const nav = useNavigate();
  return (
    <button onClick={() => nav(to)} style={{ ...S.btn, ...S.btnGhost, marginBottom: 20, fontSize: 12 }}>
      {React.cloneElement(Icons.chevLeft, { size: 14 })} {label || 'Zurück'}
    </button>
  );
};

const StatCard = ({ label, value, sub, color = C.gold }) => (
  <div style={S.card}>
    <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: font.head, fontSize: 32, fontWeight: 600, color }}>{value}</div>
    {sub && <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t} onClick={() => onChange(t)} style={{ ...S.btn, background: 'none', color: active === t ? C.gold : C.textDim, borderBottom: active === t ? `2px solid ${C.gold}` : '2px solid transparent', borderRadius: 0, padding: '10px 16px', fontSize: 13 }}>{t}</button>
    ))}
  </div>
);

// ============================================================================
// GLOBAL SEARCH (Cmd+K)
// ============================================================================
const GlobalSearch = ({ data, open, onClose }) => {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lq = q.toLowerCase();
    const r = [];
    data.companies.forEach(c => { if (c.name.toLowerCase().includes(lq) || c.industry?.toLowerCase().includes(lq)) r.push({ type: 'Company', name: c.name, sub: c.industry, path: `/companies/${c.id}` }); });
    data.contacts.forEach(c => { const name = `${c.firstName} ${c.lastName}`; if (name.toLowerCase().includes(lq) || c.email?.toLowerCase().includes(lq)) r.push({ type: 'Kontakt', name, sub: c.position, path: `/contacts/${c.id}` }); });
    data.deals.forEach(d => { if (d.title.toLowerCase().includes(lq)) r.push({ type: 'Deal', name: d.title, sub: `${d.volume}€`, path: `/deals/${d.id}` }); });
    data.projects.forEach(p => { if (p.name.toLowerCase().includes(lq)) r.push({ type: 'Projekt', name: p.name, sub: p.status, path: `/projects` }); });
    data.websites.forEach(w => { if (w.name.toLowerCase().includes(lq) || w.url?.toLowerCase().includes(lq)) r.push({ type: 'Website', name: w.name, sub: w.url, path: `/websites` }); });
    return r.slice(0, 8);
  }, [q, data]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ ...S.card, position: 'relative', width: 520, maxWidth: '90vw', zIndex: 1, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
          {React.cloneElement(Icons.search, { color: C.textDim, size: 16 })}
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Suche nach Firmen, Kontakten, Deals..." style={{ ...S.input, border: 'none', background: 'transparent', padding: 0, fontSize: 14 }} />
          <kbd style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted, background: C.bgHover, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>ESC</kbd>
        </div>
        {results.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { nav(r.path); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Badge variant={r.type === 'Company' ? 'default' : r.type === 'Kontakt' ? 'blue' : r.type === 'Deal' ? 'green' : 'purple'}>{r.type}</Badge>
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{r.name}</div>
                {r.sub && <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{r.sub}</div>}
              </div>
            </div>
            ))}
          </div>
        )}
        {q && results.length === 0 && <Empty text="Keine Ergebnisse" />}
      </div>
    </div>
  );
};

// ============================================================================
// SIDEBAR + LAYOUT
// ============================================================================
const NAV = [
  { label: 'Dashboard', icon: 'dashboard', path: '/' },
  { label: 'Companies', icon: 'companies', path: '/companies' },
  { label: 'Kontakte', icon: 'contacts', path: '/contacts' },
  { label: 'Pipeline', icon: 'pipeline', path: '/pipeline' },
  { label: 'Projekte', icon: 'projects', path: '/projects' },
  { label: 'Websites', icon: 'websites', path: '/websites' },
  { label: 'Tasks', icon: 'tasks', path: '/tasks' },
  { type: 'divider' },
  { label: 'Outreach', icon: 'outreach', path: '/outreach' },
  { label: 'Google Ads', icon: 'ads', path: '/ads' },
  { type: 'divider' },
  { label: 'SOPs', icon: 'sops', path: '/sops' },
  { label: 'Finanzen', icon: 'finances', path: '/finances' },
  { label: 'Notizen', icon: 'notes', path: '/notes' },
  { type: 'divider' },
  { label: 'KI-Assistent', icon: 'ai', path: '/assistant' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const loc = useLocation();
  const isActive = (path) => path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(path);

  return (
    <aside style={{ width: collapsed ? 64 : 220, minHeight: '100vh', background: C.bgCard, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.head, fontSize: 18, fontWeight: 700, color: C.bg, flexShrink: 0 }}>E</div>
        {!collapsed && <span style={{ fontFamily: font.head, fontSize: 18, fontWeight: 600, color: C.text, letterSpacing: '0.05em' }}>ELEVO</span>}
      </div>
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.type === 'divider') return <div key={i} style={{ height: 1, background: C.border, margin: '8px 4px' }} />;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 12px' : '8px 12px', borderRadius: 8, textDecoration: 'none', background: active ? C.goldDim : 'transparent', color: active ? C.gold : C.textDim, fontFamily: font.body, fontSize: 13, fontWeight: active ? 500 : 400, transition: 'all 0.15s', marginBottom: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              {React.cloneElement(Icons[item.icon], { color: active ? C.gold : C.textDim, size: 16 })}
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '12px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <span style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted }}>v7.0 Phase 1</span>
      </div>
    </aside>
  );
};

const Topbar = ({ onSearch }) => (
  <header style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: C.bgCard }}>
    <button onClick={onSearch} style={{ ...S.btn, ...S.btnGhost, fontSize: 12, color: C.textMuted, gap: 8 }}>
      {React.cloneElement(Icons.search, { size: 14, color: C.textMuted })} Suche
      <kbd style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted, background: C.bgHover, padding: '1px 5px', borderRadius: 3, border: `1px solid ${C.border}`, marginLeft: 4 }}>⌘K</kbd>
    </button>
    <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </header>
);

// ============================================================================
// DATA CONTEXT — passed down via props for simplicity
// ============================================================================
function useAppData() {
  const [data, setData] = useLocalStorage('elevo-v7', INITIAL_DATA);

  const helpers = useMemo(() => ({
    companyContacts: (cid) => data.contacts.filter(c => c.companyId === cid),
    companyDeals: (cid) => data.deals.filter(d => d.companyId === cid),
    companyProjects: (cid) => data.projects.filter(p => p.companyId === cid),
    companyWebsites: (cid) => data.websites.filter(w => w.companyId === cid),
    companyActivities: (cid) => data.activities.filter(a => a.companyId === cid).sort((a, b) => new Date(b.date) - new Date(a.date)),
    companyTasks: (cid) => data.tasks.filter(t => t.companyId === cid),
    contactDeals: (ctid) => data.deals.filter(d => d.contactId === ctid),
    contactActivities: (ctid) => data.activities.filter(a => a.contactId === ctid).sort((a, b) => new Date(b.date) - new Date(a.date)),
    dealActivities: (did) => data.activities.filter(a => a.dealId === did).sort((a, b) => new Date(b.date) - new Date(a.date)),
    getCompany: (id) => data.companies.find(c => c.id === id),
    getContact: (id) => data.contacts.find(c => c.id === id),
    getDeal: (id) => data.deals.find(d => d.id === id),
    getProject: (id) => data.projects.find(p => p.id === id),
    overdueFollowups: () => data.deals.filter(d => d.followUp && new Date(d.followUp) < new Date() && d.status !== 'Gewonnen' && d.status !== 'Verloren'),
    pipelineValue: () => data.deals.filter(d => !['Gewonnen', 'Verloren'].includes(d.status)).reduce((s, d) => s + (d.volume || 0), 0),
    wonValue: () => data.deals.filter(d => d.status === 'Gewonnen').reduce((s, d) => s + (d.volume || 0), 0),
  }), [data]);

  const actions = useMemo(() => ({
    addCompany: (c) => setData(d => ({ ...d, companies: [...d.companies, { ...c, id: uid(), created: new Date().toISOString().slice(0, 10) }] })),
    updateCompany: (id, upd) => setData(d => ({ ...d, companies: d.companies.map(c => c.id === id ? { ...c, ...upd } : c) })),
    deleteCompany: (id) => setData(d => ({ ...d, companies: d.companies.filter(c => c.id !== id), contacts: d.contacts.filter(c => c.companyId !== id), deals: d.deals.filter(dd => dd.companyId !== id), activities: d.activities.filter(a => a.companyId !== id) })),
    addContact: (c) => setData(d => ({ ...d, contacts: [...d.contacts, { ...c, id: uid(), lastContact: new Date().toISOString().slice(0, 10) }] })),
    updateContact: (id, upd) => setData(d => ({ ...d, contacts: d.contacts.map(c => c.id === id ? { ...c, ...upd } : c) })),
    deleteContact: (id) => setData(d => ({ ...d, contacts: d.contacts.filter(c => c.id !== id) })),
    addDeal: (deal) => {
      const id = uid();
      setData(d => ({
        ...d,
        deals: [...d.deals, { ...deal, id, created: new Date().toISOString().slice(0, 10) }],
        activities: [...d.activities, { id: uid(), companyId: deal.companyId, contactId: deal.contactId, dealId: id, type: 'Notiz', subject: 'Deal erstellt', content: `Deal "${deal.title}" wurde erstellt.`, date: new Date().toISOString() }],
      }));
      return id;
    },
    updateDeal: (id, upd) => setData(d => ({ ...d, deals: d.deals.map(dd => dd.id === id ? { ...dd, ...upd } : dd) })),
    deleteDeal: (id) => setData(d => ({ ...d, deals: d.deals.filter(dd => dd.id !== id) })),
    addActivity: (a) => {
      const act = { ...a, id: uid(), date: a.date || new Date().toISOString() };
      setData(d => {
        const next = { ...d, activities: [...d.activities, act] };
        if (act.contactId) {
          next.contacts = d.contacts.map(c => c.id === act.contactId ? { ...c, lastContact: new Date().toISOString().slice(0, 10) } : c);
        }
        return next;
      });
    },
    addProject: (p) => setData(d => ({ ...d, projects: [...d.projects, { ...p, id: uid() }] })),
    updateProject: (id, upd) => setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...upd } : p) })),
    addWebsite: (w) => setData(d => ({ ...d, websites: [...d.websites, { ...w, id: uid() }] })),
    updateWebsite: (id, upd) => setData(d => ({ ...d, websites: d.websites.map(w => w.id === id ? { ...w, ...upd } : w) })),
    addTask: (t) => setData(d => ({ ...d, tasks: [...d.tasks, { ...t, id: uid(), done: false }] })),
    updateTask: (id, upd) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, ...upd } : t) })),
    toggleTask: (id) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
    deleteTask: (id) => setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) })),
    addNote: (n) => setData(d => ({ ...d, notes: [...d.notes, { ...n, id: uid(), created: new Date().toISOString() }] })),
    deleteNote: (id) => setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== id) })),
    updateOutreach: (upd) => setData(d => ({ ...d, outreach: { ...d.outreach, ...upd } })),
    updateAds: (upd) => setData(d => ({ ...d, ads: { ...d.ads, ...upd } })),
    updateFinances: (upd) => setData(d => ({ ...d, finances: { ...d.finances, ...upd } })),
    updateSettings: (upd) => setData(d => ({ ...d, settings: { ...d.settings, ...upd } })),
    resetData: () => { localStorage.removeItem('elevo-v7'); window.location.reload(); },
    exportData: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `elevo-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    },
    importData: (json) => { try { setData(JSON.parse(json)); return true; } catch { return false; } },
  }), [data, setData]);

  return { data, helpers, actions };
}

// ============================================================================
// ACTIVITY TIMELINE COMPONENT
// ============================================================================
const ActivityTimeline = ({ activities }) => {
  if (!activities.length) return <Empty text="Noch keine Aktivitäten" />;
  const iconMap = { 'Anruf': Icons.phone, 'E-Mail': Icons.mail, 'Loom': Icons.video, 'Meeting': Icons.calendar, 'Notiz': Icons.notes, 'Follow-up': Icons.clock, 'Sonstiges': Icons.edit };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {activities.map(a => (
        <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {React.cloneElement(iconMap[a.type] || Icons.edit, { size: 14, color: C.gold })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text }}>{a.subject}</span>
              <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date(a.date).toLocaleDateString('de-DE')} {new Date(a.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginTop: 2 }}>{a.content}</div>
            <Badge variant={a.type === 'E-Mail' ? 'blue' : a.type === 'Anruf' ? 'green' : a.type === 'Meeting' ? 'purple' : 'default'}>{a.type}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// QUICK LOG ACTIVITY MODAL
// ============================================================================
const QuickLogModal = ({ open, onClose, companyId, contactId, dealId, contacts, deals, actions }) => {
  const [form, setForm] = useState({ type: 'Anruf', subject: '', content: '', contactId: contactId || '', dealId: dealId || '' });
  useEffect(() => { if (open) setForm({ type: 'Anruf', subject: '', content: '', contactId: contactId || '', dealId: dealId || '' }); }, [open, contactId, dealId]);

  const save = () => {
    if (!form.subject.trim()) return;
    actions.addActivity({ companyId, contactId: form.contactId || null, dealId: form.dealId || null, type: form.type, subject: form.subject, content: form.content });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Aktivität loggen">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormRow label="Typ">
          <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormRow>
        {contacts && <FormRow label="Kontakt">
          <select style={S.select} value={form.contactId} onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))}>
            <option value="">– Kein Kontakt –</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
        </FormRow>}
      </div>
      <FormRow label="Betreff">
        <input style={S.input} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="z.B. Anruf wegen Angebot" />
      </FormRow>
      <FormRow label="Details">
        <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Optional..." />
      </FormRow>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
        <button onClick={save} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
      </div>
    </Modal>
  );
};

// ============================================================================
// PAGES — DASHBOARD
// ============================================================================
const Dashboard = ({ data, helpers, actions }) => {
  const overdue = helpers.overdueFollowups();
  const openDeals = data.deals.filter(d => !['Gewonnen', 'Verloren'].includes(d.status));
  const openTasks = data.tasks.filter(t => !t.done);
  const recentActs = [...data.activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={S.pageTitle}>Command Center</h1>
        <p style={S.pageSub}>Willkommen zurück. Hier ist dein Überblick.</p>
      </div>

      {overdue.length > 0 && (
        <div style={{ ...S.card, background: C.orangeDim, borderColor: C.orange, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          {Icons.alert}
          <div>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.orange }}>{overdue.length} überfällige Follow-up{overdue.length > 1 ? 's' : ''}</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.text, marginTop: 2 }}>
              {overdue.map(d => d.title).join(', ')}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Pipeline-Wert" value={`${helpers.pipelineValue().toLocaleString('de-DE')}€`} sub={`${openDeals.length} offene Deals`} />
        <StatCard label="Gewonnen" value={`${helpers.wonValue().toLocaleString('de-DE')}€`} color={C.green} />
        <StatCard label="Companies" value={data.companies.length} sub={`${data.contacts.length} Kontakte`} color={C.blue} />
        <StatCard label="Offene Tasks" value={openTasks.length} sub={`von ${data.tasks.length} gesamt`} color={C.orange} />
        <StatCard label="Fixkosten" value={`${data.finances.fixcosts.reduce((s, f) => s + f.amount, 0)}€`} sub="pro Monat" color={C.red} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 16px' }}>Offene Deals</h3>
          {openDeals.length === 0 ? <Empty text="Keine offenen Deals" /> : openDeals.map(d => {
            const comp = helpers.getCompany(d.companyId);
            return (
              <Link key={d.id} to={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{d.title}</div>
                  <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{comp?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.gold }}>{d.volume?.toLocaleString('de-DE')}€</div>
                  {statusBadge(d.status)}
                </div>
              </Link>
            );
          })}
        </div>

        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 16px' }}>Letzte Aktivitäten</h3>
          {recentActs.length === 0 ? <Empty text="Keine Aktivitäten" /> :
            recentActs.map(a => {
              const comp = helpers.getCompany(a.companyId);
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{a.subject}</div>
                    <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{comp?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge>{a.type}</Badge>
                    <div style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted, marginTop: 2 }}>{new Date(a.date).toLocaleDateString('de-DE')}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ ...S.card, marginTop: 20 }}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 16px' }}>Projekte</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {data.projects.map(p => {
            const comp = helpers.getCompany(p.companyId);
            return (
              <div key={p.id} style={{ ...S.card, padding: 14 }}>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text }}>{p.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, marginBottom: 8 }}>{comp?.name} • {p.deadline && `Deadline: ${new Date(p.deadline).toLocaleDateString('de-DE')}`}</div>
                <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: p.progress >= 75 ? C.green : C.gold, borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: font.body, fontSize: 10, color: C.textDim }}>{p.progress}%</span>
                  {statusBadge(p.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGES — COMPANIES
// ============================================================================
const Companies = ({ data, helpers, actions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '', address: '', size: '', source: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.companies.filter(c => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q));
  }, [data.companies, search]);

  const save = () => {
    if (!form.name.trim()) return;
    actions.addCompany({ ...form, tags: [] });
    setShowAdd(false);
    setForm({ name: '', industry: '', website: '', email: '', phone: '', address: '', size: '', source: '' });
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>Companies</h1>
          <p style={S.pageSub}>{data.companies.length} Firmen</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neue Firma</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...S.input, maxWidth: 320 }} placeholder="Firmen durchsuchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Firma</th><th style={S.th}>Branche</th><th style={S.th}>Ort</th><th style={S.th}>Kontakte</th><th style={S.th}>Deals</th><th style={S.th}>Volumen</th><th style={S.th}>Quelle</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => {
              const cts = helpers.companyContacts(c.id);
              const dls = helpers.companyDeals(c.id);
              const vol = dls.reduce((s, d) => s + (d.volume || 0), 0);
              return (
                <tr key={c.id} style={{ cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={S.td}><Link to={`/companies/${c.id}`} style={{ ...S.link, fontWeight: 500 }}>{c.name}</Link></td>
                  <td style={S.td}><span style={{ color: C.textDim }}>{c.industry}</span></td>
                  <td style={S.td}><span style={{ color: C.textDim }}>{c.address}</span></td>
                  <td style={S.td}><Badge variant="blue">{cts.length}</Badge></td>
                  <td style={S.td}><Badge variant="purple">{dls.length}</Badge></td>
                  <td style={{ ...S.td, fontWeight: 500, color: vol > 0 ? C.gold : C.textDim }}>{vol > 0 ? `${vol.toLocaleString('de-DE')}€` : '–'}</td>
                  <td style={S.td}>{statusBadge(c.source)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty text="Keine Firmen gefunden" />}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neue Firma">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Firmenname *"><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="Branche"><input style={S.input} value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></FormRow>
          <FormRow label="Website"><input style={S.input} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></FormRow>
          <FormRow label="Ort"><input style={S.input} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></FormRow>
          <FormRow label="Größe"><select style={S.select} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}><option value="">–</option><option>Klein</option><option>KMU</option><option>Mittelstand</option><option>Groß</option></select></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Referenz</option><option>Direkt</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={save} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — COMPANY DETAIL (360°)
// ============================================================================
const CompanyDetail = ({ data, helpers, actions }) => {
  const { id } = useParams();
  const company = helpers.getCompany(id);
  const [tab, setTab] = useState('Übersicht');
  const [logOpen, setLogOpen] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [ctForm, setCtForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', source: '' });
  const [dlForm, setDlForm] = useState({ title: '', contactId: '', status: 'Lead', service: 'Website', volume: '', source: '', followUp: '', notes: '' });

  if (!company) return <div style={S.page}><BackButton to="/companies" label="Zurück zu Companies" /><Empty text="Firma nicht gefunden" /></div>;

  const contacts = helpers.companyContacts(id);
  const deals = helpers.companyDeals(id);
  const projects = helpers.companyProjects(id);
  const websites = helpers.companyWebsites(id);
  const activities = helpers.companyActivities(id);
  const tasks = helpers.companyTasks(id);

  const saveContact = () => {
    if (!ctForm.firstName.trim()) return;
    actions.addContact({ ...ctForm, companyId: id, tags: [] });
    setShowAddContact(false); setCtForm({ firstName: '', lastName: '', email: '', phone: '', position: '', source: '' });
  };

  const saveDeal = () => {
    if (!dlForm.title.trim()) return;
    actions.addDeal({ ...dlForm, companyId: id, volume: Number(dlForm.volume) || 0 });
    setShowAddDeal(false); setDlForm({ title: '', contactId: '', status: 'Lead', service: 'Website', volume: '', source: '', followUp: '', notes: '' });
  };

  return (
    <div style={S.page}>
      <BackButton to="/companies" label="Zurück zu Companies" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>{company.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {company.industry && <Badge>{company.industry}</Badge>}
            {company.address && <Badge variant="blue">{company.address}</Badge>}
            {company.source && <Badge variant="purple">{company.source}</Badge>}
          </div>
        </div>
        <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Kontakte" value={contacts.length} color={C.blue} />
        <StatCard label="Deals" value={deals.length} color={C.purple} />
        <StatCard label="Volumen" value={`${deals.reduce((s, d) => s + (d.volume || 0), 0).toLocaleString('de-DE')}€`} />
        <StatCard label="Projekte" value={projects.length} color={C.green} />
      </div>

      <Tabs tabs={['Übersicht', 'Aktivitäten', 'Deals', 'Kontakte', 'Projekte']} active={tab} onChange={setTab} />

      {tab === 'Übersicht' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={S.card}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Details</h3>
            {[['Website', company.website], ['E-Mail', company.email], ['Telefon', company.phone], ['Größe', company.size], ['Erstellt', company.created && new Date(company.created).toLocaleDateString('de-DE')]].map(([l, v]) => v ? (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.text }}>{v}</span>
              </div>
            ) : null)}
          </div>
          <div style={S.card}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Letzte Aktivitäten</h3>
            <ActivityTimeline activities={activities.slice(0, 5)} />
          </div>
        </div>
      )}

      {tab === 'Aktivitäten' && (
        <div style={S.card}>
          <ActivityTimeline activities={activities} />
        </div>
      )}

      {tab === 'Deals' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Deals</h3>
            <button onClick={() => setShowAddDeal(true)} style={{ ...S.btn, ...S.btnGold, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Deal</button>
          </div>
          {deals.length === 0 ? <Empty text="Keine Deals" /> : (
            <table style={S.table}><thead><tr><th style={S.th}>Deal</th><th style={S.th}>Status</th><th style={S.th}>Service</th><th style={S.th}>Volumen</th><th style={S.th}>Kontakt</th></tr></thead>
              <tbody>{deals.map(d => {
                const ct = helpers.getContact(d.contactId);
                return <tr key={d.id}><td style={S.td}><Link to={`/deals/${d.id}`} style={S.link}>{d.title}</Link></td><td style={S.td}>{statusBadge(d.status)}</td><td style={{ ...S.td, color: C.textDim }}>{d.service}</td><td style={{ ...S.td, fontWeight: 500, color: C.gold }}>{d.volume?.toLocaleString('de-DE')}€</td><td style={S.td}>{ct && <Link to={`/contacts/${ct.id}`} style={S.link}>{ct.firstName} {ct.lastName}</Link>}</td></tr>;
              })}</tbody></table>
          )}
        </div>
      )}

      {tab === 'Kontakte' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Kontakte</h3>
            <button onClick={() => setShowAddContact(true)} style={{ ...S.btn, ...S.btnGold, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Kontakt</button>
          </div>
          {contacts.length === 0 ? <Empty text="Keine Kontakte" /> : (
            <table style={S.table}><thead><tr><th style={S.th}>Name</th><th style={S.th}>Position</th><th style={S.th}>E-Mail</th><th style={S.th}>Letzter Kontakt</th></tr></thead>
              <tbody>{contacts.map(c => (
                <tr key={c.id}><td style={S.td}><Link to={`/contacts/${c.id}`} style={S.link}>{c.firstName} {c.lastName}</Link></td><td style={{ ...S.td, color: C.textDim }}>{c.position}</td><td style={{ ...S.td, color: C.textDim }}>{c.email}</td><td style={{ ...S.td, color: C.textDim }}>{c.lastContact && new Date(c.lastContact).toLocaleDateString('de-DE')}</td></tr>
              ))}</tbody></table>
          )}
        </div>
      )}

      {tab === 'Projekte' && (
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 16px' }}>Projekte & Websites</h3>
          {projects.length === 0 ? <Empty text="Keine Projekte" /> : projects.map(p => {
            const ws = websites.filter(w => w.projectId === p.id);
            return (
              <div key={p.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text }}>{p.name}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{statusBadge(p.status)}<span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{p.progress}%</span></div>
                </div>
                <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 6 }}><div style={{ height: '100%', width: `${p.progress}%`, background: C.gold, borderRadius: 2 }} /></div>
                {ws.map(w => <div key={w.id} style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginTop: 4 }}>🌐 {w.url} — {w.status}</div>)}
              </div>
            );
          })}
        </div>
      )}

      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} companyId={id} contacts={contacts} deals={deals} actions={actions} />

      <Modal open={showAddContact} onClose={() => setShowAddContact(false)} title="Neuer Kontakt">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Vorname *"><input style={S.input} value={ctForm.firstName} onChange={e => setCtForm(f => ({ ...f, firstName: e.target.value }))} /></FormRow>
          <FormRow label="Nachname"><input style={S.input} value={ctForm.lastName} onChange={e => setCtForm(f => ({ ...f, lastName: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={ctForm.email} onChange={e => setCtForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={ctForm.phone} onChange={e => setCtForm(f => ({ ...f, phone: e.target.value }))} /></FormRow>
          <FormRow label="Position"><input style={S.input} value={ctForm.position} onChange={e => setCtForm(f => ({ ...f, position: e.target.value }))} /></FormRow>
          <FormRow label="Quelle"><input style={S.input} value={ctForm.source} onChange={e => setCtForm(f => ({ ...f, source: e.target.value }))} /></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAddContact(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveContact} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
      </Modal>

      <Modal open={showAddDeal} onClose={() => setShowAddDeal(false)} title="Neuer Deal">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Deal-Titel *"><input style={S.input} value={dlForm.title} onChange={e => setDlForm(f => ({ ...f, title: e.target.value }))} /></FormRow>
          <FormRow label="Kontakt"><select style={S.select} value={dlForm.contactId} onChange={e => setDlForm(f => ({ ...f, contactId: e.target.value }))}><option value="">–</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</select></FormRow>
          <FormRow label="Service"><select style={S.select} value={dlForm.service} onChange={e => setDlForm(f => ({ ...f, service: e.target.value }))}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></FormRow>
          <FormRow label="Volumen (€)"><input style={S.input} type="number" value={dlForm.volume} onChange={e => setDlForm(f => ({ ...f, volume: e.target.value }))} /></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={dlForm.source} onChange={e => setDlForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Direkt</option></select></FormRow>
          <FormRow label="Follow-up"><input style={S.input} type="date" value={dlForm.followUp} onChange={e => setDlForm(f => ({ ...f, followUp: e.target.value }))} /></FormRow>
        </div>
        <FormRow label="Notizen"><textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={dlForm.notes} onChange={e => setDlForm(f => ({ ...f, notes: e.target.value }))} /></FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAddDeal(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveDeal} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — CONTACTS
// ============================================================================
const Contacts = ({ data, helpers, actions }) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q));
  }, [data.contacts, search]);

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Kontakte</h1><p style={S.pageSub}>{data.contacts.length} Kontakte</p></div>
      </div>
      <div style={{ marginBottom: 16 }}><input style={{ ...S.input, maxWidth: 320 }} placeholder="Kontakte durchsuchen..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Name</th><th style={S.th}>Firma</th><th style={S.th}>Position</th><th style={S.th}>E-Mail</th><th style={S.th}>Letzter Kontakt</th><th style={S.th}>Deals</th></tr></thead>
          <tbody>{filtered.map(c => {
            const comp = helpers.getCompany(c.companyId);
            const dls = helpers.contactDeals(c.id);
            return (
              <tr key={c.id} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={S.td}><Link to={`/contacts/${c.id}`} style={{ ...S.link, fontWeight: 500 }}>{c.firstName} {c.lastName}</Link></td>
                <td style={S.td}>{comp && <Link to={`/companies/${comp.id}`} style={S.link}>{comp.name}</Link>}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.position}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.email}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.lastContact && new Date(c.lastContact).toLocaleDateString('de-DE')}</td>
                <td style={S.td}><Badge variant="purple">{dls.length}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
        {filtered.length === 0 && <Empty text="Keine Kontakte gefunden" />}
      </div>
    </div>
  );
};

// ============================================================================
// PAGES — CONTACT DETAIL
// ============================================================================
const ContactDetail = ({ data, helpers, actions }) => {
  const { id } = useParams();
  const contact = helpers.getContact(id);
  const [logOpen, setLogOpen] = useState(false);

  if (!contact) return <div style={S.page}><BackButton to="/contacts" /><Empty text="Kontakt nicht gefunden" /></div>;

  const company = helpers.getCompany(contact.companyId);
  const deals = helpers.contactDeals(id);
  const activities = helpers.contactActivities(id);

  return (
    <div style={S.page}>
      <BackButton to="/contacts" label="Zurück zu Kontakte" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>{contact.firstName} {contact.lastName}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {contact.position && <Badge>{contact.position}</Badge>}
            {company && <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none' }}><Badge variant="blue">{company.name}</Badge></Link>}
          </div>
        </div>
        <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Details</h3>
          {[['E-Mail', contact.email], ['Telefon', contact.phone], ['Quelle', contact.source], ['Letzter Kontakt', contact.lastContact && new Date(contact.lastContact).toLocaleDateString('de-DE')]].map(([l, v]) => v ? (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l}</span>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.text }}>{v}</span>
            </div>
          ) : null)}
          <h4 style={{ fontFamily: font.head, fontSize: 16, color: C.text, margin: '16px 0 10px' }}>Deals</h4>
          {deals.length === 0 ? <Empty text="Keine Deals" /> : deals.map(d => (
            <Link key={d.id} to={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
              <span style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{d.title}</span>
              <span style={{ fontFamily: font.body, fontSize: 13, color: C.gold, fontWeight: 500 }}>{d.volume?.toLocaleString('de-DE')}€</span>
            </Link>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Aktivitäten</h3>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} companyId={contact.companyId} contactId={id} deals={deals} actions={actions} />
    </div>
  );
};

// ============================================================================
// PAGES — PIPELINE (Kanban)
// ============================================================================
const Pipeline = ({ data, helpers, actions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [dlForm, setDlForm] = useState({ title: '', companyId: '', contactId: '', status: 'Lead', service: 'Website', volume: '', source: '', followUp: '', notes: '' });
  const availableContacts = useMemo(() => dlForm.companyId ? helpers.companyContacts(dlForm.companyId) : [], [dlForm.companyId, data.contacts]);

  const saveDeal = () => {
    if (!dlForm.title.trim() || !dlForm.companyId) return;
    actions.addDeal({ ...dlForm, volume: Number(dlForm.volume) || 0 });
    setShowAdd(false); setDlForm({ title: '', companyId: '', contactId: '', status: 'Lead', service: 'Website', volume: '', source: '', followUp: '', notes: '' });
  };

  const activeStages = DEAL_STAGES.filter(s => s !== 'Verloren');

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Pipeline</h1><p style={S.pageSub}>{data.deals.length} Deals • {helpers.pipelineValue().toLocaleString('de-DE')}€ offen</p></div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neuer Deal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeStages.length}, 1fr)`, gap: 12, overflowX: 'auto' }}>
        {activeStages.map(stage => {
          const stageDeals = data.deals.filter(d => d.status === stage);
          const stageVal = stageDeals.reduce((s, d) => s + (d.volume || 0), 0);
          return (
            <div key={stage} style={{ minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
                <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage}</span>
                <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{stageVal > 0 ? `${stageVal.toLocaleString('de-DE')}€` : '–'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageDeals.map(d => {
                  const comp = helpers.getCompany(d.companyId);
                  const isOverdue = d.followUp && new Date(d.followUp) < new Date();
                  return (
                    <Link key={d.id} to={`/deals/${d.id}`} style={{ ...S.cardHover, textDecoration: 'none', borderLeft: isOverdue ? `3px solid ${C.orange}` : `3px solid ${C.border}` }}>
                      <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{d.title}</div>
                      <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{comp?.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.gold }}>{d.volume?.toLocaleString('de-DE')}€</span>
                        {isOverdue && <Badge variant="orange">Überfällig</Badge>}
                      </div>
                    </Link>
                  );
                })}
                {stageDeals.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontFamily: font.body, fontSize: 11, border: `1px dashed ${C.border}`, borderRadius: 8 }}>Keine Deals</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neuer Deal" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Deal-Titel *"><input style={S.input} value={dlForm.title} onChange={e => setDlForm(f => ({ ...f, title: e.target.value }))} /></FormRow>
          <FormRow label="Firma *">
            <select style={S.select} value={dlForm.companyId} onChange={e => setDlForm(f => ({ ...f, companyId: e.target.value, contactId: '' }))}>
              <option value="">– Firma wählen –</option>
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormRow>
          <FormRow label="Kontakt">
            <select style={S.select} value={dlForm.contactId} onChange={e => setDlForm(f => ({ ...f, contactId: e.target.value }))} disabled={!dlForm.companyId}>
              <option value="">– Kontakt wählen –</option>
              {availableContacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </FormRow>
          <FormRow label="Service"><select style={S.select} value={dlForm.service} onChange={e => setDlForm(f => ({ ...f, service: e.target.value }))}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></FormRow>
          <FormRow label="Volumen (€)"><input style={S.input} type="number" value={dlForm.volume} onChange={e => setDlForm(f => ({ ...f, volume: e.target.value }))} /></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={dlForm.source} onChange={e => setDlForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Direkt</option></select></FormRow>
          <FormRow label="Follow-up"><input style={S.input} type="date" value={dlForm.followUp} onChange={e => setDlForm(f => ({ ...f, followUp: e.target.value }))} /></FormRow>
          <FormRow label="Status"><select style={S.select} value={dlForm.status} onChange={e => setDlForm(f => ({ ...f, status: e.target.value }))}>{DEAL_STAGES.map(s => <option key={s}>{s}</option>)}</select></FormRow>
        </div>
        <FormRow label="Notizen"><textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={dlForm.notes} onChange={e => setDlForm(f => ({ ...f, notes: e.target.value }))} /></FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveDeal} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — DEAL DETAIL
// ============================================================================
const DealDetail = ({ data, helpers, actions }) => {
  const { id } = useParams();
  const deal = helpers.getDeal(id);
  const [logOpen, setLogOpen] = useState(false);

  if (!deal) return <div style={S.page}><BackButton to="/pipeline" /><Empty text="Deal nicht gefunden" /></div>;

  const company = helpers.getCompany(deal.companyId);
  const contact = helpers.getContact(deal.contactId);
  const activities = helpers.dealActivities(id);

  const changeStage = (stage) => {
    actions.updateDeal(id, { status: stage });
    actions.addActivity({ companyId: deal.companyId, contactId: deal.contactId, dealId: id, type: 'Notiz', subject: `Stage → ${stage}`, content: `Deal wurde auf "${stage}" verschoben.` });
  };

  return (
    <div style={S.page}>
      <BackButton to="/pipeline" label="Zurück zur Pipeline" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>{deal.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {company && <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none' }}><Badge>{company.name}</Badge></Link>}
            {contact && <Link to={`/contacts/${contact.id}`} style={{ textDecoration: 'none' }}><Badge variant="blue">{contact.firstName} {contact.lastName}</Badge></Link>}
            <Badge variant="green">{deal.volume?.toLocaleString('de-DE')}€</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div style={{ ...S.card, marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Deal-Stage</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {DEAL_STAGES.map(stage => {
            const isActive = deal.status === stage;
            const isPast = DEAL_STAGES.indexOf(stage) < DEAL_STAGES.indexOf(deal.status);
            const isWon = stage === 'Gewonnen';
            const isLost = stage === 'Verloren';
            return (
              <button key={stage} onClick={() => changeStage(stage)} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: isActive ? `2px solid ${isWon ? C.green : isLost ? C.red : C.gold}` : `1px solid ${C.border}`, background: isActive ? (isWon ? C.greenDim : isLost ? C.redDim : C.goldDim) : isPast ? C.bgHover : 'transparent', color: isActive ? (isWon ? C.green : isLost ? C.red : C.gold) : isPast ? C.text : C.textMuted, fontFamily: font.body, fontSize: 12, fontWeight: isActive ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['Anruf', Icons.phone, C.green], ['E-Mail', Icons.mail, C.blue], ['Loom', Icons.video, C.purple], ['Meeting', Icons.calendar, C.orange]].map(([type, icon, col]) => (
          <button key={type} onClick={() => { actions.addActivity({ companyId: deal.companyId, contactId: deal.contactId, dealId: id, type, subject: `${type} geloggt`, content: `Schnell-Log: ${type}` }); }} style={{ ...S.btn, ...S.btnGhost, borderColor: col, color: col }}>
            {React.cloneElement(icon, { size: 14, color: col })} {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Details</h3>
          {[['Service', deal.service], ['Quelle', deal.source], ['Follow-up', deal.followUp && new Date(deal.followUp).toLocaleDateString('de-DE')], ['Erstellt', deal.created && new Date(deal.created).toLocaleDateString('de-DE')]].map(([l, v]) => v ? (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l}</span>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.text }}>{v}</span>
            </div>
          ) : null)}
          {deal.notes && <div style={{ marginTop: 12, fontFamily: font.body, fontSize: 12, color: C.textDim, padding: 10, background: C.bgHover, borderRadius: 6 }}>{deal.notes}</div>}
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Aktivitäten</h3>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} companyId={deal.companyId} contactId={deal.contactId} dealId={id} contacts={company ? helpers.companyContacts(company.id) : []} deals={[deal]} actions={actions} />
    </div>
  );
};

// ============================================================================
// PAGES — PROJECTS
// ============================================================================
const Projects = ({ data, helpers, actions }) => (
  <div style={S.page}>
    <h1 style={S.pageTitle}>Projekte</h1>
    <p style={{ ...S.pageSub, marginBottom: 24 }}>{data.projects.length} Projekte</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      {data.projects.map(p => {
        const comp = helpers.getCompany(p.companyId);
        const ws = data.websites.filter(w => w.projectId === p.id);
        return (
          <div key={p.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 500, color: C.text }}>{p.name}</span>
              {statusBadge(p.status)}
            </div>
            {comp && <Link to={`/companies/${comp.id}`} style={{ ...S.link, fontSize: 12 }}>{comp.name}</Link>}
            <div style={{ height: 4, background: C.border, borderRadius: 2, margin: '12px 0 6px' }}><div style={{ height: '100%', width: `${p.progress}%`, background: p.progress >= 75 ? C.green : C.gold, borderRadius: 2 }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{p.progress}% abgeschlossen</span>
              {p.deadline && <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{new Date(p.deadline).toLocaleDateString('de-DE')}</span>}
            </div>
            {ws.map(w => <div key={w.id} style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, marginTop: 6 }}>🌐 {w.url}</div>)}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {[0, 25, 50, 75, 100].map(v => (
                <button key={v} onClick={() => actions.updateProject(p.id, { progress: v, status: v === 100 ? 'Fertig' : v > 0 ? 'In Arbeit' : 'Planung' })} style={{ ...S.btn, padding: '4px 8px', fontSize: 10, ...(p.progress === v ? S.btnGold : S.btnGhost) }}>{v}%</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// PAGES — WEBSITES
// ============================================================================
const Websites = ({ data, helpers }) => (
  <div style={S.page}>
    <h1 style={S.pageTitle}>Websites</h1>
    <p style={{ ...S.pageSub, marginBottom: 24 }}>{data.websites.length} Websites</p>
    <div style={S.card}>
      <table style={S.table}><thead><tr><th style={S.th}>Name</th><th style={S.th}>URL</th><th style={S.th}>Firma</th><th style={S.th}>Status</th><th style={S.th}>Hosting</th><th style={S.th}>Footer-Link</th></tr></thead>
        <tbody>{data.websites.map(w => {
          const comp = helpers.getCompany(w.companyId);
          return <tr key={w.id}><td style={S.td}>{w.name}</td><td style={{ ...S.td, color: C.gold }}>{w.url}</td><td style={S.td}>{comp && <Link to={`/companies/${comp.id}`} style={S.link}>{comp.name}</Link>}</td><td style={S.td}>{statusBadge(w.status)}</td><td style={{ ...S.td, color: C.textDim }}>{w.hosting}</td><td style={S.td}>{w.footerLink ? '✓' : '–'}</td></tr>;
        })}</tbody></table>
    </div>
  </div>
);

// ============================================================================
// PAGES — TASKS
// ============================================================================
const Tasks = ({ data, actions }) => {
  const [filter, setFilter] = useState('Alle');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text: '', priority: 'mittel', category: 'Admin', due: '' });

  const cats = ['Alle', ...TASK_CATEGORIES];
  const filtered = filter === 'Alle' ? data.tasks : data.tasks.filter(t => t.category === filter);
  const sorted = [...filtered].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));

  const save = () => {
    if (!form.text.trim()) return;
    actions.addTask(form);
    setShowAdd(false); setForm({ text: '', priority: 'mittel', category: 'Admin', due: '' });
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Tasks</h1><p style={S.pageSub}>{data.tasks.filter(t => !t.done).length} offen von {data.tasks.length}</p></div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnGold }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Task</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} style={{ ...S.btn, padding: '6px 12px', fontSize: 12, ...(filter === c ? S.btnGold : S.btnGhost) }}>{c}</button>)}
      </div>
      <div style={S.card}>
        {sorted.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: `1px solid ${C.border}`, opacity: t.done ? 0.5 : 1 }}>
            <button onClick={() => actions.toggleTask(t.id)} style={{ width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${t.done ? C.green : C.border}`, background: t.done ? C.greenDim : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {t.done && React.cloneElement(Icons.check, { size: 12, color: C.green })}
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: font.body, fontSize: 13, color: C.text, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </div>
            <Badge variant={t.priority === 'hoch' ? 'red' : t.priority === 'mittel' ? 'orange' : 'default'}>{t.priority}</Badge>
            <Badge variant="purple">{t.category}</Badge>
            {t.due && <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date(t.due).toLocaleDateString('de-DE')}</span>}
            <button onClick={() => actions.deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>{React.cloneElement(Icons.trash, { size: 14, color: C.textMuted })}</button>
          </div>
        ))}
        {sorted.length === 0 && <Empty text="Keine Tasks" />}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neuer Task">
        <FormRow label="Aufgabe *"><input style={S.input} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormRow label="Priorität"><select style={S.select} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option>niedrig</option><option>mittel</option><option>hoch</option></select></FormRow>
          <FormRow label="Kategorie"><select style={S.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></FormRow>
          <FormRow label="Fällig"><input style={S.input} type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} /></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={save} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PLACEHOLDER PAGES (to be expanded in Part 2)
// ============================================================================
const PlaceholderPage = ({ title, icon, children }) => (
  <div style={S.page}>
    <h1 style={S.pageTitle}>{title}</h1>
    <div style={{ marginTop: 20 }}>{children}</div>
  </div>
);

const Outreach = ({ data }) => (
  <PlaceholderPage title="Cold Outreach">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      <div style={S.card}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Domains & Postfächer</h3>
        {data.outreach.domains.map((d, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text }}>{d.name}</div>
            <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{d.mailboxes.join(', ')}</div>
            <Badge variant="green">{d.warmup}</Badge>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Sequenzen</h3>
        {data.outreach.sequences.map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>{s.name}</div>
            {s.steps.map((st, j) => (
              <div key={j} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontFamily: font.body, fontSize: 12, color: C.textDim }}>
                Tag {st.day}: {st.subject}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Kontaktlisten</h3>
        {data.outreach.lists.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{l.name}</span>
            <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l.count} Kontakte • {l.source}</span>
          </div>
        ))}
      </div>
    </div>
  </PlaceholderPage>
);

const Ads = ({ data }) => (
  <PlaceholderPage title="Google Ads">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
      <StatCard label="Budget" value={`${data.ads.budget}€`} sub="pro Monat" />
      <StatCard label="Region" value={data.ads.region} sub={`Ausgeschlossen: ${data.ads.excluded.join(', ')}`} color={C.blue} />
    </div>
    <div style={S.card}>
      <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Kampagnen</h3>
      <table style={S.table}><thead><tr><th style={S.th}>Kampagne</th><th style={S.th}>Status</th><th style={S.th}>Budget</th><th style={S.th}>Klicks</th><th style={S.th}>Impressions</th><th style={S.th}>CTR</th><th style={S.th}>Conv.</th></tr></thead>
        <tbody>{data.ads.campaigns.map((c, i) => (
          <tr key={i}><td style={S.td}>{c.name}</td><td style={S.td}>{statusBadge(c.status)}</td><td style={{ ...S.td, color: C.gold }}>{c.budget}€</td><td style={S.td}>{c.clicks}</td><td style={S.td}>{c.impressions}</td><td style={S.td}>{c.ctr}%</td><td style={S.td}>{c.conversions}</td></tr>
        ))}</tbody></table>
    </div>
    <div style={{ ...S.card, marginTop: 16 }}>
      <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Negative Keywords</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {data.ads.negativeKeywords.map((k, i) => <Badge key={i} variant="red">{k}</Badge>)}
      </div>
    </div>
  </PlaceholderPage>
);

const SOPs = ({ data }) => (
  <PlaceholderPage title="SOPs">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      {data.sops.map(s => (
        <div key={s.id} style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>{s.title}</h3>
          {s.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: font.body, fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{step}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </PlaceholderPage>
);

const Finances = ({ data }) => {
  const total = data.finances.fixcosts.reduce((s, f) => s + f.amount, 0);
  return (
    <PlaceholderPage title="Finanzen">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <StatCard label="Fixkosten / Monat" value={`${total}€`} color={C.red} />
        <StatCard label="Fixkosten / Jahr" value={`${(total * 12).toLocaleString('de-DE')}€`} color={C.orange} />
        <StatCard label="Break-Even" value={`${Math.ceil(total / 500)} Deals`} sub="bei Ø 500€ / Deal" color={C.green} />
      </div>
      <div style={S.card}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Fixkosten</h3>
        <table style={S.table}><thead><tr><th style={S.th}>Posten</th><th style={S.th}>Kategorie</th><th style={S.th}>Betrag</th></tr></thead>
          <tbody>{data.finances.fixcosts.map((f, i) => (
            <tr key={i}><td style={S.td}>{f.name}</td><td style={S.td}><Badge>{f.category}</Badge></td><td style={{ ...S.td, fontWeight: 600, color: f.amount > 0 ? C.red : C.textDim }}>{f.amount}€</td></tr>
          ))}</tbody></table>
      </div>
    </PlaceholderPage>
  );
};

const Notes = ({ data, actions }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  return (
    <PlaceholderPage title="Notizen">
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Titel..." value={title} onChange={e => setTitle(e.target.value)} />
          <button onClick={() => { if (title.trim()) { actions.addNote({ title, content: text }); setTitle(''); setText(''); } }} style={{ ...S.btn, ...S.btnGold }}>Speichern</button>
        </div>
        <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Notiz schreiben..." value={text} onChange={e => setText(e.target.value)} />
      </div>
      {[...data.notes].reverse().map(n => (
        <div key={n.id} style={{ ...S.card, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 500, color: C.text }}>{n.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date(n.created).toLocaleDateString('de-DE')}</span>
              <button onClick={() => actions.deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button>
            </div>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, whiteSpace: 'pre-wrap' }}>{n.content}</div>
        </div>
      ))}
      {data.notes.length === 0 && <Empty text="Keine Notizen" />}
    </PlaceholderPage>
  );
};

const Assistant = ({ data, actions }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || !data.settings.apiKey) return;
    const userMsg = { role: 'user', content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const context = `Du bist der ELEVO KI-Assistent. Kontext: ${data.companies.length} Firmen, ${data.contacts.length} Kontakte, ${data.deals.length} Deals (Pipeline: ${helpers?.pipelineValue?.() || 0}€), ${data.tasks.filter(t=>!t.done).length} offene Tasks. Antworte kurz und auf Deutsch.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': data.settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: context, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const d = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: d.content?.[0]?.text || 'Fehler' }]);
    } catch (e) { setMessages([...newMsgs, { role: 'assistant', content: 'Fehler: ' + e.message }]); }
    setLoading(false);
  };

  return (
    <PlaceholderPage title="KI-Assistent">
      {!data.settings.apiKey && <div style={{ ...S.card, background: C.orangeDim, borderColor: C.orange, marginBottom: 16 }}><span style={{ fontFamily: font.body, fontSize: 13, color: C.orange }}>⚠️ API-Key fehlt — bitte in Settings hinterlegen.</span></div>}
      <div style={{ ...S.card, height: 400, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: 10, background: m.role === 'user' ? C.goldDim : C.bgHover, color: C.text, fontFamily: font.body, fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.content}</div>
            </div>
          ))}
          {loading && <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, padding: 8 }}>Denke nach...</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Frage stellen..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <button onClick={send} style={{ ...S.btn, ...S.btnGold }} disabled={loading}>Senden</button>
        </div>
      </div>
    </PlaceholderPage>
  );
};

const Settings = ({ data, actions }) => {
  const [pin, setPin] = useState(data.settings.pin || '');
  const [apiKey, setApiKey] = useState(data.settings.apiKey || '');
  const [importJson, setImportJson] = useState('');

  return (
    <PlaceholderPage title="Settings">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Sicherheit</h3>
          <FormRow label="PIN"><input style={S.input} type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="4-stellig" /></FormRow>
          <button onClick={() => actions.updateSettings({ pin })} style={{ ...S.btn, ...S.btnGold, marginTop: 8 }}>PIN speichern</button>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Claude API</h3>
          <FormRow label="API Key"><input style={S.input} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." /></FormRow>
          <button onClick={() => actions.updateSettings({ apiKey })} style={{ ...S.btn, ...S.btnGold, marginTop: 8 }}>Key speichern</button>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Backup</h3>
          <button onClick={actions.exportData} style={{ ...S.btn, ...S.btnGold, marginBottom: 10 }}>Export JSON</button>
          <FormRow label="Import"><textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="JSON einfügen..." value={importJson} onChange={e => setImportJson(e.target.value)} /></FormRow>
          <button onClick={() => { if (actions.importData(importJson)) setImportJson(''); }} style={{ ...S.btn, ...S.btnGhost }}>Importieren</button>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Danger Zone</h3>
          <p style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginBottom: 10 }}>Setzt alle Daten auf den Ausgangszustand zurück.</p>
          <button onClick={() => { if (confirm('Wirklich alle Daten zurücksetzen?')) actions.resetData(); }} style={{ ...S.btn, background: C.redDim, color: C.red }}>Alle Daten zurücksetzen</button>
        </div>
      </div>
    </PlaceholderPage>
  );
};

// ============================================================================
// APP — ROOT COMPONENT
// ============================================================================
export default function App() {
  const { data, helpers, actions } = useAppData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const props = { data, helpers, actions };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: font.body, color: C.text }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onSearch={() => setSearchOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard {...props} />} />
            <Route path="/companies" element={<Companies {...props} />} />
            <Route path="/companies/:id" element={<CompanyDetail {...props} />} />
            <Route path="/contacts" element={<Contacts {...props} />} />
            <Route path="/contacts/:id" element={<ContactDetail {...props} />} />
            <Route path="/pipeline" element={<Pipeline {...props} />} />
            <Route path="/deals/:id" element={<DealDetail {...props} />} />
            <Route path="/projects" element={<Projects {...props} />} />
            <Route path="/websites" element={<Websites {...props} />} />
            <Route path="/tasks" element={<Tasks {...props} />} />
            <Route path="/outreach" element={<Outreach {...props} />} />
            <Route path="/ads" element={<Ads {...props} />} />
            <Route path="/sops" element={<SOPs {...props} />} />
            <Route path="/finances" element={<Finances {...props} />} />
            <Route path="/notes" element={<Notes {...props} />} />
            <Route path="/assistant" element={<Assistant {...props} />} />
            <Route path="/settings" element={<Settings {...props} />} />
          </Routes>
        </main>
      </div>
      <GlobalSearch data={data} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
