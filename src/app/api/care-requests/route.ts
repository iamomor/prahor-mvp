import { NextResponse } from "next/server";
import { z } from "zod";
const schema=z.object({message:z.string().trim().min(1).max(1000),method:z.enum(["text","aac","call"])});
export async function POST(request:Request){
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({message:"Invalid request; not sent."},{status:400})}
 if(!schema.safeParse(body).success)return NextResponse.json({message:"Check the request fields. No message was sent."},{status:400});
 // TODO: authentication, scoped consent, authorized recipient, persistent DB + delivery receipts.
 return NextResponse.json({message:"Not sent. Human-care delivery is not configured in this starter.",status:"not_sent"},{status:501,headers:{"Cache-Control":"no-store"}});
}
