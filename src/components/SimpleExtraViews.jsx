import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  RotateCw, 
  Check, 
  Trash2, 
  Compass, 
  Flame, 
  CheckCircle2, 
  Circle,
  FileText,
  BookOpen,
  Sparkles,
  Trophy,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function FlashcardsView({ data, updateData }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [cardSubjectId, setCardSubjectId] = useState('');

  const flashcards = data.flashcards || [];
  const subjects = data.subjects || [];

  const filteredCards = flashcards.filter(c => {
    if (selectedSubjectId === 'all') return true;
    return c.subjectId === selectedSubjectId;
  });

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (filteredCards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    }
  };

  const handleDifficultyRate = (diff) => {
    if (!currentCard) return;

    if (diff === 'easy') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    const updated = flashcards.map(c => {
      if (c.id === currentCard.id) {
        return { 
          ...c, 
          difficulty: diff, 
          repetitions: (c.repetitions || 0) + 1 
        };
      }
      return c;
    });

    updateData({
      ...data,
      flashcards: updated
    });

    handleNext();
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newCard = {
      id: 'fc-' + Date.now(),
      subjectId: cardSubjectId || (subjects[0]?.id || 'sub-1'),
      question: question.trim(),
      answer: answer.trim(),
      difficulty: 'medium',
      repetitions: 0
    };

    updateData({
      ...data,
      flashcards: [...flashcards, newCard]
    });

    setQuestion('');
    setAnswer('');
    setShowAddModal(false);
  };

  const handleDeleteCard = (cardId) => {
    const updated = flashcards.filter(c => c.id !== cardId);
    updateData({
      ...data,
      flashcards: updated
    });
    if (currentCardIndex >= updated.length) {
      setCurrentCardIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            البطاقات التعليمية الذكية (Flashcards)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            نظام التكرار المتباعد لاختبار حفظك ومراجعة المفاهيم الأساسية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">كل المواد ({flashcards.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>أضف بطاقة</span>
          </button>
        </div>
      </div>

      {/* Interactive Active Card Reviewer */}
      {filteredCards.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>البطاقة {currentCardIndex + 1} من {filteredCards.length}</span>
            <span className="flex items-center gap-1 text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مراجعة ذكية</span>
            </span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900 rounded-3xl p-8 shadow-md hover:shadow-lg cursor-pointer flex flex-col justify-between text-center transition-all duration-300 relative group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                isFlipped ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {isFlipped ? 'الإجابة والشرح 💡' : 'السؤال والمفهوم ❓'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCard(currentCard.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                title="حذف البطاقة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto py-6 font-bold text-lg md:text-xl text-slate-800 dark:text-white leading-relaxed whitespace-pre-line">
              {isFlipped ? currentCard.answer : currentCard.question}
            </div>

            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center gap-1">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
              <span>انقر لقلب البطاقة</span>
            </div>
          </div>

          {/* Spaced Repetition Buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleDifficultyRate('hard')}
              className="py-3 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs transition-all"
            >
              صعب (تكرار قريباً) 🔁
            </button>
            <button
              onClick={() => handleDifficultyRate('medium')}
              className="py-3 px-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs transition-all"
            >
              متوسط 🤔
            </button>
            <button
              onClick={() => handleDifficultyRate('easy')}
              className="py-3 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all"
            >
              سهل (أتقنتها) 🌟
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">لا توجد بطاقات في هذا التصنيف</h3>
          <p className="text-xs text-slate-400">
            أضف بطاقات تعليمية جديدة لحفظ المصطلحات والأسئلة الهامة بسهولة!
          </p>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form 
            onSubmit={handleAddCard}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                إضافة بطاقة تعليمية جديدة
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                المادة التابعة لها
              </label>
              <select
                value={cardSubjectId}
                onChange={(e) => setCardSubjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                السؤال أو المفهوم (وجه البطاقة)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب السؤال هنا..."
                rows={2}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                الإجابة أو الشرح (ظهر البطاقة)
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="اكتب الإجابة النموذجية أو الشرح..."
                rows={3}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
              >
                حفظ البطاقة
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function HabitsView({ data, updateData }) {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const weekDayLabels = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];
  const fullDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const habits = data.habits || [];

  const handleToggleDay = (habitId, dayIndex) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const days = [...(h.weekDays || [false, false, false, false, false, false, false])];
        days[dayIndex] = !days[dayIndex];
        const streakCount = days.filter(Boolean).length;
        return { ...h, weekDays: days, streak: streakCount };
      }
      return h;
    });

    const totalDoneToday = updated.filter(h => h.weekDays && h.weekDays[0]).length;

    updateData({
      ...data,
      habits: updated,
      habitsCompletedCount: totalDoneToday
    });
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newH = {
      id: 'h-' + Date.now(),
      title: newHabitTitle.trim(),
      streak: 1,
      weekDays: [true, false, false, false, false, false, false]
    };

    updateData({
      ...data,
      habits: [...habits, newH]
    });

    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const handleDeleteHabit = (habitId) => {
    const updated = habits.filter(h => h.id !== habitId);
    updateData({
      ...data,
      habits: updated
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            متابع العادات الدراسية (Weekly Habits)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ابنِ عادات دراسية يومية وحافظ على تتابع إنجازك الأسبوعي
          </p>
        </div>

        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>أضف عادة</span>
        </button>
      </div>

      {showAddHabit && (
        <form onSubmit={handleAddHabit} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md space-y-3">
          <input
            type="text"
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            placeholder="مثال: قراءة 15 صفحة من المرجع، حل مسألة خوارزميات..."
            autoFocus
            required
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
              إضافة العادة
            </button>
            <button type="button" onClick={() => setShowAddHabit(false)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold">
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Habits List with 7-Day checkboxes */}
      <div className="space-y-3">
        {habits.map(h => (
          <div
            key={h.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {h.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>أنجزت {h.streak} أيام هذا الأسبوع</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 7 Days Circles */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                {(h.weekDays || [false, false, false, false, false, false, false]).map((isDone, dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => handleToggleDay(h.id, dayIdx)}
                    title={fullDays[dayIdx]}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isDone 
                        ? 'bg-emerald-500 text-white shadow-2xs scale-105' 
                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isDone ? '✓' : weekDayLabels[dayIdx]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleDeleteHabit(h.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-opacity"
                title="حذف العادة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
