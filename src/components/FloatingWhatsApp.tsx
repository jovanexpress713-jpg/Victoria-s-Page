import React from 'react';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { buildWhatsAppUrl } from '../services/storage';

export const FloatingWhatsApp: React.FC = () => {
  const url = buildWhatsAppUrl('967771119726', 'مرحباً، أريد الاستفسار عن خدمات Victoria Line Soft.');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed left-5 bottom-5 z-40 inline-flex items-center gap-2 bg-white/95 hover:bg-[#edf5df] text-[#2e4521] border border-[#cfdcc3] rounded-full px-4 py-2.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <span className="w-2 h-2 rounded-full bg-[#27b68b] animate-ping" />
      <MessageSquare size={15} className="text-[#27b68b]" />
      <span>تواصل عبر واتساب</span>
      <ArrowUpRight size={13} className="text-[#647f20]" />
    </a>
  );
};
