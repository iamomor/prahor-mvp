"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHome } from "./HomeContext";
import { copy, type Copy } from "./home-content";

type Member = { name: string; role: Copy; place: Copy; photo?: string };

const EWU_CSE = copy("East West University · Computer Science & Engineering", "ইস্ট ওয়েস্ট ইউনিভার্সিটি · কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং");

export const team: Member[] = [
  { name: "Muhammad Omor Faruk", photo: "/team/omor.webp", role: copy("Team Leader / Project Coordinator & Backend Engineer", "টিম লিডার / প্রজেক্ট কো-অর্ডিনেটর ও ব্যাকএন্ড ইঞ্জিনিয়ার"), place: EWU_CSE },
  { name: "Iftee Raiyan", photo: "/team/iftee.webp", role: copy("AI & Scraper Engineer", "এআই ও স্ক্র্যাপার ইঞ্জিনিয়ার"), place: EWU_CSE },
  { name: "Ahnaf Kabir Chowdhury", photo: "/team/ahnaf.webp", role: copy("UI/UX Designer & Frontend Developer", "ইউআই/ইউএক্স ডিজাইনার ও ফ্রন্টএন্ড ডেভেলপার"), place: EWU_CSE },
  { name: "Apurbo Kumar Shill", photo: "/team/apurbo.webp", role: copy("Records & Verification Engineer · Jibonrekha, Bujhi", "রেকর্ড ও যাচাই ইঞ্জিনিয়ার · জীবনরেখা, বুঝি"), place: EWU_CSE },
  { name: "Touhira Jannat", role: copy("Wellness & Care Navigation · Shusthota, Poth", "ভালো থাকা ও সেবার পথনির্দেশ · সুস্থতা, পথ"), place: EWU_CSE },
  { name: "Mahmud Hasan Shaon", photo: "/team/mahmud.webp", role: copy("Medical Coordinator / Clinical Domain Expert", "মেডিকেল কো-অর্ডিনেটর / ক্লিনিক্যাল ডোমেইন বিশেষজ্ঞ"), place: copy("Chattogram Maa-O-Shishu Hospital Medical College", "চট্টগ্রাম মা ও শিশু হাসপাতাল মেডিকেল কলেজ") },
];

const initials = (name: string) => name.split(" ").filter(Boolean).map(part => part[0]).slice(0, 2).join("");
const DRAG_THRESHOLD = 48;

/** Coverflow carousel: centre card in focus, neighbours fanned out. Drag, swipe, arrows, dots or keys. */
export function TeamCarousel() {
  const { t } = useHome();
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ startX: number; id: number } | null>(null);
  const count = team.length;
  const go = (index: number) => setActive((index + count) % count);

  // Shortest signed distance on the ring, so the deck wraps both ways.
  const offsetOf = (index: number) => {
    let offset = index - active;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  };

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as Element).closest("button")) return;
    drag.current = { startX: event.clientX, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) setDragX(event.clientX - drag.current.startX);
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    const moved = event.clientX - drag.current.startX;
    drag.current = null;
    setDragX(0);
    if (Math.abs(moved) > DRAG_THRESHOLD) go(active + (moved < 0 ? 1 : -1));
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") { event.preventDefault(); go(active + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(active - 1); }
  }

  const current = team[active];
  return <div className="team-carousel" role="region" aria-roledescription={t(copy("carousel", "ক্যারোসেল"))} aria-label={t(copy("PROHOR team members", "প্রহর টিমের সদস্যরা"))}>
    <div className="team-stage" tabIndex={0} aria-label={t(copy("Team cards. Use left and right arrow keys, or drag, to browse.", "টিম কার্ড। বাম ও ডান তীরচিহ্ন বা টেনে সরিয়ে দেখুন।"))}
      data-dragging={dragX !== 0 ? "true" : undefined} onKeyDown={onKeyDown}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {team.map((member, index) => {
        const offset = offsetOf(index);
        const hidden = Math.abs(offset) > 2;
        return <article key={member.name} className="team-card" data-offset={offset} aria-hidden={offset !== 0}
          aria-roledescription={t(copy("slide", "স্লাইড"))} aria-label={t(copy(`${index + 1} of ${count}`, `${count}-এর মধ্যে ${index + 1}`))}
          style={{ "--offset": offset, "--abs": Math.abs(offset), "--drag": `${dragX}px`, visibility: hidden ? "hidden" : undefined } as CSSProperties}
          onClick={offset !== 0 ? () => go(index) : undefined}>
          <div className="team-card-photo">
            {member.photo
              ? <Image src={member.photo} alt={offset === 0 ? member.name : ""} fill sizes="(min-width: 768px) 320px, 70vw" draggable={false} priority={index === 0} />
              : <span className="team-card-initials" aria-hidden="true" lang="en">{initials(member.name)}</span>}
          </div>
          <div className="team-card-text">
            <h3 lang="en">{member.name}</h3>
            <p className="team-card-role">{t(member.role)}</p>
            <p className="team-card-place">{t(member.place)}</p>
          </div>
        </article>;
      })}
    </div>
    <div className="team-controls">
      <button type="button" className="team-arrow" onClick={() => go(active - 1)} aria-label={t(copy("Previous team member", "আগের সদস্য"))}><ChevronLeft size={22} aria-hidden="true" /></button>
      <div className="team-dots" role="group" aria-label={t(copy("Choose a team member", "সদস্য বেছে নিন"))}>
        {team.map((member, index) => <button key={member.name} type="button" className="team-dot" aria-current={index === active ? "true" : undefined} aria-label={member.name} onClick={() => go(index)} />)}
      </div>
      <button type="button" className="team-arrow" onClick={() => go(active + 1)} aria-label={t(copy("Next team member", "পরের সদস্য"))}><ChevronRight size={22} aria-hidden="true" /></button>
    </div>
    <p className="home-sr-only" aria-live="polite">{`${current.name}, ${t(current.role)}, ${t(current.place)}`}</p>
  </div>;
}
