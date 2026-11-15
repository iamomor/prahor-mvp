import { NextResponse } from "next/server";
import { z } from "zod";
const schema=z.object({question:z.string().trim().min(1).max(1200)});
export async function POST(request:Request){
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({message:"Invalid request."},{status:400})}
 const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({message:"Please enter a valid question."},{status:400});
 // Deliberately no stubbed medical content or fabricated citations.
 return NextResponse.json({message:"Barta is not connected yet. No AI answer was generated.",status:"not_connected"},{status:501,headers:{"Cache-Control":"no-store"}});
}
