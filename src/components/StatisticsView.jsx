import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  History, 
  Filter, 
  Download, 
  FileSpreadsheet 
} from 'lucide-react';
import { 
  formatDurationHoursMinutes, 
  calculateStudyStreak, 
  getSevenDaysBreakdown, 
  exportSessionsToCSV 
} from '../utils/storage';

export default function StatisticsView({ data }) {
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterMode, setFilterMode] = useState('all');

  const subjects = data.subjects || [];
  const sessions = data.studySessions || [];

  const totalStudySeconds = subjects.reduce((acc, sub) => acc + (sub.totalStudySeconds || 0), 0);
  const formattedTotalTime = formatDurationHoursMinutes(totalStudySeconds);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter(s => (s.timestamp || 0) >= todayStart.getTime());
  const todayStudySeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const formattedTodayTime = formatDurationHoursMinutes(todayStudySeconds);

  const sevenDays = getSevenDaysBreakdown(sessions);
  const maxDayMinutes = Math.max(1, ...sevenDays.map(d => d.minutes));
  const streak = calculateStudyStreak(sessions);

  const filteredSessions = sessions.filter(s => {
    if (filterSubjectId !== 'all' && s.subjectId !== filterSubjectId) return false;
    if (filterMode !== 'all' && s.mode !== filterMode) return false;
    return true;
  });

  const handleExportCSV = () => {
    exportSessionsToCSV(sessions);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            إحصائيات المذاكرة والإنتاجية
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            رصد تحليلي دقيق لساعات تركيزك المحفوظة محلياً مع إمكانية التصدير
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          title="تصدير السجل الكامل إلى ملف CSV متوافق مع Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>تصدير إلى Excel (CSV)</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-semibold">إجمالي المذاكرة</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold font-alexandria">
            {formattedTotalTime}
          </div>
          <div className="text-[11px] text-blue-200">سجل إنجازك المتراكم</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-xs font-semibold">مذاكرة اليوم</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold font-alexandria">
            {formattedTodayTime}
          </div>
          <div className="text-[11px] text-emerald-200">
            {todaySessions.length} جلسات دراسية اليوم
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-100">
            <span className="text-xs font-semibold">أيام التتابع (Streak)</span>
            <Flame className="w-4 h-4 fill-amber-300" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold font-alexandria">
            {streak} أيام
          </div>
          <div className="text-[11px] text-amber-200">استمرارية التركيز 🔥</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-100">
            <span className="text-xs font-semibold">إجمالي الجلسات</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold font-alexandria">
            {sessions.length}
          </div>
          <div className="text-[11px] text-purple-200">جلسات بومودورو ومؤقت مكتملة</div>
        </div>
      </div>

      {/* 7-DAY ACTIVITY BAR CHART */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
              نشاط المذاكرة لآخر 7 أيام (بالدقائق)
            </h2>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 dark:border-slate-700">
            {sevenDays.map((d, idx) => {
              const heightPercent = Math.max(6, Math.round((d.minutes / maxDayMinutes) * 100));
              const isToday = idx === 6;

              return (
                <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes} د
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-700 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday ? 'bg-emerald-500' : 'bg-blue-600 group-hover:bg-blue-700'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className={`block text-[11px] font-bold ${isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {d.dayName}
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      {d.dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Distribution by Subject */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>توزيع ساعات المذاكرة لكل مادة</span>
        </h2>

        {subjects.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            لا توجد مواد مسجلة بعد.
          </p>
        ) : (
          <div className="space-y-4">
            {subjects.map((sub) => {
              const subSeconds = sub.totalStudySeconds || 0;
              const percentage = totalStudySeconds > 0 
                ? Math.round((subSeconds / totalStudySeconds) * 100) 
                : 0;
              const formatted = formatDurationHoursMinutes(subSeconds);

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sub.color || '#3B82F6' }}
                      />
                      <span className="text-slate-800 dark:text-white text-sm font-bold">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span>{formatted}</span>
                      <span className="text-slate-400">({percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, subSeconds > 0 ? 4 : 0)}%`,
                        backgroundColor: sub.color || '#3B82F6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Chronological History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
              سجل جلسات المذاكرة والإنجازات
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">كل المواد</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">كل الأنواع</option>
              <option value="pomodoro">بومودورو 🍅</option>
              <option value="stopwatch">مؤقت مفتوح ⏱️</option>
            </select>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            لا توجد جلسات تطابق هذا التصفية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">المادة</th>
                  <th className="py-2.5 px-3">المحاضرة</th>
                  <th className="py-2.5 px-3">المدة</th>
                  <th className="py-2.5 px-3">النوع</th>
                  <th className="py-2.5 px-3">ما تم إنجازه</th>
                  <th className="py-2.5 px-3">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredSessions.slice(0, 25).map((sess) => {
                  const date = new Date(sess.timestamp);
                  const formattedDate = `${date.toLocaleDateString('ar-EG')} - ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
                  const durationStr = formatDurationHoursMinutes(sess.durationSeconds);

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                        {sess.subjectName || 'مادة عامة'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {sess.lectureName || 'محاضرة'}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 font-alexandria">
                        {durationStr}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          sess.mode === 'stopwatch' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {sess.mode === 'stopwatch' ? 'مؤقت مفتوح' : 'بومودورو'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                        {sess.note || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
