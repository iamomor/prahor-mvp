import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { authCookieOptions } from "@/lib/auth/cookies";
import { publicSupabaseConfig } from "./config";
export function hasSupabaseConfig(){return publicSupabaseConfig() !== null};
export async function createServerSupabase(){
 const config=publicSupabaseConfig();
 if(!config)return null;
 const {url,key}=config;
 const cookieStore=await cookies();
 return createServerClient(url,key,{cookieOptions:authCookieOptions(),cookies:{
  getAll(){return cookieStore.getAll()},
  setAll(toSet){try{toSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{/* Server Component: proxy handles refresh */}}
 }});
}
