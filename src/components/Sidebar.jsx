import React from 'react';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Layers, 
  Compass, 
  BarChart3, 
  Settings, 
  X,
  ChevronLeft,
  ShieldCheck,
  Moon,
  Sun,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileOpen, 
  setMobileOpen,
  theme,
  isDark,
  onToggleTheme 
}) {
  const darkModeActive = isDark ?? (theme === 'dark' || theme === 'midnight' || theme === 'forest');
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'study', label: 'الدراسة', icon: BookOpen },
    { id: 'notes', label: 'الملاحظات', icon: FileText },
    { id: 'flashcards', label: 'البطاقات التعليمية', icon: Layers },
    { id: 'habits', label: 'العادات', icon: Compass },
    { id: 'gpa', label: 'حاسبة المعدل', icon: GraduationCap },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 right-0 bottom-0 z-50 w-64 bg-[#132540] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shadow-2xl lg:shadow-none border-l border-slate-700/50`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wide font-alexandria text-white flex items-center gap-1.5">
                  Live
                </span>
                <span className="text-[11px] text-slate-300 font-medium">مساعد الطالب الذكي</span>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center justify-center text-slate-400 cursor-pointer hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5" aria-label="شريط التنقل الرئيسي">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#22c55e] text-white shadow-lg shadow-emerald-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-[#1a3357] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Theme & Security Badges */}
        <div className="p-3 space-y-2">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              {darkModeActive ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              <span>{darkModeActive ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
            </span>
            <span className="text-[10px] bg-slate-700/60 px-2 py-0.5 rounded text-slate-300">
              {darkModeActive ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>حفظ محلي 100%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              جميع البيانات محفوظة على جهازك بدون أي اتصال بخوادم خارجية.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
