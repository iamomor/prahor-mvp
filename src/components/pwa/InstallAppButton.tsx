"use client";
import { useEffect, useState } from "react";
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{outcome:string}>; }
export function InstallAppButton() {
  const [event,setEvent]=useState<InstallEvent|null>(null);
  useEffect(()=>{
    const onReady=(e:Event)=>{e.preventDefault();setEvent(e as InstallEvent)};
    window.addEventListener("beforeinstallprompt",onReady);
    return ()=>window.removeEventListener("beforeinstallprompt",onReady);
  },[]);
  if (!event) return null;
  return <button className="pro-btn pro-btn-secondary" onClick={async()=>{await event.prompt(); await event.userChoice; setEvent(null)}} type="button">Install PROHOR</button>;
}
