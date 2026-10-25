import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
      className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center overflow-hidden ${
        isDark
          ? 'bg-white/5 border-white/10 text-[#f5c767] hover:bg-white/10 hover:border-white/20'
          : 'bg-[#0f172a]/5 border-[#e2e8f0] text-[#475569] hover:bg-[#0f172a]/10 hover:text-[#0f172a]'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Sun size={18} className="stroke-[2.2]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-[#6366f1]"
          >
            <Moon size={18} className="stroke-[2.2]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
