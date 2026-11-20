"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

const ways = [
  { title: copy("Uses a wheelchair", "হুইলচেয়ার ব্যবহার করেন"), body: copy("Large touch targets; nothing needs dragging.", "বড় স্পর্শের জায়গা; কিছুই টেনে আনতে হয় না।") },
  { title: copy("Has low vision", "চোখে কম দেখেন"), body: copy("Screen reader, bigger text, higher contrast.", "স্ক্রিন রিডার, বড় লেখা, বেশি কনট্রাস্ট।") },
  { title: copy("Deaf, signs to talk", "শুনতে পান না, ইশারায় কথা বলেন"), body: copy("Text first, picture cards, no voice-only step.", "লেখা আগে, ছবির কার্ড, শুধু কণ্ঠনির্ভর কোনো ধাপ নেই।") },
  { title: copy("No disability", "কোনো প্রতিবন্ধিতা নেই"), body: copy("The same help on a tired day or a noisy room.", "ক্লান্ত দিনে বা কোলাহলেও একই সহায়তা।") },
];

function WaysLegend() {
  const { t } = useHome();
  return <ol className="ij-legend">{ways.map((way, index) => <li key={way.title.en}><span className="ij-legend-number" aria-hidden="true">{index + 1}</span><span><strong>{t(way.title)}</strong> {t(way.body)}</span></li>)}</ol>;
}

/** Section 3: the supplied photograph, with the four ways in listed beneath it. */
export function InclusivePhoto() {
  const { t } = useHome();
  return <figure className="inclusive-photo">
    <div className="inclusive-photo-frame">
      <Image src="/images/mother-wheelchair-newborn.webp" width={1536} height={1024} sizes="(min-width: 1024px) 560px, 100vw" alt={t(copy("A mother using a wheelchair holds her sleeping newborn while an older woman rests a hand on her arm.", "হুইলচেয়ারে বসা এক মা ঘুমন্ত নবজাতককে কোলে রেখেছেন, পাশে বসা একজন বয়স্ক নারী তাঁর হাতে আলতো করে হাত রেখেছেন।"))} />
      <p className="inclusive-photo-chip"><Heart size={16} aria-hidden="true" />{t(copy("Same care. Her way.", "একই যত্ন। তাঁর মতো।"))}</p>
    </div>
    <figcaption><p className="ij-caption">{t(copy("Every mother finds her own way in.", "প্রতিটি মা খুঁজে নেন নিজের পথ।"))}</p><WaysLegend /></figcaption>
  </figure>;
}

/** Original, textless illustration: four mothers on one care path. Meaning lives in the legend. */
export function InclusiveJourney() {
  const { t } = useHome();
  return <figure className="inclusive-journey">
    <svg className="ij-art" viewBox="0 0 520 520" aria-hidden="true" focusable="false">
      <rect className="ij-bg" width="520" height="520" rx="36" />
      <circle className="ij-glow" cx="440" cy="70" r="120" />
      {[70, 196, 324, 450].map(x => <path key={x} className="ij-link" d={`M260 128 C260 190 ${x} 175 ${x} 236`} />)}
      <rect className="ij-hub" x="200" y="44" width="120" height="84" rx="26" />
      <circle className="ij-primary" cx="260" cy="86" r="26" />
      <path className="ij-on-primary" d="M260 97 C250 90 245 85 245 79 C245 74 249 71 253 71 C256 71 258 73 260 76 C262 73 264 71 267 71 C271 71 275 74 275 79 C275 85 270 90 260 97Z" />
      {[70, 196, 324, 450].map(x => <circle key={x} className="ij-badge" cx={x} cy="246" r="9" />)}
      <rect className="ij-ground" x="28" y="470" width="464" height="12" rx="6" />
      {/* 1 · wheelchair user */}
      <g transform="translate(62 0)">
        <circle className="ij-wheel" cx="0" cy="436" r="36" /><circle className="ij-ink" cx="0" cy="436" r="4" />
        <path className="ij-frame" d="M-8 352 L-4 404 L40 400 L46 466" /><circle className="ij-ink" cx="46" cy="470" r="7" />
        <path className="ij-cloth-a" d="M-14 350 Q0 340 14 350 Q22 378 20 398 L-6 402 Q-14 378 -14 350Z" />
        <path className="ij-cloth-a" d="M-6 392 L40 388 Q47 391 45 403 L-6 406Z" /><rect className="ij-cloth-a" x="33" y="398" width="11" height="62" rx="5" /><ellipse className="ij-ink" cx="44" cy="462" rx="10" ry="5" />
        <path className="ij-arm ij-skin-1-stroke" d="M12 352 Q24 380 4 412" />
        <rect className="ij-skin-1" x="-4" y="320" width="9" height="14" /><circle className="ij-skin-1" cx="0" cy="314" r="16" />
        <path className="ij-ink" d="M-17 316 Q-19 294 0 294 Q18 294 17 308 Q8 301 -2 302 Q-10 304 -12 320 Q-13 332 -19 338 Q-19 326 -17 316Z" /><circle className="ij-ink" cx="-13" cy="299" r="7" />
        <path className="ij-accent" d="M-14 350 Q8 360 18 392 L10 394 Q2 368 -16 360Z" />
      </g>
      {/* 2 · low vision, white cane, pregnant */}
      <g transform="translate(196 0)">
        <ellipse className="ij-ink" cx="-10" cy="470" rx="10" ry="5" /><ellipse className="ij-ink" cx="12" cy="470" rx="10" ry="5" />
        <path className="ij-accent" d="M-18 342 Q0 332 18 342 Q24 380 32 404 Q38 430 28 446 L34 466 Q0 474 -32 466 L-24 402 Q-24 370 -18 342Z" />
        <path className="ij-cloth-a" d="M-16 344 Q10 362 30 404 L22 408 Q4 372 -18 354Z" />
        <path className="ij-arm ij-skin-2-stroke" d="M16 346 Q30 372 26 398" />
        <line className="ij-cane-edge" x1="26" y1="398" x2="56" y2="470" /><line className="ij-cane" x1="26" y1="398" x2="52" y2="460" /><line className="ij-cane-tip" x1="52" y1="460" x2="56" y2="469" />
        <rect className="ij-skin-2" x="-4" y="318" width="9" height="16" /><circle className="ij-skin-2" cx="0" cy="310" r="16" />
        <path className="ij-ink" d="M-18 314 Q-20 290 0 290 Q19 290 18 312 Q16 300 4 298 Q-8 298 -12 312 Q-14 336 -10 346 Q-22 340 -18 314Z" />
        <rect className="ij-ink" x="-12" y="305" width="24" height="7" rx="3.5" />
      </g>
      {/* 3 · Deaf mother signing, picture card */}
      <g transform="translate(324 0)">
        <ellipse className="ij-ink" cx="-10" cy="470" rx="10" ry="5" /><ellipse className="ij-ink" cx="12" cy="470" rx="10" ry="5" />
        <path className="ij-cloth-b" d="M-18 342 Q0 332 18 342 L32 466 Q0 474 -32 466Z" />
        <path className="ij-accent" d="M-18 344 Q0 352 18 344 L16 356 Q0 362 -16 356Z" />
        <path className="ij-arm ij-skin-3-stroke" d="M-14 348 Q-30 374 -12 380" /><path className="ij-arm ij-skin-3-stroke" d="M14 348 Q28 368 12 364" />
        <circle className="ij-skin-3" cx="-9" cy="378" r="6" /><circle className="ij-skin-3" cx="10" cy="362" r="6" />
        <path className="ij-motion" d="M-24 390 Q-30 380 -26 370 M24 352 Q30 360 26 368" />
        <rect className="ij-skin-3" x="-4" y="318" width="9" height="16" /><circle className="ij-skin-3" cx="0" cy="310" r="16" />
        <path className="ij-cloth-a" fillRule="evenodd" d="M-20 318 Q-22 288 0 288 Q22 288 20 318 Q20 334 16 342 L-16 342 Q-20 334 -20 318Z M-12 312 Q-12 300 0 300 Q12 300 12 312 Q12 322 0 324 Q-12 322 -12 312Z" />
        <rect className="ij-card" x="34" y="300" width="40" height="36" rx="8" />
        <path className="ij-accent" d="M54 326 C47 321 43 317 43 312 C43 308 46 306 49 306 C51 306 53 307 54 309 C55 307 57 306 59 306 C62 306 65 308 65 312 C65 317 61 321 54 326Z" />
      </g>
      {/* 4 · mother without a disability, holding her baby */}
      <g transform="translate(450 0)">
        <ellipse className="ij-ink" cx="-10" cy="470" rx="10" ry="5" /><ellipse className="ij-ink" cx="12" cy="470" rx="10" ry="5" />
        <path className="ij-cloth-c" d="M-18 342 Q0 332 18 342 L32 466 Q0 474 -32 466Z" />
        <path className="ij-cloth-a" d="M14 342 Q-6 370 -30 466 L-22 466 Q-2 380 22 350Z" />
        <ellipse className="ij-card" cx="2" cy="382" rx="22" ry="13" transform="rotate(-18 2 382)" /><circle className="ij-skin-4" cx="18" cy="372" r="8" />
        <path className="ij-arm ij-skin-4-stroke" d="M-14 350 Q-24 376 0 392 M14 350 Q26 372 16 390" />
        <rect className="ij-skin-4" x="-4" y="318" width="9" height="16" /><circle className="ij-skin-4" cx="0" cy="310" r="16" />
        <path className="ij-ink" d="M-17 312 Q-19 290 0 290 Q18 290 17 304 Q8 298 -2 298 Q-10 300 -12 316 Q-14 330 -18 336 Q-19 322 -17 312Z" /><circle className="ij-ink" cx="12" cy="295" r="7" />
      </g>
    </svg>
    <figcaption>
      <p className="ij-caption">{t(copy("Four mothers. One journey. ", "চার মা। এক যাত্রা। "))}<em>{t(copy("The same care.", "একই যত্ন।"))}</em></p>
      <p className="home-sr-only">{t(copy("Illustration: a mother using a wheelchair, a pregnant mother with a white cane, a Deaf mother signing with a picture card, and a mother without a disability holding her baby, all linked to one care hub.", "চিত্র: হুইলচেয়ার ব্যবহারকারী এক মা, সাদা ছড়ি হাতে এক অন্তঃসত্ত্বা মা, ছবির কার্ড নিয়ে ইশারায় কথা বলা এক মা এবং শিশু কোলে প্রতিবন্ধিতাহীন এক মা—সবাই একই যত্নের কেন্দ্রে যুক্ত।"))}</p>
    </figcaption>
  </figure>;
}
