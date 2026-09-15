/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_FOUNDING_ENABLED?: string;
  readonly VITE_FOUNDING_MEMBER_MONTHLY_DISPLAY?: string;
  readonly VITE_FOUNDING_MEMBER_ANNUAL_DISPLAY?: string;
  readonly VITE_LIVING_SYSTEMS_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_ANALYTICS_DOMAINS?: string;
  readonly VITE_PUBLIC_SITE_ORIGIN?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
