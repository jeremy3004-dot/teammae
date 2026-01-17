/**
 * Beauty Templates
 * Internal templates that MAE can adapt based on user prompts
 */

export interface Template {
  name: string;
  description: string;
  structure: string;
  components: string[];
  example: string;
}

export const templates = {
  landing: {
    name: 'Marketing Landing Page',
    description: 'Full landing page with hero, features, CTA, and footer',
    structure: `
App Structure:
- Header with logo + navigation (sticky)
- Hero section with headline + CTA (gradient background)
- Features section with 3-column grid
- CTA section (colored background)
- Footer

Components to create:
- src/App.tsx (main layout)
- src/components/Header.tsx
- src/components/Hero.tsx
- src/components/Features.tsx
- src/components/FeatureCard.tsx
- src/components/CTA.tsx
- src/components/Footer.tsx
`,
    components: ['Header', 'Hero', 'Features', 'FeatureCard', 'CTA', 'Footer'],
    example: `
Example structure for App.tsx:

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

Example Hero component:

export function Hero() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
          [Compelling Headline]
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
          [Supporting description]
        </p>
        <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150 shadow-lg hover:shadow-xl">
          Get Started
        </button>
      </div>
    </section>
  );
}
`,
  },

  dashboard: {
    name: 'Dashboard App',
    description: 'Dashboard with sidebar navigation and main content area',
    structure: `
App Structure:
- Header with logo + user menu (sticky)
- Sidebar navigation (240px, hidden on mobile)
- Main content area
- Stats cards at top
- Content cards/tables below

Components to create:
- src/App.tsx (main layout)
- src/components/Header.tsx
- src/components/Sidebar.tsx
- src/components/StatCard.tsx
- src/components/ContentCard.tsx
- src/pages/Dashboard.tsx
`,
    components: ['Header', 'Sidebar', 'StatCard', 'ContentCard', 'Dashboard'],
    example: `
Example structure for App.tsx:

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <Sidebar />
          <main>
            <Dashboard />
          </main>
        </div>
      </div>
    </div>
  );
}

Example StatCard:

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {change && (
          <span className="text-sm font-medium text-green-600">
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
`,
  },

  crud: {
    name: 'CRUD/Table App',
    description: 'Data management app with table, forms, and actions',
    structure: `
App Structure:
- Page header with title + description
- Actions bar (search, filters, add button)
- Table/Grid in card component
- Empty states
- Form modal/page for add/edit

Components to create:
- src/App.tsx (main layout)
- src/components/Header.tsx
- src/components/ActionsBar.tsx
- src/components/Table.tsx
- src/components/TableRow.tsx
- src/components/EmptyState.tsx
- src/components/FormModal.tsx
`,
    components: ['Header', 'ActionsBar', 'Table', 'TableRow', 'EmptyState', 'FormModal'],
    example: `
Example structure for App.tsx:

import { useState } from 'react';
import { Header } from './components/Header';
import { ActionsBar } from './components/ActionsBar';
import { Table } from './components/Table';
import { EmptyState } from './components/EmptyState';

function App() {
  const [items, setItems] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <ActionsBar onAdd={() => {/* handle add */}} />

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <Table items={items} />
          </div>
        )}
      </div>
    </div>
  );
}

Example EmptyState:

export function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" /* icon */ />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
      <p className="text-gray-600 mb-6">Get started by creating your first item</p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150">
        Create Item
      </button>
    </div>
  );
}
`,
  },

  mobileApp: {
    name: 'Mobile-Style App',
    description: 'Mobile-optimized stacked card layout',
    structure: `
App Structure:
- Sticky header with back button
- Stacked card layout
- Bottom navigation (optional)
- Pull-to-refresh (visual only)
- Mobile-first spacing

Components to create:
- src/App.tsx (main layout)
- src/components/MobileHeader.tsx
- src/components/ContentCard.tsx
- src/components/ActionButton.tsx
`,
    components: ['MobileHeader', 'ContentCard', 'ActionButton'],
    example: `
Example structure for mobile-style app:

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Title</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Stacked cards */}
      </main>
    </div>
  );
}

Example ContentCard (mobile-optimized):

export function ContentCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 active:scale-[0.98] transition-transform">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{content}</p>
    </div>
  );
}
`,
  },
};

/**
 * Get template prompt injection based on selected template
 */
export function getTemplatePrompt(templateType: 'landing' | 'dashboard' | 'crud' | 'mobileApp'): string {
  const template = templates[templateType];

  return `
## SELECTED TEMPLATE: ${template.name}

${template.description}

${template.structure}

Required components: ${template.components.join(', ')}

Example implementation:
${template.example}

CRITICAL: Adapt this template to the user's specific request while maintaining the structure and component breakdown.
`;
}

/**
 * Get all template prompts as reference
 */
export function getAllTemplatesPrompt(): string {
  return `
## AVAILABLE TEMPLATES (choose the most appropriate)

1. LANDING PAGE - Use for: marketing sites, homepages, product pages
   Components: Header, Hero, Features, CTA, Footer
   Layout: Stacked sections with gradient hero

2. DASHBOARD - Use for: admin panels, analytics, data visualization
   Components: Header, Sidebar, StatCard, ContentCard
   Layout: Sidebar + main content area

3. CRUD/TABLE - Use for: data management, inventory, lists
   Components: Header, ActionsBar, Table, EmptyState, FormModal
   Layout: Header + actions + table in card

4. MOBILE APP - Use for: mobile-first apps, single-column layouts
   Components: MobileHeader, ContentCard, ActionButton
   Layout: Stacked cards with mobile-optimized spacing

SELECT THE BEST TEMPLATE based on the user's request and adapt it accordingly.
Always maintain the multi-component structure.
`;
}
