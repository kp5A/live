import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Layers, 
  ArrowLeft, 
  Sparkles,
  X
} from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  data, 
  onNavigate 
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items
  const cleanQ = query.toLowerCase().trim();

  const subjects = (data.subjects || []).filter(s => 
    !cleanQ || s.name.toLowerCase().includes(cleanQ)
  ).slice(0, 4);

  // Extract all lectures with their parent subject
  const allLectures = [];
  (data.subjects || []).forEach(s => {
    (s.lectures || []).forEach(l => {
      allLectures.push({ lecture: l, subject: s });
    });
  });
  const filteredLectures = allLectures.filter(item => 
    !cleanQ || item.lecture.name.toLowerCase().includes(cleanQ) || item.subject.name.toLowerCase().includes(cleanQ)
  ).slice(0, 5);

  const filteredTasks = (data.tasks || []).filter(t => 
    !cleanQ || t.title.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-2 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مادة، محاضرة، مهمة، أو اضغط Esc للخروج..."
            className="w-full bg-transparent text-sm md:text-base text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4 text-xs">
          {/* Lectures */}
          {filteredLectures.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 px-3 block mb-1.5">
                المحاضرات ({filteredLectures.length})
              </span>
              <div className="space-y-1">
                {filteredLectures.map(({ lecture, subject }) => (
                  <button
                    key={lecture.id}
                    onClick={() => {
                      onNavigate('lecture', { subject, lecture });
                      onClose(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-right transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: lecture.color || '#3B82F6' }}
                      >
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {lecture.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          مادة: {subject.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 font-bold">
                      فتح ←
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 px-3 block mb-1.5">
                المواد الدراسية ({subjects.length})
              </span>
              <div className="space-y-1">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onNavigate('subject', { subject: sub });
                      onClose(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-right transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sub.color || '#EF4444' }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {sub.name}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {(sub.lectures || []).length} محاضرات
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 px-3 block mb-1.5">
                المهام ({filteredTasks.length})
              </span>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredLectures.length === 0 && subjects.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              لم يتم العثور على أي نتائج مطابقة لكلمة البحث "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>نصيحة: اضغط <kbd className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border">Ctrl</kbd> + <kbd className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border">K</kbd> في أي وقت للبحث</span>
          <span>Esc للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
