/**
 * TeamMAE UI Defaults
 * Beautiful, consistent defaults for all generated apps
 * Lovable-style conventions enforced
 */

// Spacing scale (8px base)
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// Container classnames
export const container = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
export const containerWide = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
export const containerNarrow = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// Section classnames
export const section = 'py-12 lg:py-16';
export const sectionLarge = 'py-16 lg:py-24';

// Card classnames
export const card = 'bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200';
export const cardCompact = 'bg-white rounded-xl shadow-sm border border-gray-200 p-4';

// Typography classnames
export const h1 = 'text-4xl lg:text-5xl font-bold text-gray-900 leading-tight';
export const h2 = 'text-2xl lg:text-3xl font-bold text-gray-900';
export const h3 = 'text-xl lg:text-2xl font-semibold text-gray-900';
export const body = 'text-base lg:text-lg text-gray-600';
export const bodyLarge = 'text-lg lg:text-xl text-gray-600';
export const muted = 'text-sm text-gray-500';

// Button classnames
export const buttonPrimary = 'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm';
export const buttonSecondary = 'px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200';
export const buttonOutline = 'px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-200';

// Grid classnames
export const grid = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
export const gridTwo = 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8';

// Default components as strings (for LLM to use directly in generated code)
export const templates = {
  appShell: `
import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Your App</h1>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-gray-500 text-center">
            Built with TeamMAE
          </p>
        </div>
      </footer>
    </div>
  );
}`,

  pageSection: `
import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ children, className = '' }: PageSectionProps) {
  return (
    <section className={\`py-12 lg:py-16 \${className}\`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}`,

  featureGrid: `
import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeatureGridProps {
  features: Feature[];
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          {feature.icon && (
            <div className="text-4xl mb-4">{feature.icon}</div>
          )}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}`,

  hero: `
import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function Hero({ title, subtitle, ctaText, onCtaClick }: HeroProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {title}
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        {ctaText && (
          <button
            onClick={onCtaClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}`,

  card: `
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={\`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 \${className}\`}>
      {children}
    </div>
  );
}`,
};

// Style guide reference for LLM
export const styleGuide = {
  spacing: '8/12/16/24/32/48/64px',
  maxWidth: 'max-w-6xl (default), max-w-7xl (wide), max-w-4xl (narrow)',
  typography: 'H1: text-4xl/5xl, H2: text-2xl/3xl, Body: text-base/lg, Muted: text-sm',
  cards: 'rounded-2xl, shadow-sm, border, hover:shadow-md',
  buttons: 'Primary (blue-600), Secondary (gray-100), Outline (border-2)',
  layout: 'grid-based, responsive, mobile-first',
  colors: 'gray-50/100/200 (backgrounds), gray-600/900 (text), blue-600 (primary)',
};
