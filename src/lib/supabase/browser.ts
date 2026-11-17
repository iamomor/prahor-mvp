"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseConfig } from "./config";
/** Public-data helper. Account sessions are managed by server routes (HttpOnly). */
export function createBrowserSupabase(){const config=publicSupabaseConfig();return config?createBrowserClient(config.url,config.key):null;}
