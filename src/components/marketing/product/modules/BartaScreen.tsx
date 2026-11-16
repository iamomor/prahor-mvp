"use client";

import { ArrowUpRight, BookOpen, MessageCircle } from "lucide-react";
import { ScreenTitle, SourceChip } from "../ScreenFrame";
import { WHO_SOURCE } from "../content";

export function BartaScreen() {
  return <><ScreenTitle icon={<MessageCircle size={24} />} small="Barta · বার্তা" title="কথা হোক, আপনার ভাষায়।" />
    <div className="story-chat-bubble story-chat-question" lang="bn">আমার যত্নে আমার অভিজ্ঞতাও কি গুরুত্বপূর্ণ?</div>
    <div className="story-chat-bubble" lang="bn"><BookOpen size={21} aria-hidden="true" /><p>গর্ভকালীন যত্নে আপনার শারীরিক ও মানসিক সুস্থতা এবং আপনার অভিজ্ঞতাও গুরুত্বপূর্ণ।</p><SourceChip compact /></div>
    <a className="story-chat-compose" href={WHO_SOURCE} target="_blank" rel="noreferrer"><span lang="bn">উত্তরের সূত্রটি পড়ুন</span><ArrowUpRight size={20} aria-hidden="true" /><span className="home-sr-only" lang="en">Opens WHO in a new tab</span></a></>;
}
