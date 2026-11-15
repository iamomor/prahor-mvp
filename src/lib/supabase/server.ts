import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export function hasSupabaseConfig(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)};
export async function createServerSupabase(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const cookieStore=await cookies();
 return createServerClient(url,key,{cookies:{
  getAll(){return cookieStore.getAll()},
  setAll(toSet){try{toSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{/* Server Component: proxy handles refresh */}}
 }});
}
