import React from 'react';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { buildWhatsAppUrl } from '../services/storage';
import { SITE, WHATSAPP_DEFAULT_MESSAGE } from '../config/site';

export const FloatingWhatsApp: React.FC = () => {
  const url = buildWhatsAppUrl(SITE.whatsapp, WHATSAPP_DEFAULT_MESSAGE);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed left-5 bottom-5 z-40 inline-flex items-center gap-2 bg-[var(--vls-panel)] hover:bg-[var(--vls-accent-soft)] text-[var(--vls-accent-deep)] border border-[var(--vls-line)] rounded-full px-4 py-2.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <span className="w-2 h-2 rounded-full bg-[#27b68b] animate-ping" />
      <MessageSquare size={15} className="text-[#27b68b]" />
      <span>تواصل عبر واتساب</span>
      <ArrowUpRight size={13} className="text-[var(--vls-accent)]" />
    </a>
  );
};
