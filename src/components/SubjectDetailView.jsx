import React, { useState } from 'react';
import { 
  ArrowRight, 
  Plus, 
  BookOpen, 
  Clock, 
  Trash2, 
  FileText, 
  Check, 
  Search, 
  CheckCircle2, 
  Circle, 
  Target, 
  Calendar 
} from 'lucide-react';
import { COLOR_OPTIONS } from './StudyCenterView';
import { formatDurationHoursMinutes } from '../utils/storage';

export default function SubjectDetailView({ 
  subject, 
  onBack, 
  onSelectLecture, 
  data, 
  updateData 
}) {
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureName, setLectureName] = useState('');
  const [lectureColor, setLectureColor] = useState(subject.color || '#3B82F6');
  const [lectureSearch, setLectureSearch] = useState('');

  const currentSubject = (data.subjects || []).find(s => s.id === subject.id) || subject;
  const lectures = currentSubject.lectures || [];

  // Filtered lectures
  const filteredLectures = lectures.filter(l => 
    l.name.toLowerCase().includes(lectureSearch.toLowerCase())
  );

  const handleSaveLecture = (e) => {
    e.preventDefault();
    if (!lectureName.trim()) return;

    const newLecture = {
      id: 'lec-' + Date.now(),
      subjectId: currentSubject.id,
      name: lectureName.trim(),
      status: 'not_started',
      color: lectureColor,
      totalStudySeconds: 0,
      sessions: [],
      notes: [],
      createdAt: Date.now()
    };

    const updatedSubjects = (data.subjects || []).map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          lectures: [...(s.lectures || []), newLecture]
        };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });

    setLectureName('');
    setShowAddLecture(false);
  };

  const handleDeleteLecture = (e, lectureId) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه المحاضرة وملاحظاتها؟')) {
      const updatedSubjects = (data.subjects || []).map(s => {
        if (s.id === currentSubject.id) {
          return {
            ...s,
            lectures: (s.lectures || []).filter(l => l.id !== lectureId)
          };
        }
        return s;
      });

      updateData({
        ...data,
        subjects: updatedSubjects
      });
    }
  };

  const handleToggleLectureStatus = (e, lectureId) => {
    e.stopPropagation();
    const updatedSubjects = (data.subjects || []).map(s => {
      if (s.id === currentSubject.id) {
        const updatedLecs = (s.lectures || []).map(l => {
          if (l.id === lectureId) {
            const nextStatus = l.status === 'completed' ? 'in_progress' : 'completed';
            return { ...l, status: nextStatus };
          }
          return l;
        });
        return { ...s, lectures: updatedLecs };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });
  };

  const totalNotesCount = lectures.reduce((acc, l) => acc + (l.notes || []).length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="الرجوع إلى مركز الدراسة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full" 
                style={{ backgroundColor: currentSubject.color || '#3B82F6' }}
              />
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {currentSubject.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إعدادات الجلسة: {currentSubject.studyTime} دقيقة مذاكرة • {currentSubject.breakTime} دقيقة راحة • {currentSubject.rounds} جولات
            </p>
          </div>
        </div>

        {/* زر "أضف محاضرة" فوق على الشمال */}
        <div>
          <button
            onClick={() => setShowAddLecture(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>أضف محاضرة</span>
          </button>
        </div>
      </div>

      {/* Quick Subject Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">عدد المحاضرات:</span>
          <span className="font-extrabold text-sm text-slate-800">{lectures.length}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">إجمالي وقت المذاكرة:</span>
          <span className="font-extrabold text-sm text-blue-600 font-alexandria">
            {formatDurationHoursMinutes(currentSubject.totalStudySeconds || 0)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">صفحات الملاحظات:</span>
          <span className="font-extrabold text-sm text-amber-600">{totalNotesCount} صفحات</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">المحاضرات المنجزة:</span>
          <span className="font-extrabold text-sm text-emerald-600">
            {lectures.filter(l => l.status === 'completed').length} من {lectures.length}
          </span>
        </div>
      </div>

      {/* Add Lecture Card Form */}
      {showAddLecture && (
        <form 
          onSubmit={handleSaveLecture}
          className="border-2 border-blue-200 rounded-2xl p-6 bg-white shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">
              إضافة محاضرة جديدة لمادة ({currentSubject.name})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddLecture(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              اسم المحاضرة
            </label>
            <input
              type="text"
              value={lectureName}
              onChange={(e) => setLectureName(e.target.value)}
              placeholder="مثال: المحاضرة الأولى - مقدمة عامة"
              autoFocus
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm md:text-base text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              اختر لون الكرت
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setLectureColor(col.value)}
                  style={{ backgroundColor: col.value }}
                  className={`w-8 h-8 rounded-xl transition-transform flex items-center justify-center text-white ${
                    lectureColor === col.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm' : 'hover:scale-105'
                  }`}
                  title={col.label}
                >
                  {lectureColor === col.value && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!lectureName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 transition-colors"
            >
              إضافة المحاضرة
            </button>
            <button
              type="button"
              onClick={() => setShowAddLecture(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Lectures Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-800">
            محاضرات المادة ({lectures.length})
          </h2>

          {/* Quick search input */}
          {lectures.length > 2 && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lectureSearch}
                onChange={(e) => setLectureSearch(e.target.value)}
                placeholder="ابحث في المحاضرات..."
                className="w-full bg-white border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {filteredLectures.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700">لا توجد محاضرات مطابقة</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              اضغط على زر <strong className="text-blue-600">"أضف محاضرة"</strong> بالأعلى لإنشاء المحاضرة والبدء!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLectures.map((lec, idx) => {
              const lecDuration = formatDurationHoursMinutes(lec.totalStudySeconds || 0);
              const notesCount = (lec.notes || []).length;
              const isCompleted = lec.status === 'completed';

              return (
                <div
                  key={lec.id}
                  onClick={() => onSelectLecture(lec, currentSubject)}
                  style={{ borderRightColor: lec.color || '#3B82F6', borderRightWidth: '6px' }}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-200 group relative flex flex-col justify-between ${
                    isCompleted ? 'bg-emerald-50/20' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          محاضرة {idx + 1}
                        </span>

                        {/* Status Checkbox Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleLectureStatus(e, lec.id)}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="تغيير حالة المحاضرة (مكتملة / قيد المذاكرة)"
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>مكتملة</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3 h-3 text-slate-400" />
                              <span>قيد المذاكرة</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={(e) => handleDeleteLecture(e, lec.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        title="حذف المحاضرة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className={`text-base font-bold transition-colors ${
                      isCompleted ? 'text-slate-600' : 'text-slate-800 group-hover:text-blue-600'
                    }`}>
                      {lec.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lecDuration}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>{notesCount} صفحات</span>
                    </div>

                    <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                      فتح المحاضرة ←
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
