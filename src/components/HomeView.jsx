import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  X, 
  Plus, 
  Clock, 
  BookOpen, 
  Flame, 
  Target, 
  ArrowLeft, 
  Play, 
  Filter, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { 
  formatDurationHoursMinutes, 
  calculateStudyStreak, 
  getExamCountdown 
} from '../utils/storage';

const INSPIRATIONAL_QUOTES = [
  'التركيز هو أن تقول لا لكل شيء آخر',
  'النجاح هو مجموع جهود صغيرة تتكرر يوماً بعد يوم',
  'ابدأ من حيث أنت، استخدم ما لديك، افعل ما تستطيع',
  'كل خبير كان في يوم من الأيام مبتدئاً لا يستسلم',
  'الانضباط هو الجسر بين الأهداف والإنجازات',
  'لا تنتظر اللحظة المثالية، خذ اللحظة واجعلها مثالية'
];

export default function HomeView({ 
  data, 
  updateData, 
  onNavigateToStudy, 
  onQuickResumeLecture 
}) {
  const [taskInput, setTaskInput] = useState('');
  const [taskCategory, setTaskCategory] = useState('دراسة');
  const [taskPriority, setTaskPriority] = useState('عالية');
  const [taskDuration, setTaskDuration] = useState('60 دقيقه');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Add Exam Modal
  const [showAddExam, setShowAddExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');

  // Stats calculation
  const openTasksCount = (data.tasks || []).filter(t => !t.completed).length;
  const completedHabitsCount = (data.habits || []).filter(h => h.weekDays && h.weekDays[0]).length;
  
  // Total study time
  const totalSeconds = (data.subjects || []).reduce((acc, sub) => acc + (sub.totalStudySeconds || 0), 0);
  const formattedStudyTime = formatDurationHoursMinutes(totalSeconds);

  // Today's Study Time & Goal
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = (data.studySessions || []).filter(s => (s.timestamp || 0) >= todayStart.getTime());
  const todaySeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const todayMinutes = Math.round(todaySeconds / 60);

  const dailyGoalMinutes = data.dailyGoalMinutes || 120;
  const goalProgressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  const streak = calculateStudyStreak(data.studySessions || []);
  const latestSession = (data.studySessions && data.studySessions.length > 0) ? data.studySessions[0] : null;

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
  };

  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!taskInput.trim()) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: taskInput.trim(),
      category: taskCategory,
      priority: taskPriority,
      duration: taskDuration,
      subjectId: selectedSubjectId || null,
      completed: false,
      createdAt: Date.now()
    };

    updateData({
      ...data,
      tasks: [newTask, ...(data.tasks || [])]
    });

    setTaskInput('');
  };

  const handleToggleTask = (taskId) => {
    const updated = (data.tasks || []).map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    updateData({
      ...data,
      tasks: updated
    });
  };

  const handleDeleteTask = (taskId) => {
    const updated = (data.tasks || []).filter(task => task.id !== taskId);
    updateData({
      ...data,
      tasks: updated
    });
  };

  // Add Exam
  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;

    const selectedSub = (data.subjects || []).find(s => s.id === examSubjectId);

    const newExam = {
      id: 'exam-' + Date.now(),
      subjectId: examSubjectId,
      subjectName: selectedSub ? selectedSub.name : 'مادة عامة',
      title: examTitle.trim(),
      dateTime: new Date(examDate).toISOString(),
      color: selectedSub ? selectedSub.color : '#EF4444'
    };

    updateData({
      ...data,
      exams: [...(data.exams || []), newExam]
    });

    setExamTitle('');
    setExamDate('');
    setShowAddExam(false);
  };

  const handleDeleteExam = (examId) => {
    const updated = (data.exams || []).filter(e => e.id !== examId);
    updateData({
      ...data,
      exams: updated
    });
  };

  const filteredTasks = (data.tasks || []).filter(task => {
    if (taskFilter === 'active') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 pb-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          مرحبًا بك، جاهز ليوم جديد مليء بالإنجاز؟
        </h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>تتابع {streak} أيام متواصلة 🔥</span>
          </div>
        )}
      </div>

      {/* Top 3 Stat Cards (Exact match to Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#2563EB] text-white p-5 rounded-2xl shadow-sm shadow-blue-500/20 flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-0.5">
          <span className="text-3xl md:text-4xl font-extrabold mb-1 font-alexandria">
            {openTasksCount}
          </span>
          <span className="text-sm font-medium text-blue-100">مهام مفتوحة</span>
        </div>

        <div className="bg-[#22C55E] text-white p-5 rounded-2xl shadow-sm shadow-emerald-500/20 flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-0.5">
          <span className="text-3xl md:text-4xl font-extrabold mb-1 font-alexandria">
            {completedHabitsCount}
          </span>
          <span className="text-sm font-medium text-emerald-100">عادات مكتملة</span>
        </div>

        <div className="bg-[#9333EA] text-white p-5 rounded-2xl shadow-sm shadow-purple-500/20 flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-0.5">
          <span className="text-3xl md:text-4xl font-extrabold mb-1 font-alexandria">
            {formattedStudyTime}
          </span>
          <span className="text-sm font-medium text-purple-100">وقت المذاكرة الكلي</span>
        </div>
      </div>

      {/* Daily Study Goal Tracker Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>الهدف الدراسي اليومي ({dailyGoalMinutes / 60} ساعات)</span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400">
            أنجزت {todayMinutes} دقيقة ({goalProgressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${goalProgressPercent}%` }}
          />
        </div>
      </div>

      {/* EXAMS COUNTDOWN WIDGET */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>العد التنازلي للامتحانات والاختبارات القادمة ⏳</span>
          </div>

          <button
            onClick={() => setShowAddExam(true)}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>أضف موعد امتحان</span>
          </button>
        </div>

        {(!data.exams || data.exams.length === 0) ? (
          <p className="text-xs text-slate-400 text-center py-3">
            لا توجد امتحانات مسجلة. أضف مواعيد اختباراتك لمتابعة الأيام المتبقية!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.exams.map((exam) => {
              const countdown = getExamCountdown(exam.dateTime);
              return (
                <div
                  key={exam.id}
                  style={{ borderRightColor: exam.color || '#EF4444', borderRightWidth: '4px' }}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {exam.subjectName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {exam.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <div className="text-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="block text-sm font-black text-rose-600 font-alexandria">
                        {countdown.days} يوم
                      </span>
                      <span className="block text-[9px] text-slate-400">
                        و {countdown.hours} ساعة
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quote Banner (Exact match to Screenshot 1) */}
      <div 
        onClick={handleNextQuote}
        className="bg-[#FFF7ED] dark:bg-amber-950/20 border border-[#FED7AA] dark:border-amber-800/40 rounded-2xl p-5 cursor-pointer hover:bg-[#FFEDD5] dark:hover:bg-amber-950/30 transition-all duration-200 text-center shadow-xs group"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-amber-200 font-bold text-base md:text-lg mb-1">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 group-hover:rotate-12 transition-transform" />
          <span>{INSPIRATIONAL_QUOTES[quoteIndex]}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          انقر للحصول على اقتباس جديد ✨
        </p>
      </div>

      {/* Quick Resume Last Studied Lecture */}
      {latestSession && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">آخر مذاكرة:</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {latestSession.subjectName} • {latestSession.lectureName}
              </h4>
            </div>
          </div>

          <button
            onClick={() => onQuickResumeLecture && onQuickResumeLecture(latestSession.subjectId, latestSession.lectureId)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>متابعة المذاكرة</span>
          </button>
        </div>
      )}

      {/* Today's Tasks Section (مهام اليوم) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              مهام اليوم
            </h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredTasks.length} مهام
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                taskFilter === 'all' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTaskFilter('active')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                taskFilter === 'active' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              المتبقية
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                taskFilter === 'completed' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              المكتملة
            </button>
          </div>
        </div>

        {/* Add Task Input with dashed box */}
        <form onSubmit={handleAddTask} className="relative">
          <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="اكتب مهمتك واضغط على زر الإضافة أو Enter..."
              className="w-full bg-transparent text-sm md:text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
            />
            
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                  <option value="دراسة">دراسة</option>
                  <option value="مراجعة">مراجعة</option>
                  <option value="واجب">واجب</option>
                  <option value="مشروع">مشروع</option>
                </select>

                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                  <option value="عالية">أولوية عالية 🔴</option>
                  <option value="متوسطة">أولوية متوسطة 🟡</option>
                  <option value="عادية">أولوية عادية 🟢</option>
                </select>

                <input
                  type="text"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(e.target.value)}
                  placeholder="المدة"
                  className="w-20 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none"
                />

                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none max-w-[140px]"
                >
                  <option value="">ربط بمادة (اختياري)</option>
                  {(data.subjects || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!taskInput.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#22c55e] hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مهمة</span>
              </button>
            </div>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2.5 pt-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا توجد مهام في هذا التصنيف.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const matchedSubject = (data.subjects || []).find(s => s.id === task.subjectId);

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    task.completed 
                      ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 opacity-60' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      aria-label={task.completed ? "إلغاء الإكمال" : "إكمال المهمة"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm md:text-base font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {task.title}
                      </span>
                      {matchedSubject && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          تابعة لمادة: <strong style={{ color: matchedSubject.color }}>{matchedSubject.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {task.category || 'دراسة'}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      task.priority === 'عالية' 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {task.priority || 'عالية'}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                      {task.duration || '60 دقيقه'}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors mr-1"
                      aria-label="حذف المهمة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD EXAM MODAL */}
      {showAddExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveExam}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                إضافة موعد امتحان جديد
              </h3>
              <button
                type="button"
                onClick={() => setShowAddExam(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                المادة
              </label>
              <select
                value={examSubjectId}
                onChange={(e) => setExamSubjectId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">اختر المادة...</option>
                {(data.subjects || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                عنوان أو نوع الامتحان
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="مثال: امتحان الفاينل، اختبار قصير..."
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                تاريخ ووقت الامتحان
              </label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
              >
                حفظ موعد الامتحان
              </button>
              <button
                type="button"
                onClick={() => setShowAddExam(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jump to Study Center CTA */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">مركز دراستك المنظم</h3>
          <p className="text-xs text-emerald-100 mt-1">
            تابع موادك الدراسية، أضف محاضراتك، وابدأ جلسات بومودورو مع حفظ الوقت محلياً.
          </p>
        </div>
        <button
          onClick={onNavigateToStudy}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm shadow transition-all hover:scale-102"
        >
          <BookOpen className="w-4 h-4" />
          <span>الدخول لمركز الدراسة</span>
        </button>
      </div>
    </div>
  );
}
