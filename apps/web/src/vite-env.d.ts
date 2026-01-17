/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // NOTE: ANTHROPIC_API_KEY is now stored in Supabase Edge Function secrets only
  // NEVER expose it via VITE_ env vars in the browser
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
