/**
 * Brand Resolution - Determines active brand profile
 * Enforces default brand unless user explicitly overrides
 */

import { TEAMMAE_BRAND, STYLE_PROFILES, type BrandProfile, type StyleProfileKey } from './brand';

export interface ResolvedBrand {
  profile: BrandProfile;
  source: 'default' | 'user-explicit' | 'user-implicit';
  styleProfile: string;
  overrideDetected: boolean;
}

/**
 * Resolve brand profile from user input
 * DEFAULT = TeamMAE Neo Tokyo Cyberpunk
 * Override ONLY if user explicitly requests different style
 */
export function resolveBrandProfile(
  userPrompt: string,
  explicitStyleProfile?: string | null
): ResolvedBrand {
  // Explicit UI selection takes highest priority
  if (explicitStyleProfile && explicitStyleProfile !== 'auto') {
    return {
      profile: TEAMMAE_BRAND,
      source: 'user-explicit',
      styleProfile: explicitStyleProfile,
      overrideDetected: true,
    };
  }

  // Detect style keywords in user prompt
  const promptLower = userPrompt.toLowerCase();

  // Light/minimal keywords
  const lightKeywords = ['light theme', 'light mode', 'white background', 'minimal', 'clean and simple'];
  if (lightKeywords.some(kw => promptLower.includes(kw))) {
    return {
      profile: TEAMMAE_BRAND,
      source: 'user-implicit',
      styleProfile: 'light-saas',
      overrideDetected: true,
    };
  }

  // Colorful keywords
  const colorfulKeywords = ['colorful', 'vibrant', 'playful', 'bright colors', 'rainbow'];
  if (colorfulKeywords.some(kw => promptLower.includes(kw))) {
    return {
      profile: TEAMMAE_BRAND,
      source: 'user-implicit',
      styleProfile: 'colorful',
      overrideDetected: true,
    };
  }

  // Black & white keywords
  const bwKeywords = ['black and white', 'b&w', 'monochrome', 'grayscale'];
  if (bwKeywords.some(kw => promptLower.includes(kw))) {
    return {
      profile: TEAMMAE_BRAND,
      source: 'user-implicit',
      styleProfile: 'minimal',
      overrideDetected: true,
    };
  }

  // DEFAULT: TeamMAE Neo Tokyo Cyberpunk
  return {
    profile: TEAMMAE_BRAND,
    source: 'default',
    styleProfile: TEAMMAE_BRAND.styleProfileDefault,
    overrideDetected: false,
  };
}

/**
 * Get human-readable brand source description
 */
export function getBrandSourceLabel(source: ResolvedBrand['source']): string {
  switch (source) {
    case 'default':
      return 'TeamMAE Default';
    case 'user-explicit':
      return 'User Selected';
    case 'user-implicit':
      return 'Detected from Prompt';
  }
}

/**
 * Validate brand resolution is non-bypassable
 * Throws if brand profile is missing or invalid
 */
export function enforceBrandResolution(resolved: ResolvedBrand | null): asserts resolved is ResolvedBrand {
  if (!resolved) {
    throw new Error('CRITICAL: Brand resolution failed. All builds require a brand profile.');
  }

  if (!resolved.profile) {
    throw new Error('CRITICAL: Brand profile is missing. Cannot proceed without brand enforcement.');
  }

  if (!resolved.styleProfile) {
    throw new Error('CRITICAL: Style profile is missing. Cannot proceed without style enforcement.');
  }
}
