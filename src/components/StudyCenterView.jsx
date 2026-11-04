import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Play, 
  Trash2, 
  FileText, 
  Clock, 
  X, 
  Check, 
  BookOpen, 
  Eye, 
  Calendar, 
  Search, 
  Sparkles, 
  Target 
} from 'lucide-react';
import { formatDurationHoursMinutes } from '../utils/storage';

export const COLOR_OPTIONS = [
  { id: 'blue', value: '#3B82F6', label: 'أزرق' },
  { id: 'orange', value: '#F97316', label: 'برتقالي' },
  { id: 'teal', value: '#14B8A6', label: 'تركواز' },
  { id: 'purple', value: '#A855F7', label: 'بنفسجي' },
  { id: 'amber', value: '#F59E0B', label: 'أصفر' },
  { id: 'red', value: '#EF4444', label: 'أحمر' },
  { id: 'green', value: '#22C55E', label: 'أخضر' },
  { id: 'navy', value: '#1E293B', label: 'كحلي' },
];

const STICKY_COLORS = [
  { value: '#FEF08A', label: 'أصفر' },
  { value: '#BBF7D0', label: 'أخضر' },
  { value: '#FBCFE8', label: 'وردي' },
  { value: '#FED7AA', label: 'خوخي' }
];

export default function StudyCenterView({ 
  data, 
  updateData, 
  onSelectSubject 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Add Subject Form State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [targetHours, setTargetHours] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#EF4444');

  // Sticky Notes State
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#FEF08A');

  // Schedule View Mode: 'upload' | 'interactive'
  const [scheduleTab, setScheduleTab] = useState('upload');
  const [showAddScheduleItem, setShowAddScheduleItem] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('السبت');
  const [scheduleTime, setScheduleTime] = useState('09:00 - 11:00');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleColor, setScheduleColor] = useState('#3B82F6');

  const fileInputRef = useRef(null);

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const newSubject = {
      id: 'sub-' + Date.now(),
      name: subjectName.trim(),
      studyTime: Number(studyTime) || 25,
      breakTime: Number(breakTime) || 5,
      rounds: Number(rounds) || 4,
      targetHours: Number(targetHours) || 10,
      color: selectedColor,
      totalStudySeconds: 0,
      lectures: []
    };

    updateData({
      ...data,
      subjects: [...(data.subjects || []), newSubject]
    });

    setSubjectName('');
    setShowAddSubject(false);
  };

  const handleDeleteSubject = (e, subjectId) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه المادة وجميع محاضراتها وملاحظاتها؟')) {
      const updated = (data.subjects || []).filter(s => s.id !== subjectId);
      updateData({
        ...data,
        subjects: updated
      });
    }
  };

  // Sticky Notes
  const handleAddStickyNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const now = new Date();
    const dateFormatted = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} / ${now.getDate()}/${now.getMonth() + 1}`;

    const newNote = {
      id: 'sn-' + Date.now(),
      text: `${newNoteText.trim()}\n${dateFormatted}`,
      color: newNoteColor
    };

    updateData({
      ...data,
      stickyNotes: [...(data.stickyNotes || []), newNote]
    });

    setNewNoteText('');
    setShowAddNote(false);
  };

  const handleDeleteStickyNote = (noteId) => {
    const updated = (data.stickyNotes || []).filter(n => n.id !== noteId);
    updateData({
      ...data,
      stickyNotes: updated
    });
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateData({
        ...data,
        scheduleImage: {
          name: file.name,
          type: file.type,
          dataUrl: reader.result,
          uploadedAt: Date.now()
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSchedule = () => {
    updateData({
      ...data,
      scheduleImage: null
    });
  };

  const handleAddWeeklyScheduleItem = (e) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    const currentSchedule = data.weeklySchedule || [];
    const updated = currentSchedule.map(dayObj => {
      if (dayObj.day === scheduleDay) {
        return {
          ...dayObj,
          items: [...(dayObj.items || []), { time: scheduleTime, title: scheduleTitle.trim(), color: scheduleColor }]
        };
      }
      return dayObj;
    });

    updateData({
      ...data,
      weeklySchedule: updated
    });

    setScheduleTitle('');
    setShowAddScheduleItem(false);
  };

  const filteredSubjects = (data.subjects || []).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            الدراسة
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة وتنظيم المواد الدراسية، المحاضرات، الجداول، والملاحظات السريعة
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مادة..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* SECTION 1: المواد الدراسية */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              المواد الدراسية
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
              {filteredSubjects.length} مواد
            </span>
          </div>

          {!showAddSubject && (
            <button
              onClick={() => setShowAddSubject(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs md:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>أضف مادة</span>
            </button>
          )}
        </div>

        {/* Add Subject Inline Form Card */}
        {showAddSubject && (
          <form 
            onSubmit={handleSaveSubject}
            className="border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 bg-blue-50/25 dark:bg-slate-900/40 space-y-4 animate-in fade-in duration-200 shadow-sm"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم المادة
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="اسم المادة"
                autoFocus
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm md:text-base text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 text-center">
                  وقت المذاكرة
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={studyTime}
                  onChange={(e) => setStudyTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <span className="block text-[10px] text-slate-400 text-center mt-0.5">دقيقة</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 text-center">
                  وقت الراحة
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <span className="block text-[10px] text-slate-400 text-center mt-0.5">دقيقة</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 text-center">
                  عدد الجولات
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <span className="block text-[10px] text-slate-400 text-center mt-0.5">جولات</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 text-center">
                  الهدف الكلي
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <span className="block text-[10px] text-slate-400 text-center mt-0.5">ساعات</span>
              </div>
            </div>

            {/* Color Palette Chips */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 text-right">
                اللون
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.value)}
                    style={{ backgroundColor: col.value }}
                    className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center text-white ${
                      selectedColor === col.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm' : 'hover:scale-105'
                    }`}
                    title={col.label}
                  >
                    {selectedColor === col.value && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={!subjectName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-sm disabled:opacity-50 transition-colors"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setShowAddSubject(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Subject Cards List */}
        <div className="space-y-4">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {searchQuery ? 'لا توجد نتائج بحث مطابقة.' : 'لم تقم بإضافة مواد دراسية بعد. اضغط على "أضف مادة" للبدء!'}
            </div>
          ) : (
            filteredSubjects.map((sub) => {
              const lectureCount = (sub.lectures || []).length;
              const formattedDuration = formatDurationHoursMinutes(sub.totalStudySeconds || 0);

              const targetSec = (sub.targetHours || 10) * 3600;
              const progressRatio = Math.min(100, Math.round(((sub.totalStudySeconds || 0) / targetSec) * 100));

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubject(sub)}
                  style={{ borderColor: sub.color || '#3B82F6' }}
                  className="border-2 rounded-2xl p-5 bg-white dark:bg-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200 shadow-2xs group relative"
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <h3 
                          style={{ color: sub.color || '#EF4444' }}
                          className="text-lg md:text-xl font-bold tracking-tight"
                        >
                          {sub.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          {lectureCount} محاضرات
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {sub.studyTime || 25} دقيقة • {sub.breakTime || 5}m راحة • {sub.rounds || 4} عدد الجولات
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-700/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-600">
                        <span>{formattedDuration}</span>
                        <Play className="w-3.5 h-3.5 text-slate-500 fill-slate-500" />
                      </div>

                      <button
                        onClick={(e) => handleDeleteSubject(e, sub.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                        title="حذف المادة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Real Dynamic Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-alexandria">
                      {progressRatio}%
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(progressRatio, (sub.totalStudySeconds || 0) > 0 ? 5 : 0)}%`,
                          backgroundColor: sub.color || '#3B82F6' 
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      هدف: {sub.targetHours || 10}h
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      فتح المحاضرات ←
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECTION 2: أضف جدول دراسي */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              أضف جدول دراسي
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScheduleTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                scheduleTab === 'upload' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              مستند / صورة الجدول
            </button>
            <button
              type="button"
              onClick={() => setScheduleTab('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                scheduleTab === 'interactive' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              جدول الحصص الأسبوعي 📅
            </button>
          </div>
        </div>

        {scheduleTab === 'upload' && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,.pdf" 
              className="hidden" 
            />

            {data.scheduleImage ? (
              <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center">
                {data.scheduleImage.type?.startsWith('image/') ? (
                  <img 
                    src={data.scheduleImage.dataUrl} 
                    alt="الجدول الدراسي" 
                    className="max-h-96 w-auto rounded-xl object-contain shadow-sm"
                  />
                ) : (
                  <div className="p-8 flex flex-col items-center text-slate-700 dark:text-slate-200">
                    <FileText className="w-16 h-16 text-blue-500 mb-2" />
                    <span className="font-semibold text-sm">{data.scheduleImage.name}</span>
                    <span className="text-xs text-slate-400 mt-1">مستند جدول دراسي مرفق محلياً</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <a
                    href={data.scheduleImage.dataUrl}
                    download={data.scheduleImage.name || 'study-schedule'}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>تحميل / عرض</span>
                  </a>
                  <button
                    onClick={handleRemoveSchedule}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-blue-400 cursor-pointer transition-all group"
                role="button"
                tabIndex={0}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 shadow-xs mb-3 transition-colors">
                  <Upload className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  ارفع صورة أو PDF للجدول الدراسي
                </p>
                <p className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  اضغط للاختيار من جهازك والحفظ محلياً
                </p>
              </div>
            )}
          </div>
        )}

        {scheduleTab === 'interactive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">مواعيد المحاضرات الأسبوعية:</span>
              <button
                type="button"
                onClick={() => setShowAddScheduleItem(!showAddScheduleItem)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة موعد محاضرة</span>
              </button>
            </div>

            {showAddScheduleItem && (
              <form onSubmit={handleAddWeeklyScheduleItem} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">اليوم</label>
                    <select
                      value={scheduleDay}
                      onChange={(e) => setScheduleDay(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                    >
                      {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">الوقت</label>
                    <input
                      type="text"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      placeholder="09:00 - 11:00"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">اسم المحاضرة أو القاعة</label>
                    <input
                      type="text"
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder="مثال: هندسة النظم - قاعة 2"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">
                    إضافة للجدول
                  </button>
                  <button type="button" onClick={() => setShowAddScheduleItem(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg">
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(data.weeklySchedule || []).map((dayObj) => (
                <div key={dayObj.day} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                    {dayObj.day}
                  </h4>
                  {dayObj.items && dayObj.items.length > 0 ? (
                    dayObj.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ borderRightColor: item.color || '#3B82F6' }}
                        className="p-2 bg-white dark:bg-slate-800 rounded-lg border-r-4 shadow-2xs text-[11px]"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                        <div className="text-slate-400 mt-0.5">{item.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 py-2">لا توجد محاضرات</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: سبورة الملاحظات */}
      <section className="bg-[#FEFCE8]/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              سبورة الملاحظات
            </h2>
          </div>
          {!showAddNote && (
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>أضف ملاحظة</span>
            </button>
          )}
        </div>

        {showAddNote && (
          <form 
            onSubmit={handleAddStickyNote}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-300 dark:border-amber-700 shadow-md space-y-3 animate-in fade-in duration-150"
          >
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="اكتب فكرتك أو تنبيهك السريع هنا..."
              rows={3}
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">اللون:</span>
                {STICKY_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewNoteColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-6 h-6 rounded-md border border-slate-300 ${newNoteColor === c.value ? 'ring-2 ring-slate-800' : ''}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  تثبيت على السبورة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {(!data.stickyNotes || data.stickyNotes.length === 0) ? (
            <div className="col-span-full text-center py-6 text-slate-400 text-xs">
              سبورة الملاحظات فارغة. اضغط على "أضف ملاحظة" لتثبيت أفكارك!
            </div>
          ) : (
            data.stickyNotes.map((note) => (
              <div
                key={note.id}
                style={{ backgroundColor: note.color || '#FEF08A' }}
                className="relative rounded-xl p-3 pt-6 shadow-sm border border-black/5 hover:shadow-md transition-all group flex flex-col justify-between min-h-[100px]"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-700 shadow-sm flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white opacity-80" />
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-800 whitespace-pre-line leading-relaxed text-center">
                  {note.text}
                </p>

                <button
                  onClick={() => handleDeleteStickyNote(note.id)}
                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 text-slate-500 hover:text-rose-600 transition-opacity"
                  title="حذف"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
