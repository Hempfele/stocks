// Live Supabase project. The anon key is publishable by design — row-level
// security protects the data. Empty both values to fall back to demo mode.
export const config = {
  SUPABASE_URL: 'https://gtjbzmvhmdavvdikqbng.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amJ6bXZobWRhdnZkaWtxYm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTgwOTYsImV4cCI6MjA5Njg3NDA5Nn0.vhPY8MroWtiDr-kG81J_QASf3NLaVgZjYqdmSSzDBxs',
};

export const isDemo = !config.SUPABASE_URL;
