import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return {
  id:"/", name:"PROHOR — Your Care. Your Way.", short_name:"PROHOR",
  description:"Inclusive maternal and child care companion — prototype",
  start_url:"/", scope:"/", display:"standalone", background_color:"#FFFCF5", theme_color:"#2F6B54",
  icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},{src:"/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"},{src:"/icon-maskable-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]
}; }
