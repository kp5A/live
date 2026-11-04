import React from 'react';
import { 
  Menu, 
  Lock, 
  ShieldCheck, 
  BookOpen, 
  Search, 
  Moon, 
  Sun 
} from 'lucide-react';

export default function Header({ 
  onOpenMobileMenu, 
  isLocked, 
  onLockNow, 
  hasPin, 
  theme, 
  isDark,
  onToggleTheme,
  onOpenSearch 
}) {
  const darkModeActive = isDark ?? (theme === 'dark' || theme === 'midnight' || theme === 'forest');
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -mr-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-bold font-alexandria text-lg text-slate-800 dark:text-white">Live</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all"
          title="بحث فوري (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>بحث سريع...</span>
          <kbd className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-600">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkModeActive ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
        >
          {darkModeActive ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {hasPin && (
          <button
            onClick={onLockNow}
            title="قفل التطبيق برقم المرور"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">قفل الآن</span>
          </button>
        )}

        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">حماية محلية 100%</span>
        </div>
      </div>
    </header>
  );
}
