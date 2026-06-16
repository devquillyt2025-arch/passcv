import type { TemplateId } from './types';

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  /** true = clean layout that parses reliably in ATS scanners. */
  ats: boolean;
  /** One-line description shown in the template gallery. */
  blurb: string;
}

/**
 * Single source of truth for the template list — used by the builder toolbar
 * picker and the /templates gallery so they never drift apart.
 */
export const TEMPLATE_META: TemplateMeta[] = [
  { id: 'classic',         label: 'Classic',         ats: true,  blurb: 'Centered serif with ruled all-caps sections. Timeless, Harvard-style.' },
  { id: 'sidebar-dark',    label: 'Sidebar Dark',    ats: false, blurb: 'Navy sidebar with avatar, white content. Popular in tech.' },
  { id: 'executive-bold',  label: 'Executive Bold',  ats: false, blurb: 'Massive name, two-column grid, timeline dots. High-impact for senior roles.' },
  { id: 'creative-purple', label: 'Creative Purple', ats: false, blurb: 'Full-bleed purple header with skill bars. Design & product roles.' },
  { id: 'swiss-grid',      label: 'Swiss Grid',      ats: false, blurb: 'Stacked giant name, 3-column grid, crimson accents. Editorial.' },
  { id: 'infographic',     label: 'Infographic',     ats: false, blurb: 'Avatar header with dot proficiency meters. Modern and data-visual.' },
  { id: 'minimalist-mono', label: 'Minimalist Mono', ats: true,  blurb: 'Monospace, terminal-inspired // section headers. Developer aesthetic.' },
  { id: 'magazine-spread', label: 'Magazine Spread', ats: false, blurb: 'Huge display name, 3-column feature layout with a stats box. Premium.' },
  { id: 'card-stack',      label: 'Card Stack',      ats: false, blurb: 'Each role in its own rounded card. Warm amber accents.' },
  { id: 'timeline-left',   label: 'Timeline Left',   ats: false, blurb: 'Vertical timeline of your career with indigo markers. Narrative.' },
  { id: 'government',      label: 'Government / Federal', ats: true, blurb: 'USAJobs-style structured serif with full date formatting. Very formal.' },
  { id: 'dark-mode',       label: 'Dark Mode',       ats: false, blurb: 'Dark background with teal accents. Developer / security portfolios.' },
  { id: 'elegant-serif',   label: 'Elegant Serif',   ats: true,  blurb: 'Italic serif name with ornamental dividers. Academic, legal, finance.' },
  { id: 'startup-bold',    label: 'Startup Bold',    ats: false, blurb: 'Oversized orange name, two-column body. YC-startup energy.' },
  { id: 'academic-cv',     label: 'Academic CV',     ats: true,  blurb: 'Long-form CV with publications and hanging indents. Research roles.' },
];
