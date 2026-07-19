import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://volydinbgoelrtfzbeck.supabase.co",
  "sb_publishable_153a1iqYQdboXq2lJ7HpAg_m2sZT3IG"
);

export type Review = { id: string; name: string; rating: number; body: string; created_at: string };
