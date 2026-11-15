import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
export async function GET(request:NextRequest){
 const url=request.nextUrl;const code=url.searchParams.get("code");const nextRaw=url.searchParams.get("next")||"/app";
 const next=nextRaw.startsWith("/")&&!nextRaw.startsWith("//")?nextRaw:"/app";
 const client=await createServerSupabase();
 if(code&&client){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,url.origin));}
 return NextResponse.redirect(new URL("/sign-in?error=auth",url.origin));
}
