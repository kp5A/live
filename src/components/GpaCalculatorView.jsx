import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Calculator, 
  BookOpen, 
  TrendingUp, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { calculateGPA, GRADE_POINTS_4 } from '../utils/storage';

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

export default function GpaCalculatorView({ data, updateData }) {
  const subjects = data.subjects || [];
  const currentGPA = calculateGPA(subjects);

  const handleUpdateSubjectGrade = (subId, field, value) => {
    const updated = subjects.map(s => {
      if (s.id === subId) {
        return { ...s, [field]: value };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updated
    });
  };

  const getGpaStatus = (gpaNum) => {
    if (gpaNum >= 3.75) return { label: 'امتياز مع مرتبة الشرف 🏆', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    if (gpaNum >= 3.5) return { label: 'امتياز (Excellent) 🌟', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    if (gpaNum >= 3.0) return { label: 'جيد جداً (Very Good) 👏', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' };
    if (gpaNum >= 2.5) return { label: 'جيد (Good) 👍', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' };
    return { label: 'مقبول / يحتاج للمزيد من التركيز 📚', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' };
  };

  const status = getGpaStatus(parseFloat(currentGPA));
  const totalCredits = subjects.reduce((acc, s) => acc + (Number(s.creditHours) || 3), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <span>حاسبة المعدل التراكمي والدرجات (GPA Calculator)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          احسب معدلك الفصلي والتراكمي المتوقع بناءً على الساعات المعتمدة وتقديرات كل مادة
        </p>
      </div>

      {/* Top GPA Result Card */}
      <div className={`p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${status.bg}`}>
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المعدل التراكمي المتوقع (من 4.0):</span>
          <div className="text-4xl sm:text-5xl font-black font-alexandria text-slate-900 dark:text-white">
            {currentGPA} / 4.00
          </div>
          <div className={`text-sm font-bold ${status.color}`}>
            {status.label}
          </div>
        </div>

        <div className="text-right sm:text-left bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <span className="text-xs text-slate-400 block mb-0.5">إجمالي الساعات المعتمدة:</span>
          <span className="text-2xl font-black text-slate-800 dark:text-white font-alexandria">
            {totalCredits} ساعات
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">موزعة على {subjects.length} مواد</span>
        </div>
      </div>

      {/* Subjects Table for Grades & Credits */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>توزيع ساعات وتقديرات المواد</span>
        </h2>

        {subjects.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            لا توجد مواد دراسية مسجلة. أضف موادك من مركز الدراسة للبدء في حساب المعدل!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">المادة</th>
                  <th className="py-2.5 px-3">الساعات المعتمدة</th>
                  <th className="py-2.5 px-3">التقدير المتوقع</th>
                  <th className="py-2.5 px-3">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {subjects.map((sub) => {
                  const credits = Number(sub.creditHours) || 3;
                  const grade = sub.expectedGrade || 'A';
                  const points = GRADE_POINTS_4[grade] ?? 3.75;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: sub.color || '#3B82F6' }}
                          />
                          <span className="font-bold text-slate-800 dark:text-white text-sm">
                            {sub.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={credits}
                          onChange={(e) => handleUpdateSubjectGrade(sub.id, 'creditHours', Number(e.target.value))}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map(c => (
                            <option key={c} value={c}>{c} ساعات</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={grade}
                          onChange={(e) => handleUpdateSubjectGrade(sub.id, 'expectedGrade', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-blue-600 dark:text-blue-400 focus:outline-none"
                        >
                          {GRADE_OPTIONS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {(points * credits).toFixed(1)} نقطة
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
