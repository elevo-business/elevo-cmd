import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';

// ============================================================================
// CONSTANTS
// ============================================================================
const C = {
  bg: '#06080C', bgCard: '#0C0F14', bgHover: '#131720', bgInput: '#0A0D12',
  border: '#1A1F2B', borderLight: '#252B3A',
  accent: '#3B82F6', accentDim: 'rgba(59,130,246,0.12)', accentHover: '#5B9BFF',
  accentLight: '#93C5FD', accentDark: '#2563EB',
  text: '#E8EAF0', textDim: '#8891A5', textMuted: '#505868',
  green: '#34D399', greenDim: 'rgba(52,211,153,0.12)',
  red: '#F87171', redDim: 'rgba(248,113,113,0.12)',
  blue: '#60A5FA', blueDim: 'rgba(96,165,250,0.12)',
  orange: '#FBBF24', orangeDim: 'rgba(251,191,36,0.12)',
  purple: '#A78BFA', purpleDim: 'rgba(167,139,250,0.12)',
  cyan: '#22D3EE', cyanDim: 'rgba(34,211,238,0.12)',
};

const font = { head: "'Sora', sans-serif", body: "'Outfit', sans-serif" };

const DEAL_STAGES = ['Lead', 'Kontakt', 'Angebot', 'Verhandlung', 'Gewonnen', 'Verloren'];
const ACTIVITY_TYPES = ['Anruf', 'E-Mail', 'Loom', 'Meeting', 'Notiz', 'Follow-up', 'Sonstiges'];
const TASK_CATEGORIES = ['Outreach', 'Ads', 'Projekt', 'Vertrieb', 'Admin'];
const SERVICES = ['Website', 'SEO', 'Google Ads', 'Beratung', 'Komplett-Paket'];

const LEISTUNG_VORLAGEN = [
  { name: 'Website Design & Entwicklung', desc: 'Individuelles Webdesign, Responsive, SEO-Grundstruktur, Kontaktformular, CMS-frei', price: 1500 },
  { name: 'Content & Texte', desc: 'Professionelle Webtexte, Headlines, Leistungsbeschreibungen, CTAs', price: 400 },
  { name: 'SEO-Grundoptimierung', desc: 'Keyword-Recherche, Meta-Tags, Schema.org, Alt-Tags, Ladezeit', price: 300 },
  { name: 'Google Ads Setup', desc: 'Kampagnenstruktur, Keywords, Anzeigentexte, Conversion-Tracking', price: 500 },
  { name: 'Logo & Branding', desc: 'Logodesign, Farbpalette, Typografie, Brand Guidelines', price: 600 },
  { name: 'Hosting & Wartung (mtl.)', desc: 'Hosting, SSL, Updates, Monitoring, Backups', price: 29 },
  { name: 'Prozessdigitalisierung', desc: 'Workflow-Analyse, Tool-Setup, Automatisierungen, Schulung', price: 2500 },
];

const fmtCur = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC';
const fmtDe = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const genAngebotNr = () => `ELEVO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

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
  btnPrimary: { background: C.accent, color: '#fff' },
  btnGhost: { background: 'transparent', color: C.textDim, border: `1px solid ${C.border}` },
  input: { fontFamily: font.body, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, outline: 'none', width: '100%' },
  select: { fontFamily: font.body, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, outline: 'none', width: '100%' },
  label: { fontFamily: font.body, fontSize: 12, fontWeight: 500, color: C.textDim, marginBottom: 4, display: 'block' },
  badge: (bg, color) => ({ fontFamily: font.body, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: bg, color, display: 'inline-block' }),
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: font.body, fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', color: C.textDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` },
  td: { padding: '12px', borderBottom: `1px solid ${C.border}`, color: C.text },
  link: { color: C.accent, textDecoration: 'none', cursor: 'pointer' },
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: S.badge(C.accentDim, C.accent),
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

const StatCard = ({ label, value, sub, color = C.accent }) => (
  <div style={S.card}>
    <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: font.head, fontSize: 32, fontWeight: 600, color }}>{value}</div>
    {sub && <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t} onClick={() => onChange(t)} style={{ ...S.btn, background: 'none', color: active === t ? C.accent : C.textDim, borderBottom: active === t ? `2px solid ${C.accent}` : '2px solid transparent', borderRadius: 0, padding: '10px 16px', fontSize: 13 }}>{t}</button>
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
  { type: 'section', label: 'CRM' },
  { label: 'Companies', icon: 'companies', path: '/companies' },
  { label: 'Kontakte', icon: 'contacts', path: '/contacts' },
  { label: 'Pipeline', icon: 'pipeline', path: '/pipeline' },
  { type: 'section', label: 'Projekte' },
  { label: 'Projekte', icon: 'projects', path: '/projects' },
  { label: 'Websites', icon: 'websites', path: '/websites' },
  { label: 'Tasks', icon: 'tasks', path: '/tasks' },
  { type: 'section', label: 'Marketing' },
  { label: 'Outreach', icon: 'outreach', path: '/outreach' },
  { label: 'Google Ads', icon: 'ads', path: '/ads' },
  { type: 'section', label: 'System' },
  { label: 'SOPs', icon: 'sops', path: '/sops' },
  { label: 'Finanzen', icon: 'finances', path: '/finances' },
  { label: 'Notizen', icon: 'notes', path: '/notes' },
  { label: 'KI-Assistent', icon: 'ai', path: '/assistant' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const loc = useLocation();
  const isActive = (path) => path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(path);

  return (
    <aside style={{ width: collapsed ? 64 : 220, height: '100vh', background: C.bgCard, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.head, fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>E</div>
        {!collapsed && <span style={{ fontFamily: font.head, fontSize: 18, fontWeight: 600, color: C.text, letterSpacing: '0.05em' }}>ELEVO</span>}
      </div>
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.type === 'section') return !collapsed ? (
            <div key={i} style={{ fontFamily: font.body, fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 12px 6px', marginTop: i > 0 ? 4 : 0 }}>{item.label}</div>
          ) : <div key={i} style={{ height: 1, background: C.border, margin: '8px 4px' }} />;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 12px' : '8px 12px', borderRadius: 8, textDecoration: 'none', background: active ? C.accentDim : 'transparent', color: active ? C.accent : C.textDim, fontFamily: font.body, fontSize: 13, fontWeight: active ? 500 : 400, transition: 'all 0.15s', marginBottom: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              {React.cloneElement(Icons[item.icon], { color: active ? C.accent : C.textDim, size: 16 })}
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

const Topbar = ({ onSearch, overdueCount }) => (
  <header style={{ height: 48, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: C.bgCard, flexShrink: 0 }}>
    <button onClick={onSearch} style={{ ...S.btn, ...S.btnGhost, fontSize: 12, color: C.textMuted, gap: 8, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px' }}>
      {React.cloneElement(Icons.search, { size: 14, color: C.textMuted })} Suche...
      <kbd style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted, background: C.bg, padding: '1px 5px', borderRadius: 3, border: `1px solid ${C.border}`, marginLeft: 8 }}>⌘K</kbd>
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {overdueCount > 0 && (
        <Link to="/pipeline" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, background: C.orangeDim }}>
          {React.cloneElement(Icons.alert, { size: 14 })}
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: C.orange }}>{overdueCount} Follow-up{overdueCount > 1 ? 's' : ''}</span>
        </Link>
      )}
      <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
    </div>
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
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {React.cloneElement(iconMap[a.type] || Icons.edit, { size: 14, color: C.accent })}
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
        <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
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
  const recentActs = [...data.activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const nav = useNavigate();

  // Conversion rate
  const totalDeals = data.deals.length;
  const wonDeals = data.deals.filter(d => d.status === 'Gewonnen').length;
  const convRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

  // Tasks due today or overdue
  const today = new Date().toISOString().slice(0, 10);
  const urgentTasks = data.tasks.filter(t => !t.done && t.due && t.due <= today);

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>Command Center</h1>
          <p style={S.pageSub}>Willkommen zurück. Hier ist dein Überblick.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav('/companies')} style={{ ...S.btn, ...S.btnGhost, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 13, color: C.textDim })} Firma</button>
          <button onClick={() => nav('/pipeline')} style={{ ...S.btn, ...S.btnPrimary, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 13, color: C.bg })} Deal</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{ ...S.card, background: C.orangeDim, borderColor: C.orange, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => nav('/pipeline')}>
          {Icons.alert}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.orange }}>{overdue.length} überfällige Follow-up{overdue.length > 1 ? 's' : ''}</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.text, marginTop: 2 }}>
              {overdue.slice(0, 3).map(d => d.title).join(', ')}{overdue.length > 3 ? ` +${overdue.length - 3} weitere` : ''}
            </div>
          </div>
          {React.cloneElement(Icons.chevRight, { size: 16, color: C.orange })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Pipeline-Wert" value={`${helpers.pipelineValue().toLocaleString('de-DE')}€`} sub={`${openDeals.length} offene Deals`} />
        <StatCard label="Gewonnen" value={`${helpers.wonValue().toLocaleString('de-DE')}€`} sub={`${wonDeals} Deal${wonDeals !== 1 ? 's' : ''}`} color={C.green} />
        <StatCard label="Conversion" value={`${convRate}%`} sub={`${wonDeals} von ${totalDeals}`} color={convRate >= 30 ? C.green : C.orange} />
        <StatCard label="Companies" value={data.companies.length} sub={`${data.contacts.length} Kontakte`} color={C.blue} />
        <StatCard label="Offene Tasks" value={openTasks.length} sub={urgentTasks.length > 0 ? `${urgentTasks.length} überfällig` : 'alles im Plan'} color={urgentTasks.length > 0 ? C.orange : C.green} />
        <StatCard label="Fixkosten" value={`${data.finances.fixcosts.reduce((s, f) => s + f.amount, 0)}€`} sub="pro Monat" color={C.red} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Offene Deals</h3>
            <Link to="/pipeline" style={{ ...S.link, fontSize: 12 }}>Alle →</Link>
          </div>
          {openDeals.length === 0 ? <Empty text="Keine offenen Deals" /> : openDeals.slice(0, 5).map(d => {
            const comp = helpers.getCompany(d.companyId);
            const isOd = d.followUp && new Date(d.followUp) < new Date();
            return (
              <Link key={d.id} to={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{d.title}</div>
                  <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{comp?.name} • {d.service}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.accent }}>{d.volume?.toLocaleString('de-DE')}€</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                    {statusBadge(d.status)}
                    {isOd && <Badge variant="orange">!</Badge>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Letzte Aktivitäten</h3>
            <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{data.activities.length} gesamt</span>
          </div>
          {recentActs.length === 0 ? <Empty text="Keine Aktivitäten" /> :
            recentActs.map(a => {
              const comp = helpers.getCompany(a.companyId);
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Badge variant={a.type === 'E-Mail' ? 'blue' : a.type === 'Anruf' ? 'green' : a.type === 'Meeting' ? 'purple' : 'default'}>{a.type}</Badge>
                    <div>
                      <div style={{ fontFamily: font.body, fontSize: 12, color: C.text }}>{a.subject}</div>
                      <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{comp?.name}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: font.body, fontSize: 10, color: C.textMuted }}>{new Date(a.date).toLocaleDateString('de-DE')}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Projekte</h3>
            <Link to="/projects" style={{ ...S.link, fontSize: 12 }}>Alle →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {data.projects.map(p => {
              const comp = helpers.getCompany(p.companyId);
              return (
                <div key={p.id} style={{ padding: 12, background: C.bgHover, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: C.text }}>{p.name}</span>
                    {statusBadge(p.status)}
                  </div>
                  <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${p.progress}%`, background: p.progress >= 75 ? C.green : C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontFamily: font.body, fontSize: 10, color: C.textDim, marginTop: 4 }}>{comp?.name} • {p.progress}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Fällige Tasks</h3>
            <Link to="/tasks" style={{ ...S.link, fontSize: 12 }}>Alle →</Link>
          </div>
          {urgentTasks.length === 0 && openTasks.length === 0 ? <Empty text="Keine Tasks" /> :
            (urgentTasks.length > 0 ? urgentTasks : openTasks).slice(0, 5).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => actions.toggleTask(t.id)} style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${t.done ? C.green : C.border}`, background: t.done ? C.greenDim : 'transparent', cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.text, flex: 1 }}>{t.text}</span>
                <Badge variant={t.priority === 'hoch' ? 'red' : 'orange'}>{t.priority}</Badge>
              </div>
            ))}
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
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '', address: '', size: '', source: '' });
  const [editForm, setEditForm] = useState({});
  const nav = useNavigate();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.companies.filter(c => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }, [data.companies, search]);

  const save = () => {
    if (!form.name.trim()) return;
    actions.addCompany({ ...form, tags: [] });
    setShowAdd(false);
    setForm({ name: '', industry: '', website: '', email: '', phone: '', address: '', size: '', source: '' });
  };

  const openEdit = (c) => { setEditForm({ ...c }); setShowEdit(true); };
  const saveEdit = () => { actions.updateCompany(editForm.id, editForm); setShowEdit(false); };
  const handleDelete = () => { if (confirm(`"${editForm.name}" und alle verknüpften Daten löschen?`)) { actions.deleteCompany(editForm.id); setShowEdit(false); } };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>Companies</h1>
          <p style={S.pageSub}>{data.companies.length} Firmen</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neue Firma</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...S.input, maxWidth: 320 }} placeholder="Firmen durchsuchen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Firma</th><th style={S.th}>Branche</th><th style={S.th}>Ort</th><th style={S.th}>Kontakte</th><th style={S.th}>Deals</th><th style={S.th}>Volumen</th><th style={S.th}>Quelle</th><th style={S.th}></th>
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
                  <td style={{ ...S.td, fontWeight: 500, color: vol > 0 ? C.accent : C.textDim }}>{vol > 0 ? `${vol.toLocaleString('de-DE')}€` : '–'}</td>
                  <td style={S.td}>{statusBadge(c.source)}</td>
                  <td style={S.td}><button onClick={(e) => { e.stopPropagation(); openEdit(c); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button></td>
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
          <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Firma bearbeiten" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Firmenname"><input style={S.input} value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="Branche"><input style={S.input} value={editForm.industry || ''} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))} /></FormRow>
          <FormRow label="Website"><input style={S.input} value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." /></FormRow>
          <FormRow label="Ort"><input style={S.input} value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} /></FormRow>
          <FormRow label="Größe"><select style={S.select} value={editForm.size || ''} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))}><option value="">–</option><option>Klein</option><option>KMU</option><option>Mittelstand</option><option>Groß</option></select></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={editForm.source || ''} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Referenz</option><option>Direkt</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={handleDelete} style={{ ...S.btn, background: C.redDim, color: C.red }}>{React.cloneElement(Icons.trash, { size: 13, color: C.red })} Löschen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
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
  const nav = useNavigate();
  const company = helpers.getCompany(id);
  const [tab, setTab] = useState('Übersicht');
  const [logOpen, setLogOpen] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [ctForm, setCtForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', source: '' });
  const [dlForm, setDlForm] = useState({ title: '', contactId: '', status: 'Lead', service: 'Website', volume: '', source: '', followUp: '', notes: '' });

  if (!company) return <div style={S.page}><BackButton to="/companies" label="Zurück zu Companies" /><Empty text="Firma nicht gefunden" /></div>;

  const contacts = helpers.companyContacts(id);
  const deals = helpers.companyDeals(id);
  const projects = helpers.companyProjects(id);
  const websites = helpers.companyWebsites(id);
  const activities = helpers.companyActivities(id);
  const tasks = helpers.companyTasks(id);

  const openEdit = () => { setEditForm({ ...company }); setShowEdit(true); };
  const saveEdit = () => { actions.updateCompany(id, editForm); setShowEdit(false); };
  const handleDelete = () => { if (confirm(`"${company.name}" und alle verknüpften Daten löschen?`)) { actions.deleteCompany(id); nav('/companies'); } };

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openEdit} style={{ ...S.btn, ...S.btnGhost }}>{React.cloneElement(Icons.edit, { size: 14, color: C.textDim })} Bearbeiten</button>
          <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
        </div>
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
            <button onClick={() => setShowAddDeal(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Deal</button>
          </div>
          {deals.length === 0 ? <Empty text="Keine Deals" /> : (
            <table style={S.table}><thead><tr><th style={S.th}>Deal</th><th style={S.th}>Status</th><th style={S.th}>Service</th><th style={S.th}>Volumen</th><th style={S.th}>Kontakt</th></tr></thead>
              <tbody>{deals.map(d => {
                const ct = helpers.getContact(d.contactId);
                return <tr key={d.id}><td style={S.td}><Link to={`/deals/${d.id}`} style={S.link}>{d.title}</Link></td><td style={S.td}>{statusBadge(d.status)}</td><td style={{ ...S.td, color: C.textDim }}>{d.service}</td><td style={{ ...S.td, fontWeight: 500, color: C.accent }}>{d.volume?.toLocaleString('de-DE')}€</td><td style={S.td}>{ct && <Link to={`/contacts/${ct.id}`} style={S.link}>{ct.firstName} {ct.lastName}</Link>}</td></tr>;
              })}</tbody></table>
          )}
        </div>
      )}

      {tab === 'Kontakte' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Kontakte</h3>
            <button onClick={() => setShowAddContact(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 12 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Kontakt</button>
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
                <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 6 }}><div style={{ height: '100%', width: `${p.progress}%`, background: C.accent, borderRadius: 2 }} /></div>
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
          <button onClick={saveContact} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
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
          <button onClick={saveDeal} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Firma bearbeiten" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Firmenname"><input style={S.input} value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="Branche"><input style={S.input} value={editForm.industry || ''} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))} /></FormRow>
          <FormRow label="Website"><input style={S.input} value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></FormRow>
          <FormRow label="Ort"><input style={S.input} value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} /></FormRow>
          <FormRow label="Größe"><select style={S.select} value={editForm.size || ''} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))}><option value="">–</option><option>Klein</option><option>KMU</option><option>Mittelstand</option><option>Groß</option></select></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={editForm.source || ''} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Referenz</option><option>Direkt</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={handleDelete} style={{ ...S.btn, background: C.redDim, color: C.red }}>{React.cloneElement(Icons.trash, { size: 13, color: C.red })} Löschen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
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
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [ctForm, setCtForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', source: '', companyId: '' });
  const [editForm, setEditForm] = useState({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q));
  }, [data.contacts, search]);

  const saveContact = () => {
    if (!ctForm.firstName.trim() || !ctForm.companyId) return;
    actions.addContact({ ...ctForm, tags: [] });
    setShowAdd(false); setCtForm({ firstName: '', lastName: '', email: '', phone: '', position: '', source: '', companyId: '' });
  };

  const openEdit = (c) => { setEditForm({ ...c }); setShowEdit(true); };
  const saveEdit = () => { actions.updateContact(editForm.id, editForm); setShowEdit(false); };
  const handleDelete = () => { if (confirm(`"${editForm.firstName} ${editForm.lastName}" löschen?`)) { actions.deleteContact(editForm.id); setShowEdit(false); } };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Kontakte</h1><p style={S.pageSub}>{data.contacts.length} Kontakte</p></div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neuer Kontakt</button>
      </div>
      <div style={{ marginBottom: 16 }}><input style={{ ...S.input, maxWidth: 320 }} placeholder="Name, E-Mail, Telefon suchen..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Name</th><th style={S.th}>Firma</th><th style={S.th}>Position</th><th style={S.th}>E-Mail</th><th style={S.th}>Telefon</th><th style={S.th}>Letzter Kontakt</th><th style={S.th}>Deals</th><th style={S.th}></th></tr></thead>
          <tbody>{filtered.map(c => {
            const comp = helpers.getCompany(c.companyId);
            const dls = helpers.contactDeals(c.id);
            return (
              <tr key={c.id} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={S.td}><Link to={`/contacts/${c.id}`} style={{ ...S.link, fontWeight: 500 }}>{c.firstName} {c.lastName}</Link></td>
                <td style={S.td}>{comp && <Link to={`/companies/${comp.id}`} style={S.link}>{comp.name}</Link>}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.position}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.email}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.phone || '–'}</td>
                <td style={{ ...S.td, color: C.textDim }}>{c.lastContact && new Date(c.lastContact).toLocaleDateString('de-DE')}</td>
                <td style={S.td}><Badge variant="purple">{dls.length}</Badge></td>
                <td style={S.td}><button onClick={(e) => { e.stopPropagation(); openEdit(c); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button></td>
              </tr>
            );
          })}</tbody>
        </table>
        {filtered.length === 0 && <Empty text="Keine Kontakte gefunden" />}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neuer Kontakt">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Firma *">
            <select style={S.select} value={ctForm.companyId} onChange={e => setCtForm(f => ({ ...f, companyId: e.target.value }))}>
              <option value="">– Firma wählen –</option>
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormRow>
          <FormRow label="Position"><input style={S.input} value={ctForm.position} onChange={e => setCtForm(f => ({ ...f, position: e.target.value }))} placeholder="z.B. Geschäftsführer" /></FormRow>
          <FormRow label="Vorname *"><input style={S.input} value={ctForm.firstName} onChange={e => setCtForm(f => ({ ...f, firstName: e.target.value }))} /></FormRow>
          <FormRow label="Nachname"><input style={S.input} value={ctForm.lastName} onChange={e => setCtForm(f => ({ ...f, lastName: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={ctForm.email} onChange={e => setCtForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={ctForm.phone} onChange={e => setCtForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." /></FormRow>
        </div>
        <FormRow label="Quelle">
          <select style={S.select} value={ctForm.source} onChange={e => setCtForm(f => ({ ...f, source: e.target.value }))}>
            <option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Direkt</option>
          </select>
        </FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveContact} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Kontakt bearbeiten" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Vorname"><input style={S.input} value={editForm.firstName || ''} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></FormRow>
          <FormRow label="Nachname"><input style={S.input} value={editForm.lastName || ''} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." /></FormRow>
          <FormRow label="Position"><input style={S.input} value={editForm.position || ''} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} /></FormRow>
          <FormRow label="Firma">
            <select style={S.select} value={editForm.companyId || ''} onChange={e => setEditForm(f => ({ ...f, companyId: e.target.value }))}>
              <option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormRow>
          <FormRow label="Quelle">
            <select style={S.select} value={editForm.source || ''} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}>
              <option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Direkt</option>
            </select>
          </FormRow>
          <FormRow label="Letzter Kontakt"><input style={S.input} type="date" value={editForm.lastContact || ''} onChange={e => setEditForm(f => ({ ...f, lastContact: e.target.value }))} /></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={handleDelete} style={{ ...S.btn, background: C.redDim, color: C.red }}>{React.cloneElement(Icons.trash, { size: 13, color: C.red })} Löschen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — CONTACT DETAIL
// ============================================================================
const ContactDetail = ({ data, helpers, actions }) => {
  const { id } = useParams();
  const nav = useNavigate();
  const contact = helpers.getContact(id);
  const [logOpen, setLogOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (!contact) return <div style={S.page}><BackButton to="/contacts" /><Empty text="Kontakt nicht gefunden" /></div>;

  const company = helpers.getCompany(contact.companyId);
  const deals = helpers.contactDeals(id);
  const activities = helpers.contactActivities(id);

  const openEdit = () => { setEditForm({ ...contact }); setShowEdit(true); };
  const saveEdit = () => { actions.updateContact(id, editForm); setShowEdit(false); };
  const handleDelete = () => { if (confirm(`"${contact.firstName} ${contact.lastName}" löschen?`)) { actions.deleteContact(id); nav('/contacts'); } };

  return (
    <div style={S.page}>
      <BackButton to="/contacts" label="Zurück zu Kontakte" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>{contact.firstName} {contact.lastName}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            {contact.position && <Badge>{contact.position}</Badge>}
            {company && <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none' }}><Badge variant="blue">{company.name}</Badge></Link>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openEdit} style={{ ...S.btn, ...S.btnGhost }}>{React.cloneElement(Icons.edit, { size: 14, color: C.textDim })} Bearbeiten</button>
          <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['Anruf', Icons.phone, C.green], ['E-Mail', Icons.mail, C.blue], ['Loom', Icons.video, C.purple], ['Meeting', Icons.calendar, C.orange]].map(([type, icon, col]) => (
          <button key={type} onClick={() => { actions.addActivity({ companyId: contact.companyId, contactId: id, dealId: null, type, subject: `${type} geloggt`, content: `Schnell-Log: ${type} mit ${contact.firstName} ${contact.lastName}` }); }} style={{ ...S.btn, ...S.btnGhost, borderColor: col, color: col }}>
            {React.cloneElement(icon, { size: 14, color: col })} {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Details</h3>
            {[['E-Mail', contact.email], ['Telefon', contact.phone], ['Firma', company?.name], ['Quelle', contact.source], ['Letzter Kontakt', contact.lastContact && new Date(contact.lastContact).toLocaleDateString('de-DE')]].map(([l, v]) => v ? (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.text }}>{v}</span>
              </div>
            ) : null)}
          </div>
          <div style={S.card}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Deals</h3>
            {deals.length === 0 ? <Empty text="Keine Deals" /> : deals.map(d => (
              <Link key={d.id} to={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{d.title}</div>
                  <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{d.service}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: C.accent, fontWeight: 500 }}>{d.volume?.toLocaleString('de-DE')}€</div>
                  {statusBadge(d.status)}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Aktivitäten</h3>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} companyId={contact.companyId} contactId={id} deals={deals} actions={actions} />

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Kontakt bearbeiten" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Vorname"><input style={S.input} value={editForm.firstName || ''} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></FormRow>
          <FormRow label="Nachname"><input style={S.input} value={editForm.lastName || ''} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></FormRow>
          <FormRow label="Position"><input style={S.input} value={editForm.position || ''} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} /></FormRow>
          <FormRow label="Firma">
            <select style={S.select} value={editForm.companyId || ''} onChange={e => setEditForm(f => ({ ...f, companyId: e.target.value }))}>
              <option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={handleDelete} style={{ ...S.btn, background: C.redDim, color: C.red }}>{React.cloneElement(Icons.trash, { size: 13, color: C.red })} Löschen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
        </div>
      </Modal>
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
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neuer Deal</button>
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
                        <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.accent }}>{d.volume?.toLocaleString('de-DE')}€</span>
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
          <button onClick={saveDeal} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// ANGEBOT PDF GENERATOR (ELEVO CI — Blue)
// ============================================================================
function buildAngebotPDF(d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, ML = 25, MR = 25, CW = W - ML - MR;
  const ACC = [59, 130, 246], HBG = [240, 245, 255], DK = [17, 24, 39], MUT = [136, 153, 176], DIM = [81, 97, 121], LN = [226, 232, 240];
  let y = 0;
  const ck = (n) => { if (y + n > 272) { doc.addPage(); y = 30; doc.setFillColor(...ACC); doc.rect(0, 0, W, 1.5, 'F'); } };
  const aLine = (yy) => { doc.setDrawColor(...ACC); doc.setLineWidth(0.4); doc.line(ML, yy, W - MR, yy); };
  const secT = (t, yy) => { ck(20); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...ACC); doc.text(t.toUpperCase().split('').join('  '), ML, yy); return yy + 8; };
  const bPara = (t, yy, o = {}) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(o.s || 10); doc.setTextColor(...(o.c || [55, 65, 81])); const ls = doc.splitTextToSize(t, CW); ls.forEach((l, i) => { ck(5); doc.text(l, ML, yy + i * 5); }); return yy + ls.length * 5 + 4; };

  // Cover
  doc.setFillColor(...ACC); doc.rect(0, 0, W, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(36); doc.setCharSpace(6);
  doc.setTextColor(...DIM); doc.text('ELE', ML, 70);
  const ew = doc.getTextWidth('ELE'); doc.setTextColor(...ACC); doc.text('V', ML + ew, 70);
  const vw = doc.getTextWidth('V'); doc.setTextColor(...DIM); doc.text('O', ML + ew + vw, 70);
  doc.setCharSpace(0);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DIM); doc.setCharSpace(0.8);
  doc.text('Digital  \u00B7  Strategie  \u00B7  Umsetzung', ML, 78); doc.setCharSpace(0);
  aLine(90);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUT); doc.setCharSpace(1.5); doc.text('ANGEBOT', ML, 106); doc.setCharSpace(0);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(...DK);
  doc.splitTextToSize(d.projektTitel, CW).forEach((l, i) => doc.text(l, ML, 120 + i * 10));

  let my = 146;
  [['Kunde:', d.companyName], ['Ansprechpartner:', d.contactName], ['Erstellt am:', d.datum], ['Angebots-Nr.:', d.angebotNr], ['G\u00FCltig bis:', d.gueltigBis]].forEach(([lb, vl]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...MUT); doc.text(lb, ML, my);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...DK); doc.text(vl, ML + 38, my); my += 7;
  });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...DIM);
  doc.text('ELEVO  |  ' + d.absenderName, ML, 258);
  doc.text(d.absenderEmail + '  |  ' + d.absenderTelefon + '  |  elevo.solutions', ML, 264);
  aLine(270);

  // Content
  doc.addPage(); y = 30; doc.setFillColor(...ACC); doc.rect(0, 0, W, 1.5, 'F');
  y = secT('Ausgangslage', y); y = bPara(d.ausgangslage || '\u2014', y); y += 4;
  y = secT('Zielsetzung', y); y = bPara(d.zielsetzung || '\u2014', y); y += 4;
  y = secT('Leistungsumfang', y); y = bPara('Das Projekt umfasst folgende Leistungen:', y); y += 2;

  d.leistungen.forEach((l, i) => {
    ck(18);
    doc.setFillColor(...ACC); doc.roundedRect(ML, y - 4, 7, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), ML + 3.5, y + 0.5, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(...DK); doc.text(l.name, ML + 11, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUT);
    doc.splitTextToSize(l.desc, CW - 11).forEach(ln => { ck(5); doc.text(ln, ML + 11, y); y += 4.5; }); y += 3;
  });

  // Zeitplan
  y += 2; y = secT('Zeitplan', y); ck(10 + d.zeitplan.length * 8);
  doc.autoTable({ startY: y, margin: { left: ML, right: MR }, head: [['Phase', 'Beschreibung', 'Dauer']],
    body: d.zeitplan.map((z, i) => [String(i + 1), z.phase, z.dauer]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [55, 65, 81], lineColor: LN, lineWidth: 0.15 },
    headStyles: { fillColor: HBG, textColor: ACC, fontStyle: 'bold', lineColor: ACC, lineWidth: 0.25 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: ACC }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 35 } },
  }); y = doc.lastAutoTable.finalY + 10;

  // Investition
  const netto = d.leistungen.reduce((s, l) => s + l.price, 0);
  const ust = Math.round(netto * 19) / 100; const brutto = netto + ust;
  y = secT('Investition', y); y += 2; ck(10 + d.leistungen.length * 8 + 30);
  const invB = d.leistungen.map(l => [l.name, '1', fmtCur(l.price)]);
  invB.push([{ content: '', styles: { lineWidth: 0 } }, { content: 'Netto', styles: { fontStyle: 'bold', halign: 'center' } }, { content: fmtCur(netto), styles: { fontStyle: 'bold', halign: 'right' } }]);
  invB.push([{ content: '', styles: { lineWidth: 0 } }, { content: 'USt 19 %', styles: { halign: 'center' } }, { content: fmtCur(ust), styles: { halign: 'right' } }]);
  doc.autoTable({ startY: y, margin: { left: ML, right: MR }, head: [['Position', 'Menge', 'Betrag']], body: invB,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [55, 65, 81], lineColor: LN, lineWidth: 0.15 },
    headStyles: { fillColor: HBG, textColor: ACC, fontStyle: 'bold', lineColor: ACC, lineWidth: 0.25 },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 38, halign: 'right' } },
  }); y = doc.lastAutoTable.finalY;
  doc.setDrawColor(...ACC); doc.setLineWidth(0.5); doc.line(ML, y + 1, W - MR, y + 1);
  doc.setFillColor(...HBG); doc.rect(ML, y + 1.5, CW, 10, 'F'); doc.line(ML, y + 11.5, W - MR, y + 11.5);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...ACC);
  doc.text('Gesamt (brutto)', ML + CW / 2, y + 8, { align: 'center' }); doc.text(fmtCur(brutto), W - MR - 3, y + 8, { align: 'right' }); y += 20;

  // Zahlungsbedingungen
  ck(35); y = secT('Zahlungsbedingungen', y); y = bPara('Die Zahlung erfolgt in zwei Raten:', y);
  doc.autoTable({ startY: y, margin: { left: ML, right: MR },
    body: [['1. Rate (50 %)', 'Nach Auftragserteilung', fmtCur(brutto / 2)], ['2. Rate (50 %)', 'Nach Go-Live und \u00DCbergabe', fmtCur(brutto / 2)]],
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [55, 65, 81], lineColor: LN, lineWidth: 0.15 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 42, halign: 'right', fontStyle: 'bold', textColor: ACC } },
  }); y = doc.lastAutoTable.finalY + 6;
  y = bPara('Zahlungsziel: 7 Tage nach Rechnungsstellung. Zahlung per \u00DCberweisung. Alle Betr\u00E4ge verstehen sich zzgl. der gesetzlichen Umsatzsteuer von 19 %.', y, { s: 9, c: MUT }); y += 4;

  // Ablauf
  ck(50); y = secT('Ablauf der Zusammenarbeit', y);
  [['Auftragserteilung', 'Best\u00E4tigung per E-Mail, Rechnung \u00FCber Anzahlung (50 %).'],
   ['Konzeptphase', 'Wettbewerbsanalyse, Seitenstruktur, Content-Strategie.'],
   ['Umsetzung', 'Design & Entwicklung. Vorschau-Link zur Abstimmung.'],
   ['Korrekturschleife', 'Eine Korrekturschleife inklusive.'],
   ['Go-Live', 'Website live, Schlussrechnung, \u00DCbergabe-Dokumentation.']].forEach(([t, desc]) => {
    ck(14); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...ACC); doc.text('\u2014', ML, y);
    doc.setTextColor(...DK); doc.text(t, ML + 6, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUT);
    doc.splitTextToSize(desc, CW - 6).forEach(l => { doc.text(l, ML + 6, y); y += 4.5; }); y += 2;
  });

  // Nächste Schritte
  ck(35); y += 4; y = secT('N\u00E4chste Schritte', y);
  ['Angebot best\u00E4tigen per E-Mail an ' + d.absenderEmail, 'Anzahlung \u00FCberweisen (Rechnung folgt nach Best\u00E4tigung)', 'Kickoff-Termin vereinbaren'].forEach((s, i) => {
    ck(10); doc.setFillColor(...ACC); doc.circle(ML + 3.5, y - 1.5, 3.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255); doc.text(String(i + 1), ML + 3.5, y, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...DK); doc.text(s, ML + 12, y); y += 9;
  });
  ck(20); y += 6; aLine(y); y += 8;
  bPara('Dieses Angebot ist g\u00FCltig bis zum ' + d.gueltigBis + '. Bei Fragen stehen wir jederzeit zur Verf\u00FCgung.', y, { s: 9, c: DIM });

  // Page footers
  const tp = doc.internal.getNumberOfPages();
  for (let i = 2; i <= tp; i++) { doc.setPage(i); doc.setFillColor(...ACC); doc.rect(0, 0, W, 1.5, 'F'); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...DIM); doc.text('ELEVO  |  Angebot ' + d.angebotNr, ML, 288); doc.text((i - 1) + ' / ' + (tp - 1), W - MR, 288, { align: 'right' }); }
  return doc;
}

const AngebotModal = ({ open, onClose, deal, company, contact, actions }) => {
  const [ready, setReady] = useState(!!window.jspdf);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const gueltig = new Date(); gueltig.setDate(gueltig.getDate() + 14);

  const [f, setF] = useState({});
  const [leist, setLeist] = useState([]);
  const [zeit, setZeit] = useState([]);

  useEffect(() => {
    if (!open) return;
    setF({
      angebotNr: genAngebotNr(), datum: fmtDe(new Date()), gueltigBis: fmtDe(gueltig),
      companyName: company?.name || '', contactName: contact ? `${contact.firstName} ${contact.lastName}` : '',
      contactEmail: contact?.email || '', projektTitel: deal?.title || '',
      ausgangslage: '', zielsetzung: '',
      absenderName: '[Dein Name]', absenderEmail: 'mail@elevo.solutions', absenderTelefon: '[Telefon]',
    });
    setLeist(deal?.service === 'Komplett-Paket'
      ? [{ name: 'Website Design & Entwicklung', desc: 'Individuelles Webdesign, Responsive, SEO-Grundstruktur', price: 1500 }, { name: 'Content & Texte', desc: 'Professionelle Webtexte, Headlines, CTAs', price: 400 }, { name: 'SEO-Grundoptimierung', desc: 'Keyword-Recherche, Meta-Tags, Schema.org', price: 300 }]
      : [{ name: deal?.service ? `${deal.service} — Umsetzung` : 'Website Design & Entwicklung', desc: 'Individuell kalkuliert', price: deal?.volume || 0 }]
    );
    setZeit([{ phase: 'Analyse & Konzept', dauer: '3 Werktage' }, { phase: 'Design & Entwicklung', dauer: '5 Werktage' }, { phase: 'Content & Texte', dauer: '3 Werktage' }, { phase: 'Korrekturschleife', dauer: '3 Werktage' }, { phase: 'Go-Live & \u00DCbergabe', dauer: '2 Werktage' }]);
    setSuccess(false);
  }, [open]);

  useEffect(() => {
  const check = () => { if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF === 'function') { setReady(true); return true; } return false; };
    if (check()) return;
    const loadScript = (src) => new Promise((resolve, reject) => { if (document.querySelector('script[src="' + src + '"]')) { setTimeout(resolve, 200); return; } const s = document.createElement('script'); s.src = src; s.onload = () => setTimeout(resolve, 100); s.onerror = reject; document.head.appendChild(s); });
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js').then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')).then(() => { let t = 0; const p = setInterval(() => { if (check() || t++ > 30) clearInterval(p); }, 200); }).catch(e => console.error('jsPDF load failed:', e));
  }, []);

  const netto = leist.reduce((s, l) => s + (l.price || 0), 0);
  const brutto = netto + Math.round(netto * 19) / 100;
  const upF = (k, v) => setF(p => ({ ...p, [k]: v }));
  const upL = (i, k, v) => setLeist(l => l.map((x, j) => j === i ? { ...x, [k]: k === 'price' ? parseFloat(v) || 0 : v } : x));

  const generate = () => {
    if (!ready) return;
    setGenerating(true);
    setTimeout(() => {
      try {
        const pdf = buildAngebotPDF({ ...f, leistungen: leist, zeitplan: zeit });
        pdf.save(`Angebot_${f.angebotNr}_${f.companyName.replace(/\s+/g, '_')}.pdf`);
        setSuccess(true);
        actions.addActivity({ companyId: deal?.companyId, contactId: deal?.contactId, dealId: deal?.id, type: 'Notiz', subject: `Angebot ${f.angebotNr} erstellt`, content: `Angebot \u00FCber ${fmtCur(brutto)} (brutto) als PDF generiert.` });
        setTimeout(() => setSuccess(false), 3000);
      } catch (e) { alert('Fehler: ' + e.message); }
      setGenerating(false);
    }, 100);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Angebot erstellen" width={720}>
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <Badge variant="blue">{f.angebotNr}</Badge>
          <Badge>{f.datum}</Badge>
          <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>G\u00FCltig bis {f.gueltigBis}</span>
        </div>

        {/* Kundendaten */}
        <div style={{ fontFamily: font.body, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>Kundendaten</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <FormRow label="Firma"><input style={S.input} value={f.companyName || ''} onChange={e => upF('companyName', e.target.value)} /></FormRow>
          <FormRow label="Ansprechpartner"><input style={S.input} value={f.contactName || ''} onChange={e => upF('contactName', e.target.value)} /></FormRow>
          <FormRow label="Projekttitel"><input style={S.input} value={f.projektTitel || ''} onChange={e => upF('projektTitel', e.target.value)} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={f.contactEmail || ''} onChange={e => upF('contactEmail', e.target.value)} /></FormRow>
        </div>

        {/* Texte */}
        <div style={{ fontFamily: font.body, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>Projekttexte</div>
        <FormRow label="Ausgangslage"><textarea style={{ ...S.input, minHeight: 55, resize: 'vertical' }} placeholder="Aktuelle Situation, Probleme, Status quo\u2026" value={f.ausgangslage || ''} onChange={e => upF('ausgangslage', e.target.value)} /></FormRow>
        <FormRow label="Zielsetzung"><textarea style={{ ...S.input, minHeight: 55, resize: 'vertical' }} placeholder="Was soll erreicht werden?\u2026" value={f.zielsetzung || ''} onChange={e => upF('zielsetzung', e.target.value)} /></FormRow>

        {/* Leistungen */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <div style={{ fontFamily: font.body, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Leistungspositionen</div>
          <button onClick={() => setLeist(l => [...l, { name: '', desc: '', price: 0 }])} style={{ ...S.btn, ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}>+ Position</button>
        </div>
        {leist.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', padding: 8, background: C.bgHover, borderRadius: 8 }}>
            <div style={{ flex: 1 }}>
              <input style={{ ...S.input, fontSize: 12, fontWeight: 500, marginBottom: 4 }} placeholder="Leistung" value={l.name} onChange={e => upL(i, 'name', e.target.value)} />
              <input style={{ ...S.input, fontSize: 11 }} placeholder="Beschreibung" value={l.desc} onChange={e => upL(i, 'desc', e.target.value)} />
            </div>
            <div style={{ width: 90 }}>
              <input style={{ ...S.input, textAlign: 'right', fontSize: 12, fontWeight: 600 }} type="number" value={l.price || ''} onChange={e => upL(i, 'price', e.target.value)} />
              <div style={{ fontSize: 9, color: C.textMuted, textAlign: 'right', marginTop: 2 }}>EUR netto</div>
            </div>
            <button onClick={() => setLeist(ls => ls.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>{'\u00D7'}</button>
          </div>
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, marginBottom: 12 }}>
          {LEISTUNG_VORLAGEN.map((v, i) => (
            <button key={i} onClick={() => setLeist(l => [...l, { ...v }])} style={{ ...S.btn, ...S.btnGhost, padding: '3px 8px', fontSize: 10, color: C.textDim }}>{v.name}</button>
          ))}
        </div>

        {/* Summe */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: C.accentDim, borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.accent }}>Gesamt (brutto)</span>
          <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: C.accent }}>{fmtCur(brutto)}</span>
        </div>

        {/* Zeitplan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: font.body, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Zeitplan</div>
          <button onClick={() => setZeit(z => [...z, { phase: '', dauer: '' }])} style={{ ...S.btn, ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}>+ Phase</button>
        </div>
        {zeit.map((z, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
            <span style={{ fontFamily: font.body, fontSize: 11, color: C.accent, fontWeight: 700, width: 18, textAlign: 'center' }}>{i + 1}</span>
            <input style={{ ...S.input, flex: 1, fontSize: 12 }} placeholder="Phase" value={z.phase} onChange={e => setZeit(zz => zz.map((x, j) => j === i ? { ...x, phase: e.target.value } : x))} />
            <input style={{ ...S.input, width: 110, fontSize: 12 }} placeholder="Dauer" value={z.dauer} onChange={e => setZeit(zz => zz.map((x, j) => j === i ? { ...x, dauer: e.target.value } : x))} />
            <button onClick={() => setZeit(zz => zz.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 14 }}>{'\u00D7'}</button>
          </div>
        ))}

        {/* Absender */}
        <div style={{ fontFamily: font.body, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16, marginBottom: 8, fontWeight: 600 }}>Absender</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <FormRow label="Name"><input style={S.input} value={f.absenderName || ''} onChange={e => upF('absenderName', e.target.value)} /></FormRow>
          <FormRow label="E-Mail"><input style={S.input} value={f.absenderEmail || ''} onChange={e => upF('absenderEmail', e.target.value)} /></FormRow>
          <FormRow label="Telefon"><input style={S.input} value={f.absenderTelefon || ''} onChange={e => upF('absenderTelefon', e.target.value)} /></FormRow>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
        <button onClick={generate} disabled={!ready || generating} style={{ ...S.btn, ...S.btnPrimary, opacity: ready ? 1 : 0.5 }}>
          {generating ? 'Wird erstellt\u2026' : success ? '\u2713 PDF heruntergeladen' : 'PDF generieren'}
        </button>
      </div>
    </Modal>
  );
};

// ============================================================================
// PAGES — DEAL DETAIL
// ============================================================================
const DealDetail = ({ data, helpers, actions }) => {
  const { id } = useParams();
  const nav = useNavigate();
  const deal = helpers.getDeal(id);
  const [logOpen, setLogOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAngebot, setShowAngebot] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (!deal) return <div style={S.page}><BackButton to="/pipeline" /><Empty text="Deal nicht gefunden" /></div>;

  const company = helpers.getCompany(deal.companyId);
  const contact = helpers.getContact(deal.contactId);
  const activities = helpers.dealActivities(id);
  const companyContacts = company ? helpers.companyContacts(company.id) : [];

  const changeStage = (stage) => {
    actions.updateDeal(id, { status: stage });
    actions.addActivity({ companyId: deal.companyId, contactId: deal.contactId, dealId: id, type: 'Notiz', subject: `Stage → ${stage}`, content: `Deal wurde auf "${stage}" verschoben.` });
    // Auto-create project when deal is won
    if (stage === 'Gewonnen') {
      const existingProject = data.projects.find(p => p.dealId === id);
      if (!existingProject) {
        actions.addProject({ companyId: deal.companyId, dealId: id, name: `${deal.service || 'Projekt'}: ${deal.title}`, status: 'Planung', progress: 0, deadline: '', notes: `Aus Deal "${deal.title}" erstellt.` });
        actions.addActivity({ companyId: deal.companyId, contactId: deal.contactId, dealId: id, type: 'Notiz', subject: 'Projekt erstellt', content: `Projekt automatisch aus gewonnenem Deal erstellt.` });
      }
    }
  };

  const openEdit = () => { setEditForm({ ...deal }); setShowEdit(true); };
  const saveEdit = () => { actions.updateDeal(id, editForm); setShowEdit(false); };
  const handleDelete = () => { if (confirm(`Deal "${deal.title}" löschen?`)) { actions.deleteDeal(id); nav('/pipeline'); } };

  const isOverdue = deal.followUp && new Date(deal.followUp) < new Date() && !['Gewonnen', 'Verloren'].includes(deal.status);

  return (
    <div style={S.page}>
      <BackButton to="/pipeline" label="Zurück zur Pipeline" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.pageTitle}>{deal.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {company && <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none' }}><Badge>{company.name}</Badge></Link>}
            {contact && <Link to={`/contacts/${contact.id}`} style={{ textDecoration: 'none' }}><Badge variant="blue">{contact.firstName} {contact.lastName}</Badge></Link>}
            <Badge variant="green">{deal.volume?.toLocaleString('de-DE')}€</Badge>
            {isOverdue && <Badge variant="orange">Follow-up überfällig</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAngebot(true)} style={{ ...S.btn, background: C.blueDim, color: C.blue }}>{React.cloneElement(Icons.sops, { size: 14, color: C.blue })} Angebot</button>
          <button onClick={openEdit} style={{ ...S.btn, ...S.btnGhost }}>{React.cloneElement(Icons.edit, { size: 14, color: C.textDim })} Bearbeiten</button>
          <button onClick={() => setLogOpen(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Aktivität</button>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div style={{ ...S.card, marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Deal-Stage</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {DEAL_STAGES.map(stage => {
            const isActive = deal.status === stage;
            const isPast = DEAL_STAGES.indexOf(stage) < DEAL_STAGES.indexOf(deal.status);
            const isWon = stage === 'Gewonnen';
            const isLost = stage === 'Verloren';
            return (
              <button key={stage} onClick={() => changeStage(stage)} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: isActive ? `2px solid ${isWon ? C.green : isLost ? C.red : C.accent}` : `1px solid ${C.border}`, background: isActive ? (isWon ? C.greenDim : isLost ? C.redDim : C.accentDim) : isPast ? C.bgHover : 'transparent', color: isActive ? (isWon ? C.green : isLost ? C.red : C.accent) : isPast ? C.text : C.textMuted, fontFamily: font.body, fontSize: 12, fontWeight: isActive ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['Anruf', Icons.phone, C.green], ['E-Mail', Icons.mail, C.blue], ['Loom', Icons.video, C.purple], ['Meeting', Icons.calendar, C.orange]].map(([type, icon, col]) => (
          <button key={type} onClick={() => { actions.addActivity({ companyId: deal.companyId, contactId: deal.contactId, dealId: id, type, subject: `${type} geloggt`, content: `Schnell-Log: ${type}` }); }} style={{ ...S.btn, ...S.btnGhost, borderColor: col, color: col }}>
            {React.cloneElement(icon, { size: 14, color: col })} {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Details</h3>
          {[['Service', deal.service], ['Volumen', deal.volume ? `${deal.volume.toLocaleString('de-DE')}€` : null], ['Quelle', deal.source], ['Follow-up', deal.followUp && new Date(deal.followUp).toLocaleDateString('de-DE')], ['Erstellt', deal.created && new Date(deal.created).toLocaleDateString('de-DE')]].map(([l, v]) => v ? (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{l}</span>
              <span style={{ fontFamily: font.body, fontSize: 12, color: l === 'Follow-up' && isOverdue ? C.orange : C.text, fontWeight: l === 'Follow-up' && isOverdue ? 600 : 400 }}>{v}</span>
            </div>
          ) : null)}
          {deal.notes && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Notizen</div>
              <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, padding: 10, background: C.bgHover, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{deal.notes}</div>
            </div>
          )}
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Aktivitäten</h3>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} companyId={deal.companyId} contactId={deal.contactId} dealId={id} contacts={companyContacts} deals={[deal]} actions={actions} />

      <AngebotModal open={showAngebot} onClose={() => setShowAngebot(false)} deal={deal} company={company} contact={contact} actions={actions} />

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Deal bearbeiten" width={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Deal-Titel"><input style={S.input} value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></FormRow>
          <FormRow label="Kontakt">
            <select style={S.select} value={editForm.contactId || ''} onChange={e => setEditForm(f => ({ ...f, contactId: e.target.value }))}>
              <option value="">–</option>{companyContacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </FormRow>
          <FormRow label="Service"><select style={S.select} value={editForm.service || ''} onChange={e => setEditForm(f => ({ ...f, service: e.target.value }))}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></FormRow>
          <FormRow label="Volumen (€)"><input style={S.input} type="number" value={editForm.volume || ''} onChange={e => setEditForm(f => ({ ...f, volume: Number(e.target.value) || 0 }))} /></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={editForm.source || ''} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}><option value="">–</option><option>Outreach</option><option>Google Ads</option><option>Empfehlung</option><option>Direkt</option></select></FormRow>
          <FormRow label="Follow-up"><input style={S.input} type="date" value={editForm.followUp || ''} onChange={e => setEditForm(f => ({ ...f, followUp: e.target.value }))} /></FormRow>
        </div>
        <FormRow label="Notizen"><textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></FormRow>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={handleDelete} style={{ ...S.btn, background: C.redDim, color: C.red }}>{React.cloneElement(Icons.trash, { size: 13, color: C.red })} Löschen</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — PROJECTS (full CRUD)
// ============================================================================
const Projects = ({ data, helpers, actions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', companyId: '', status: 'Planung', progress: 0, deadline: '', notes: '' });
  const [editForm, setEditForm] = useState({});

  const save = () => { if (!form.name.trim()) return; actions.addProject(form); setShowAdd(false); setForm({ name: '', companyId: '', status: 'Planung', progress: 0, deadline: '', notes: '' }); };
  const saveEdit = () => { actions.updateProject(editForm.id, editForm); setShowEdit(false); };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Projekte</h1><p style={S.pageSub}>{data.projects.length} Projekte</p></div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neues Projekt</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {data.projects.map(p => {
          const comp = helpers.getCompany(p.companyId);
          const ws = data.websites.filter(w => w.projectId === p.id);
          return (
            <div key={p.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 500, color: C.text }}>{p.name}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {statusBadge(p.status)}
                  <button onClick={() => { setEditForm({ ...p }); setShowEdit(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button>
                </div>
              </div>
              {comp && <Link to={`/companies/${comp.id}`} style={{ ...S.link, fontSize: 12 }}>{comp.name}</Link>}
              <div style={{ height: 4, background: C.border, borderRadius: 2, margin: '12px 0 6px' }}><div style={{ height: '100%', width: `${p.progress}%`, background: p.progress >= 75 ? C.green : C.accent, borderRadius: 2 }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{p.progress}%</span>
                {p.deadline && <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{new Date(p.deadline).toLocaleDateString('de-DE')}</span>}
              </div>
              {ws.map(w => <div key={w.id} style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, marginTop: 6 }}>🌐 {w.url}</div>)}
              {p.notes && <div style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted, marginTop: 6, fontStyle: 'italic' }}>{p.notes}</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[0, 25, 50, 75, 100].map(v => (
                  <button key={v} onClick={() => actions.updateProject(p.id, { progress: v, status: v === 100 ? 'Fertig' : v > 0 ? 'In Arbeit' : 'Planung' })} style={{ ...S.btn, padding: '4px 8px', fontSize: 10, ...(p.progress === v ? S.btnPrimary : S.btnGhost) }}>{v}%</button>
                ))}
              </div>
            </div>
          );
        })}
        {data.projects.length === 0 && <Empty text="Keine Projekte" />}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neues Projekt">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Projektname *"><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="Firma"><select style={S.select} value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}><option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormRow>
          <FormRow label="Deadline"><input style={S.input} type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></FormRow>
          <FormRow label="Status"><select style={S.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Planung</option><option>In Arbeit</option><option>Fertig</option></select></FormRow>
        </div>
        <FormRow label="Notizen"><textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Projekt bearbeiten">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Projektname"><input style={S.input} value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="Firma"><select style={S.select} value={editForm.companyId || ''} onChange={e => setEditForm(f => ({ ...f, companyId: e.target.value }))}><option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormRow>
          <FormRow label="Deadline"><input style={S.input} type="date" value={editForm.deadline || ''} onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))} /></FormRow>
          <FormRow label="Status"><select style={S.select} value={editForm.status || ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option>Planung</option><option>In Arbeit</option><option>Fertig</option></select></FormRow>
        </div>
        <FormRow label="Notizen"><textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGES — WEBSITES (full CRUD)
// ============================================================================
const Websites = ({ data, helpers, actions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', companyId: '', projectId: '', status: 'Entwicklung', hosting: 'Coolify', footerLink: true });
  const [editForm, setEditForm] = useState({});

  const save = () => { if (!form.name.trim()) return; actions.addWebsite(form); setShowAdd(false); setForm({ name: '', url: '', companyId: '', projectId: '', status: 'Entwicklung', hosting: 'Coolify', footerLink: true }); };
  const saveEdit = () => { actions.updateWebsite(editForm.id, editForm); setShowEdit(false); };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={S.pageTitle}>Websites</h1><p style={S.pageSub}>{data.websites.length} Websites</p></div>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neue Website</button>
      </div>
      <div style={S.card}>
        <table style={S.table}><thead><tr><th style={S.th}>Name</th><th style={S.th}>URL</th><th style={S.th}>Firma</th><th style={S.th}>Status</th><th style={S.th}>Hosting</th><th style={S.th}>Footer</th><th style={S.th}></th></tr></thead>
          <tbody>{data.websites.map(w => {
            const comp = helpers.getCompany(w.companyId);
            return <tr key={w.id}><td style={S.td}>{w.name}</td><td style={{ ...S.td, color: C.accent }}>{w.url}</td><td style={S.td}>{comp && <Link to={`/companies/${comp.id}`} style={S.link}>{comp.name}</Link>}</td><td style={S.td}>{statusBadge(w.status)}</td><td style={{ ...S.td, color: C.textDim }}>{w.hosting}</td><td style={S.td}>{w.footerLink ? '✓' : '–'}</td><td style={S.td}><button onClick={() => { setEditForm({ ...w }); setShowEdit(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button></td></tr>;
          })}</tbody></table>
        {data.websites.length === 0 && <Empty text="Keine Websites" />}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neue Website">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Name *"><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="URL"><input style={S.input} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="domain.de" /></FormRow>
          <FormRow label="Firma"><select style={S.select} value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}><option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormRow>
          <FormRow label="Projekt"><select style={S.select} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}><option value="">–</option>{data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormRow>
          <FormRow label="Status"><select style={S.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Entwicklung</option><option>Staging</option><option>Live</option></select></FormRow>
          <FormRow label="Hosting"><input style={S.input} value={form.hosting} onChange={e => setForm(f => ({ ...f, hosting: e.target.value }))} /></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Website bearbeiten">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Name"><input style={S.input} value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
          <FormRow label="URL"><input style={S.input} value={editForm.url || ''} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} /></FormRow>
          <FormRow label="Firma"><select style={S.select} value={editForm.companyId || ''} onChange={e => setEditForm(f => ({ ...f, companyId: e.target.value }))}><option value="">–</option>{data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormRow>
          <FormRow label="Status"><select style={S.select} value={editForm.status || ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option>Entwicklung</option><option>Staging</option><option>Live</option></select></FormRow>
          <FormRow label="Hosting"><input style={S.input} value={editForm.hosting || ''} onChange={e => setEditForm(f => ({ ...f, hosting: e.target.value }))} /></FormRow>
          <FormRow label="Footer-Link"><select style={S.select} value={editForm.footerLink ? 'ja' : 'nein'} onChange={e => setEditForm(f => ({ ...f, footerLink: e.target.value === 'ja' }))}><option value="ja">Ja</option><option value="nein">Nein</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowEdit(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

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
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Task</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} style={{ ...S.btn, padding: '6px 12px', fontSize: 12, ...(filter === c ? S.btnPrimary : S.btnGhost) }}>{c}</button>)}
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
          <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// FULL MODULES — Outreach, Ads, SOPs, Finances, Notes
// ============================================================================
const PageHeader = ({ title, sub, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
    <div><h1 style={S.pageTitle}>{title}</h1>{sub && <p style={S.pageSub}>{sub}</p>}</div>
    {children}
  </div>
);

const Outreach = ({ data, actions }) => {
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [showAddSeq, setShowAddSeq] = useState(false);
  const [domForm, setDomForm] = useState({ name: '', mailboxes: '', warmup: 'Aktiv' });
  const [listForm, setListForm] = useState({ name: '', count: 0, source: 'Outscraper' });
  const [seqForm, setSeqForm] = useState({ name: '', steps: [{ day: 1, subject: '', body: '' }] });

  const saveDomain = () => {
    if (!domForm.name.trim()) return;
    const d = { ...domForm, mailboxes: domForm.mailboxes.split(',').map(m => m.trim()).filter(Boolean) };
    actions.updateOutreach({ domains: [...data.outreach.domains, d] });
    setShowAddDomain(false); setDomForm({ name: '', mailboxes: '', warmup: 'Aktiv' });
  };

  const removeDomain = (i) => { actions.updateOutreach({ domains: data.outreach.domains.filter((_, idx) => idx !== i) }); };

  const saveList = () => {
    if (!listForm.name.trim()) return;
    actions.updateOutreach({ lists: [...data.outreach.lists, { ...listForm, count: Number(listForm.count) || 0 }] });
    setShowAddList(false); setListForm({ name: '', count: 0, source: 'Outscraper' });
  };

  const removeList = (i) => { actions.updateOutreach({ lists: data.outreach.lists.filter((_, idx) => idx !== i) }); };

  const updateListCount = (i, count) => {
    const lists = [...data.outreach.lists]; lists[i] = { ...lists[i], count: Number(count) || 0 };
    actions.updateOutreach({ lists });
  };

  const saveSeq = () => {
    if (!seqForm.name.trim()) return;
    actions.updateOutreach({ sequences: [...data.outreach.sequences, { ...seqForm }] });
    setShowAddSeq(false); setSeqForm({ name: '', steps: [{ day: 1, subject: '', body: '' }] });
  };

  const addSeqStep = () => setSeqForm(f => ({ ...f, steps: [...f.steps, { day: f.steps.length * 3 + 1, subject: '', body: '' }] }));

  return (
    <div style={S.page}>
      <PageHeader title="Cold Outreach" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Domains & Postfächer</h3>
            <button onClick={() => setShowAddDomain(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 11, padding: '5px 10px' }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Domain</button>
          </div>
          {data.outreach.domains.map((d, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text }}>{d.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 11, color: C.textDim }}>{d.mailboxes.join(', ')}</div>
                <Badge variant="green">{d.warmup}</Badge>
              </div>
              <button onClick={() => removeDomain(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button>
            </div>
          ))}
          {data.outreach.domains.length === 0 && <Empty text="Keine Domains" />}
        </div>

        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Sequenzen</h3>
            <button onClick={() => setShowAddSeq(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 11, padding: '5px 10px' }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Sequenz</button>
          </div>
          {data.outreach.sequences.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>{s.name}</div>
              {s.steps.map((st, j) => (
                <div key={j} style={{ padding: '5px 0', borderBottom: `1px solid ${C.border}`, fontFamily: font.body, fontSize: 12, color: C.textDim }}>
                  <Badge variant="blue">Tag {st.day}</Badge> {st.subject}
                </div>
              ))}
            </div>
          ))}
          {data.outreach.sequences.length === 0 && <Empty text="Keine Sequenzen" />}
        </div>

        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Kontaktlisten</h3>
            <button onClick={() => setShowAddList(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 11, padding: '5px 10px' }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Liste</button>
          </div>
          {data.outreach.lists.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <span style={{ fontFamily: font.body, fontSize: 13, color: C.text }}>{l.name}</span>
                <span style={{ fontFamily: font.body, fontSize: 11, color: C.textDim, marginLeft: 8 }}>{l.source}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input style={{ ...S.input, width: 60, textAlign: 'center', padding: '4px 6px', fontSize: 12 }} type="number" value={l.count} onChange={e => updateListCount(i, e.target.value)} />
                <button onClick={() => removeList(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button>
              </div>
            </div>
          ))}
          {data.outreach.lists.length === 0 && <Empty text="Keine Listen" />}
        </div>
      </div>

      <Modal open={showAddDomain} onClose={() => setShowAddDomain(false)} title="Neue Domain">
        <FormRow label="Domain *"><input style={S.input} value={domForm.name} onChange={e => setDomForm(f => ({ ...f, name: e.target.value }))} placeholder="elevo-digital.de" /></FormRow>
        <FormRow label="Postfächer (kommagetrennt)"><input style={S.input} value={domForm.mailboxes} onChange={e => setDomForm(f => ({ ...f, mailboxes: e.target.value }))} placeholder="info@domain.de, hello@domain.de" /></FormRow>
        <FormRow label="Warmup"><select style={S.select} value={domForm.warmup} onChange={e => setDomForm(f => ({ ...f, warmup: e.target.value }))}><option>Aktiv</option><option>Fertig</option><option>Pausiert</option></select></FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAddDomain(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveDomain} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
      <Modal open={showAddList} onClose={() => setShowAddList(false)} title="Neue Kontaktliste">
        <FormRow label="Listenname *"><input style={S.input} value={listForm.name} onChange={e => setListForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Handwerker Aachen" /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Anzahl Kontakte"><input style={S.input} type="number" value={listForm.count} onChange={e => setListForm(f => ({ ...f, count: e.target.value }))} /></FormRow>
          <FormRow label="Quelle"><select style={S.select} value={listForm.source} onChange={e => setListForm(f => ({ ...f, source: e.target.value }))}><option>Outscraper</option><option>LinkedIn</option><option>Google Maps</option><option>Manuell</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowAddList(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveList} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
      <Modal open={showAddSeq} onClose={() => setShowAddSeq(false)} title="Neue Sequenz" width={560}>
        <FormRow label="Sequenzname *"><input style={S.input} value={seqForm.name} onChange={e => setSeqForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Webdesign Cold Outreach" /></FormRow>
        {seqForm.steps.map((st, i) => (
          <div key={i} style={{ ...S.card, padding: 12, marginBottom: 8 }}>
            <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Schritt {i + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8 }}>
              <FormRow label="Tag"><input style={S.input} type="number" value={st.day} onChange={e => { const steps = [...seqForm.steps]; steps[i] = { ...steps[i], day: Number(e.target.value) }; setSeqForm(f => ({ ...f, steps })); }} /></FormRow>
              <FormRow label="Betreff"><input style={S.input} value={st.subject} onChange={e => { const steps = [...seqForm.steps]; steps[i] = { ...steps[i], subject: e.target.value }; setSeqForm(f => ({ ...f, steps })); }} /></FormRow>
            </div>
          </div>
        ))}
        <button onClick={addSeqStep} style={{ ...S.btn, ...S.btnGhost, fontSize: 11, marginBottom: 12 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.textDim })} Schritt</button>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowAddSeq(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
          <button onClick={saveSeq} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
      </Modal>
    </div>
  );
};

const Ads = ({ data, actions }) => {
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showEditCampaign, setShowEditCampaign] = useState(false);
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [campForm, setCampForm] = useState({ name: '', status: 'Geplant', budget: 0, clicks: 0, impressions: 0, ctr: 0, conversions: 0 });
  const [editIdx, setEditIdx] = useState(-1);
  const [kwForm, setKwForm] = useState('');

  const saveCampaign = () => { if (!campForm.name.trim()) return; actions.updateAds({ campaigns: [...data.ads.campaigns, { ...campForm, budget: Number(campForm.budget), clicks: Number(campForm.clicks), impressions: Number(campForm.impressions), ctr: Number(campForm.ctr), conversions: Number(campForm.conversions) }] }); setShowAddCampaign(false); setCampForm({ name: '', status: 'Geplant', budget: 0, clicks: 0, impressions: 0, ctr: 0, conversions: 0 }); };
  const openEdit = (i) => { setCampForm({ ...data.ads.campaigns[i] }); setEditIdx(i); setShowEditCampaign(true); };
  const saveEditCampaign = () => { const c = [...data.ads.campaigns]; c[editIdx] = { ...campForm, budget: Number(campForm.budget), clicks: Number(campForm.clicks), impressions: Number(campForm.impressions), ctr: Number(campForm.ctr), conversions: Number(campForm.conversions) }; actions.updateAds({ campaigns: c }); setShowEditCampaign(false); };
  const removeCampaign = (i) => { actions.updateAds({ campaigns: data.ads.campaigns.filter((_, idx) => idx !== i) }); };
  const addKeyword = () => { if (!kwForm.trim()) return; actions.updateAds({ negativeKeywords: [...data.ads.negativeKeywords, kwForm.trim().toLowerCase()] }); setKwForm(''); setShowAddKeyword(false); };
  const removeKeyword = (i) => { actions.updateAds({ negativeKeywords: data.ads.negativeKeywords.filter((_, idx) => idx !== i) }); };

  const totalClicks = data.ads.campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConv = data.ads.campaigns.reduce((s, c) => s + (c.conversions || 0), 0);

  const CampaignFormFields = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <FormRow label="Kampagnenname *"><input style={S.input} value={campForm.name} onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
      <FormRow label="Status"><select style={S.select} value={campForm.status} onChange={e => setCampForm(f => ({ ...f, status: e.target.value }))}><option>Geplant</option><option>Aktiv</option><option>Pausiert</option></select></FormRow>
      <FormRow label="Budget (€)"><input style={S.input} type="number" value={campForm.budget} onChange={e => setCampForm(f => ({ ...f, budget: e.target.value }))} /></FormRow>
      <FormRow label="Klicks"><input style={S.input} type="number" value={campForm.clicks} onChange={e => setCampForm(f => ({ ...f, clicks: e.target.value }))} /></FormRow>
      <FormRow label="Impressions"><input style={S.input} type="number" value={campForm.impressions} onChange={e => setCampForm(f => ({ ...f, impressions: e.target.value }))} /></FormRow>
      <FormRow label="CTR (%)"><input style={S.input} type="number" step="0.1" value={campForm.ctr} onChange={e => setCampForm(f => ({ ...f, ctr: e.target.value }))} /></FormRow>
      <FormRow label="Conversions"><input style={S.input} type="number" value={campForm.conversions} onChange={e => setCampForm(f => ({ ...f, conversions: e.target.value }))} /></FormRow>
    </div>
  );

  return (
    <div style={S.page}>
      <PageHeader title="Google Ads" sub={`${data.ads.budget}€/Monat • ${data.ads.region}`}>
        <button onClick={() => setShowAddCampaign(true)} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Kampagne</button>
      </PageHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Budget" value={`${data.ads.budget}€`} sub="pro Monat" />
        <StatCard label="Klicks" value={totalClicks} color={C.blue} />
        <StatCard label="Conversions" value={totalConv} color={C.green} />
        <StatCard label="Kampagnen" value={data.ads.campaigns.length} color={C.purple} />
      </div>
      <div style={S.card}>
        <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Kampagnen</h3>
        <table style={S.table}><thead><tr><th style={S.th}>Kampagne</th><th style={S.th}>Status</th><th style={S.th}>Budget</th><th style={S.th}>Klicks</th><th style={S.th}>Impr.</th><th style={S.th}>CTR</th><th style={S.th}>Conv.</th><th style={S.th}></th></tr></thead>
          <tbody>{data.ads.campaigns.map((c, i) => (
            <tr key={i}><td style={S.td}>{c.name}</td><td style={S.td}>{statusBadge(c.status)}</td><td style={{ ...S.td, color: C.accent }}>{c.budget}€</td><td style={S.td}>{c.clicks}</td><td style={S.td}>{c.impressions}</td><td style={S.td}>{c.ctr}%</td><td style={S.td}>{c.conversions}</td>
            <td style={S.td}><div style={{ display: 'flex', gap: 6 }}><button onClick={() => openEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button><button onClick={() => removeCampaign(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button></div></td></tr>
          ))}</tbody></table>
      </div>
      <div style={{ ...S.card, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Negative Keywords</h3>
          <button onClick={() => setShowAddKeyword(true)} style={{ ...S.btn, ...S.btnGhost, fontSize: 11 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.textDim })} Keyword</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {data.ads.negativeKeywords.map((k, i) => (
            <span key={i} style={{ ...S.badge(C.redDim, C.red), cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => removeKeyword(i)}>{k} ×</span>
          ))}
        </div>
      </div>
      <Modal open={showAddCampaign} onClose={() => setShowAddCampaign(false)} title="Neue Kampagne"><CampaignFormFields /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}><button onClick={() => setShowAddCampaign(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button><button onClick={saveCampaign} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button></div></Modal>
      <Modal open={showEditCampaign} onClose={() => setShowEditCampaign(false)} title="Kampagne bearbeiten"><CampaignFormFields /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}><button onClick={() => setShowEditCampaign(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button><button onClick={saveEditCampaign} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button></div></Modal>
      <Modal open={showAddKeyword} onClose={() => setShowAddKeyword(false)} title="Negatives Keyword"><FormRow label="Keyword"><input style={S.input} value={kwForm} onChange={e => setKwForm(e.target.value)} placeholder="z.B. kostenlos" onKeyDown={e => e.key === 'Enter' && addKeyword()} /></FormRow><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}><button onClick={() => setShowAddKeyword(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button><button onClick={addKeyword} style={{ ...S.btn, ...S.btnPrimary }}>Hinzufügen</button></div></Modal>
    </div>
  );
};

const SOPs = ({ data, actions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ title: '', steps: [''] });
  const [editIdx, setEditIdx] = useState(-1);

  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const updateStep = (i, val) => { const s = [...form.steps]; s[i] = val; setForm(f => ({ ...f, steps: s })); };
  const removeStep = (i) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const save = () => {
    if (!form.title.trim()) return;
    const sop = { id: uid(), title: form.title, steps: form.steps.filter(s => s.trim()) };
    const newSops = editIdx >= 0 ? data.sops.map((s, i) => i === editIdx ? sop : s) : [...data.sops, sop];
    // We need to update sops directly in data - using a workaround via localStorage
    const d = JSON.parse(localStorage.getItem('elevo-v7'));
    d.sops = newSops;
    localStorage.setItem('elevo-v7', JSON.stringify(d));
    window.location.reload();
  };

  const removeSop = (i) => {
    const d = JSON.parse(localStorage.getItem('elevo-v7'));
    d.sops = d.sops.filter((_, idx) => idx !== i);
    localStorage.setItem('elevo-v7', JSON.stringify(d));
    window.location.reload();
  };

  const openEdit = (i) => { setForm({ title: data.sops[i].title, steps: [...data.sops[i].steps] }); setEditIdx(i); setShowEdit(true); };

  return (
    <div style={S.page}>
      <PageHeader title="SOPs" sub={`${data.sops.length} Prozesse`}>
        <button onClick={() => { setForm({ title: '', steps: [''] }); setEditIdx(-1); setShowAdd(true); }} style={{ ...S.btn, ...S.btnPrimary }}>{React.cloneElement(Icons.plus, { size: 14, color: C.bg })} Neue SOP</button>
      </PageHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {data.sops.map((s, si) => (
          <div key={s.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>{s.title}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(si)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button>
                <button onClick={() => removeSop(si)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button>
              </div>
            </div>
            {s.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: font.body, fontSize: 11, color: C.accent, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.textDim }}>{step}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {[showAdd, showEdit].some(Boolean) && (
        <Modal open={showAdd || showEdit} onClose={() => { setShowAdd(false); setShowEdit(false); }} title={editIdx >= 0 ? 'SOP bearbeiten' : 'Neue SOP'} width={520}>
          <FormRow label="Titel *"><input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Neuer Lead – Erstansprache" /></FormRow>
          <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, marginBottom: 8 }}>Schritte</div>
          {form.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: font.body, fontSize: 11, color: C.accent, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
              <input style={{ ...S.input, flex: 1 }} value={step} onChange={e => updateStep(i, e.target.value)} placeholder={`Schritt ${i + 1}`} />
              {form.steps.length > 1 && <button onClick={() => removeStep(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.x, { size: 14, color: C.textMuted })}</button>}
            </div>
          ))}
          <button onClick={addStep} style={{ ...S.btn, ...S.btnGhost, fontSize: 11, marginTop: 4 }}>{React.cloneElement(Icons.plus, { size: 12, color: C.textDim })} Schritt</button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button onClick={() => { setShowAdd(false); setShowEdit(false); }} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
            <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Finances = ({ data, actions }) => {
  const [showAddCost, setShowAddCost] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [costForm, setCostForm] = useState({ name: '', amount: 0, category: 'Tools' });
  const [revForm, setRevForm] = useState({ name: '', amount: 0, date: '', source: '' });

  const total = data.finances.fixcosts.reduce((s, f) => s + f.amount, 0);
  const totalRev = (data.finances.revenue || []).reduce((s, r) => s + r.amount, 0);

  const saveCost = () => {
    if (!costForm.name.trim()) return;
    actions.updateFinances({ fixcosts: [...data.finances.fixcosts, { ...costForm, amount: Number(costForm.amount) || 0 }] });
    setShowAddCost(false); setCostForm({ name: '', amount: 0, category: 'Tools' });
  };

  const removeCost = (i) => { actions.updateFinances({ fixcosts: data.finances.fixcosts.filter((_, idx) => idx !== i) }); };

  const updateCostAmount = (i, amount) => {
    const fc = [...data.finances.fixcosts]; fc[i] = { ...fc[i], amount: Number(amount) || 0 };
    actions.updateFinances({ fixcosts: fc });
  };

  const saveRevenue = () => {
    if (!revForm.name.trim()) return;
    actions.updateFinances({ revenue: [...(data.finances.revenue || []), { ...revForm, amount: Number(revForm.amount) || 0, date: revForm.date || new Date().toISOString().slice(0, 10) }] });
    setShowAddRevenue(false); setRevForm({ name: '', amount: 0, date: '', source: '' });
  };

  const removeRevenue = (i) => { actions.updateFinances({ revenue: (data.finances.revenue || []).filter((_, idx) => idx !== i) }); };

  return (
    <div style={S.page}>
      <PageHeader title="Finanzen" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Fixkosten / Monat" value={`${total}€`} color={C.red} />
        <StatCard label="Fixkosten / Jahr" value={`${(total * 12).toLocaleString('de-DE')}€`} color={C.orange} />
        <StatCard label="Umsatz gesamt" value={`${totalRev.toLocaleString('de-DE')}€`} color={C.green} />
        <StatCard label="Break-Even" value={`${Math.ceil(total / 500)} Deals`} sub="bei Ø 500€/Deal" color={C.blue} />
        <StatCard label="Gewinn/Verlust" value={`${(totalRev - total).toLocaleString('de-DE')}€`} sub="diesen Monat" color={totalRev >= total ? C.green : C.red} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Fixkosten</h3>
            <button onClick={() => setShowAddCost(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 11, padding: '5px 10px' }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Kosten</button>
          </div>
          <table style={S.table}><thead><tr><th style={S.th}>Posten</th><th style={S.th}>Kategorie</th><th style={S.th}>Betrag</th><th style={S.th}></th></tr></thead>
            <tbody>{data.finances.fixcosts.map((f, i) => (
              <tr key={i}><td style={S.td}>{f.name}</td><td style={S.td}><Badge>{f.category}</Badge></td><td style={S.td}><input style={{ ...S.input, width: 70, textAlign: 'right', padding: '3px 6px', fontSize: 12 }} type="number" value={f.amount} onChange={e => updateCostAmount(i, e.target.value)} />€</td><td style={S.td}><button onClick={() => removeCost(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button></td></tr>
            ))}</tbody></table>
          <div style={{ padding: '10px 12px', fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.red, borderTop: `2px solid ${C.border}` }}>Gesamt: {total}€ / Monat</div>
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: 0 }}>Umsätze</h3>
            <button onClick={() => setShowAddRevenue(true)} style={{ ...S.btn, ...S.btnPrimary, fontSize: 11, padding: '5px 10px' }}>{React.cloneElement(Icons.plus, { size: 12, color: C.bg })} Umsatz</button>
          </div>
          {(data.finances.revenue || []).length === 0 ? <Empty text="Noch keine Umsätze" /> : (
            <table style={S.table}><thead><tr><th style={S.th}>Beschreibung</th><th style={S.th}>Betrag</th><th style={S.th}>Datum</th><th style={S.th}></th></tr></thead>
              <tbody>{(data.finances.revenue || []).map((r, i) => (
                <tr key={i}><td style={S.td}>{r.name}</td><td style={{ ...S.td, fontWeight: 600, color: C.green }}>{r.amount.toLocaleString('de-DE')}€</td><td style={{ ...S.td, color: C.textDim }}>{r.date && new Date(r.date).toLocaleDateString('de-DE')}</td><td style={S.td}><button onClick={() => removeRevenue(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button></td></tr>
              ))}</tbody></table>
          )}
        </div>
      </div>
      <Modal open={showAddCost} onClose={() => setShowAddCost(false)} title="Neue Fixkosten">
        <FormRow label="Posten *"><input style={S.input} value={costForm.name} onChange={e => setCostForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Hosting" /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Betrag (€)"><input style={S.input} type="number" value={costForm.amount} onChange={e => setCostForm(f => ({ ...f, amount: e.target.value }))} /></FormRow>
          <FormRow label="Kategorie"><select style={S.select} value={costForm.category} onChange={e => setCostForm(f => ({ ...f, category: e.target.value }))}><option>Tools</option><option>Marketing</option><option>Infrastruktur</option><option>Sonstiges</option></select></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}><button onClick={() => setShowAddCost(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button><button onClick={saveCost} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button></div>
      </Modal>
      <Modal open={showAddRevenue} onClose={() => setShowAddRevenue(false)} title="Neuer Umsatz">
        <FormRow label="Beschreibung *"><input style={S.input} value={revForm.name} onChange={e => setRevForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Website Bar Lighthouse" /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Betrag (€)"><input style={S.input} type="number" value={revForm.amount} onChange={e => setRevForm(f => ({ ...f, amount: e.target.value }))} /></FormRow>
          <FormRow label="Datum"><input style={S.input} type="date" value={revForm.date} onChange={e => setRevForm(f => ({ ...f, date: e.target.value }))} /></FormRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}><button onClick={() => setShowAddRevenue(false)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button><button onClick={saveRevenue} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button></div>
      </Modal>
    </div>
  );
};

const Notes = ({ data, actions }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');

  const save = () => { if (!title.trim()) return; actions.addNote({ title, content: text }); setTitle(''); setText(''); };
  const startEdit = (n) => { setEditId(n.id); setEditTitle(n.title); setEditText(n.content); };
  const saveEdit = () => {
    const d = JSON.parse(localStorage.getItem('elevo-v7'));
    d.notes = d.notes.map(n => n.id === editId ? { ...n, title: editTitle, content: editText } : n);
    localStorage.setItem('elevo-v7', JSON.stringify(d));
    setEditId(null); window.location.reload();
  };

  return (
    <div style={S.page}>
      <PageHeader title="Notizen" sub={`${data.notes.length} Notizen`} />
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Titel..." value={title} onChange={e => setTitle(e.target.value)} />
          <button onClick={save} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
        </div>
        <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Notiz schreiben..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) save(); }} />
      </div>
      {[...data.notes].reverse().map(n => (
        <div key={n.id} style={{ ...S.card, marginBottom: 10 }}>
          {editId === n.id ? (
            <div>
              <input style={{ ...S.input, marginBottom: 8 }} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical', marginBottom: 8 }} value={editText} onChange={e => setEditText(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditId(null)} style={{ ...S.btn, ...S.btnGhost }}>Abbrechen</button>
                <button onClick={saveEdit} style={{ ...S.btn, ...S.btnPrimary }}>Speichern</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 500, color: C.text }}>{n.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: font.body, fontSize: 11, color: C.textMuted }}>{new Date(n.created).toLocaleDateString('de-DE')}</span>
                  <button onClick={() => startEdit(n)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.edit, { size: 13, color: C.textMuted })}</button>
                  <button onClick={() => actions.deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{React.cloneElement(Icons.trash, { size: 13, color: C.textMuted })}</button>
                </div>
              </div>
              <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, whiteSpace: 'pre-wrap' }}>{n.content}</div>
            </div>
          )}
        </div>
      ))}
      {data.notes.length === 0 && <Empty text="Keine Notizen" />}
    </div>
  );
};


const PlaceholderPage = ({ title, children }) => (
  <div style={S.page}>
    <h1 style={S.pageTitle}>{title}</h1>
    <div style={{ marginTop: 20 }}>{children}</div>
  </div>
);

const Assistant = ({ data, helpers, actions }) => {
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
      const context = `Du bist der ELEVO KI-Assistent. Kontext: ${data.companies.length} Firmen, ${data.contacts.length} Kontakte, ${data.deals.length} Deals (Pipeline: ${helpers.pipelineValue()}€), ${data.tasks.filter(t=>!t.done).length} offene Tasks. Antworte kurz und auf Deutsch.`;
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
              <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: 10, background: m.role === 'user' ? C.accentDim : C.bgHover, color: C.text, fontFamily: font.body, fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.content}</div>
            </div>
          ))}
          {loading && <div style={{ fontFamily: font.body, fontSize: 12, color: C.textDim, padding: 8 }}>Denke nach...</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Frage stellen..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <button onClick={send} style={{ ...S.btn, ...S.btnPrimary }} disabled={loading}>Senden</button>
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
          <button onClick={() => actions.updateSettings({ pin })} style={{ ...S.btn, ...S.btnPrimary, marginTop: 8 }}>PIN speichern</button>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Claude API</h3>
          <FormRow label="API Key"><input style={S.input} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." /></FormRow>
          <button onClick={() => actions.updateSettings({ apiKey })} style={{ ...S.btn, ...S.btnPrimary, marginTop: 8 }}>Key speichern</button>
        </div>
        <div style={S.card}>
          <h3 style={{ fontFamily: font.head, fontSize: 18, color: C.text, margin: '0 0 14px' }}>Backup</h3>
          <button onClick={actions.exportData} style={{ ...S.btn, ...S.btnPrimary, marginBottom: 10 }}>Export JSON</button>
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: C.bg, fontFamily: font.body, color: C.text, overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <Topbar onSearch={() => setSearchOpen(true)} overdueCount={helpers.overdueFollowups().length} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
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
