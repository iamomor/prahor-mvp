import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
export async function GET(){const db=await createServerSupabase();if(!db)return NextResponse.json({message:"Demo only"},{status:503});const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({message:"Authentication required"},{status:401});return NextResponse.json({message:"Apubo owns health-record API implementation."},{status:501,headers:{"Cache-Control":"no-store"}})}
