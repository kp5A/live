import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Plus, 
  CheckCircle, 
  Settings as SettingsIcon, 
  FileText, 
  Check, 
  Sparkles, 
  Palette, 
  Timer, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Maximize, 
  Minimize, 
  Flame, 
  Award, 
  Waves, 
  Radio, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  formatDurationHoursMinutes, 
  playChimeSound, 
  startAmbientSound, 
  stopAmbientSound, 
  setAmbientVolume 
} from '../utils/storage';
import A4LinedNote from './A4LinedNote';
import PomodoroTimerDisplay from './PomodoroTimerDisplay';
import AudioVoiceRecorder from './AudioVoiceRecorder';

const SHEET_COLOR_OPTIONS = [
  { id: 'white', value: '#FFFFFF', label: 'أبيض كلاسيكي', border: '#E2E8F0' },
  { id: 'cream', value: '#FEFCE8', label: 'كراسة دافئة', border: '#FEF08A' },
  { id: 'mint', value: '#ECFDF5', label: 'نعناعي هادئ', border: '#A7F3D0' },
  { id: 'rose', value: '#FFF1F2', label: 'وردي لطيف', border: '#FECDD3' },
  { id: 'sky', value: '#F0F9FF', label: 'سماوي مريح', border: '#BAE6FD' },
  { id: 'dark', value: '#1E293B', label: 'ليلي داكن', border: '#475569' },
];

export default function LectureDetailView({ 
  lecture, 
  subject, 
  onBack, 
  data, 
  updateData 
}) {
  const currentSubject = (data.subjects || []).find(s => s.id === subject.id) || subject;
  const currentLecture = (currentSubject?.lectures || []).find(l => l.id === lecture.id) || lecture;

  // Safeguard: if lecture was deleted or missing
  if (!currentLecture) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">لم يتم العثور على هذه المحاضرة.</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          العودة للمادة
        </button>
      </div>
    );
  }

  // Session Setup Modal
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [sessionMode, setSessionMode] = useState('pomodoro');
  const [studyMinutes, setStudyMinutes] = useState(currentSubject.studyTime || 25);
  const [breakMinutes, setBreakMinutes] = useState(currentSubject.breakTime || 5);
  const [totalRounds, setTotalRounds] = useState(currentSubject.rounds || 4);

  // Timer Appearance Shape (ring, flip, minimal, dial, hourglass)
  const [timerShape, setTimerShape] = useState(() => {
    const validShapes = ['ring', 'flip', 'minimal', 'dial', 'hourglass'];
    const saved = localStorage.getItem('live_timer_shape');
    return (saved && validShapes.includes(saved)) ? saved : 'ring';
  });

  const handleTimerShapeChange = (shape) => {
    setTimerShape(shape);
    localStorage.setItem('live_timer_shape', shape);
  };

  // Active Timer Screen State
  const [isStudying, setIsStudying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [initialPhaseSeconds, setInitialPhaseSeconds] = useState(25 * 60);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [elapsedStudySecondsInSession, setElapsedStudySecondsInSession] = useState(0);

  // Focus Audio
  const [ambientMode, setAmbientMode] = useState('none'); // 'none' | 'rain' | 'waves' | 'binaural'
  const [ambientVol, setAmbientVol] = useState(0.25);

  // Zen mode (strictly constrained to when isStudying is true!)
  const [zenMode, setZenMode] = useState(false);
  const isZenActive = zenMode && isStudying;

  // Session finish dialog
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [sessionAccomplishment, setSessionAccomplishment] = useState('');
  const [finishedSecondsToSave, setFinishedSecondsToSave] = useState(0);

  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showPalettePicker, setShowPalettePicker] = useState(false);

  // Accurate timer tracking
  const lastTickTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      lastTickTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaSeconds = Math.round((now - lastTickTimeRef.current) / 1000);

        if (deltaSeconds >= 1) {
          lastTickTimeRef.current = now;

          if (sessionMode === 'stopwatch') {
            setTimerSeconds((prev) => prev + deltaSeconds);
            setElapsedStudySecondsInSession((prev) => prev + deltaSeconds);
          } else {
            setTimerSeconds((prev) => {
              if (!isBreakTime) {
                setElapsedStudySecondsInSession((sec) => sec + deltaSeconds);
              }

              if (prev <= deltaSeconds) {
                handlePhaseCompleted();
                return 0;
              }
              return prev - deltaSeconds;
            });
          }
        }
      }, 500);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRunning, sessionMode, isBreakTime]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  // Ambient sound switch
  const handleAmbientChange = (mode) => {
    if (ambientMode === mode) {
      stopAmbientSound();
      setAmbientMode('none');
    } else {
      startAmbientSound(mode, ambientVol);
      setAmbientMode(mode);
    }
  };

  const handleVolumeChange = (vol) => {
    setAmbientVol(vol);
    setAmbientVolume(vol);
  };

  // Phase Finished
  const handlePhaseCompleted = () => {
    playChimeSound('bell');
    confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });

    if (!isBreakTime) {
      if (currentRound >= totalRounds) {
        triggerFinishPrompt();
      } else {
        setIsBreakTime(true);
        const bSeconds = breakMinutes * 60;
        setTimerSeconds(bSeconds);
        setInitialPhaseSeconds(bSeconds);
      }
    } else {
      setIsBreakTime(false);
      setCurrentRound((r) => r + 1);
      const sSeconds = studyMinutes * 60;
      setTimerSeconds(sSeconds);
      setInitialPhaseSeconds(sSeconds);
    }
  };

  // Launch session
  const handleLaunchSession = () => {
    setShowSetupModal(false);
    setIsStudying(true);
    setIsBreakTime(false);
    setCurrentRound(1);
    setElapsedStudySecondsInSession(0);

    if (sessionMode === 'stopwatch') {
      setTimerSeconds(0);
      setInitialPhaseSeconds(0);
    } else {
      const sSeconds = studyMinutes * 60;
      setTimerSeconds(sSeconds);
      setInitialPhaseSeconds(sSeconds);
    }

    setIsRunning(true);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (sessionMode === 'stopwatch') {
      setTimerSeconds(0);
    } else {
      setTimerSeconds((isBreakTime ? breakMinutes : studyMinutes) * 60);
    }
  };

  // TRIGGER FINISH PROMPT (زر "خلصت") - FIX FOR BLACK SCREEN
  const triggerFinishPrompt = () => {
    setIsRunning(false);
    clearInterval(timerIntervalRef.current);
    stopAmbientSound();
    setAmbientMode('none');
    setZenMode(false); // CRUCIAL: ALWAYS DISABLE ZEN ON FINISH!

    if (elapsedStudySecondsInSession > 0) {
      setFinishedSecondsToSave(elapsedStudySecondsInSession);
      setShowFinishDialog(true);
      confetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });
      playChimeSound('bell');
    } else {
      setIsStudying(false);
    }
  };

  // SAVE FINISHED SESSION - SAFE & NO BLACKOUT
  const handleSaveCompletedSession = (e) => {
    if (e) e.preventDefault();
    const secondsLearned = finishedSecondsToSave;

    const newSessionRecord = {
      id: 'sess-' + Date.now(),
      subjectId: currentSubject.id,
      lectureId: currentLecture.id,
      subjectName: currentSubject.name,
      lectureName: currentLecture.name,
      durationSeconds: secondsLearned,
      timestamp: Date.now(),
      mode: sessionMode,
      note: sessionAccomplishment.trim() || 'جلسة مذاكرة وتركيز'
    };

    const updatedSubjects = (data.subjects || []).map((s) => {
      if (s.id === currentSubject.id) {
        const updatedLectures = (s.lectures || []).map((l) => {
          if (l.id === currentLecture.id) {
            return {
              ...l,
              status: 'in_progress',
              totalStudySeconds: (l.totalStudySeconds || 0) + secondsLearned,
              sessions: [newSessionRecord, ...(l.sessions || [])]
            };
          }
          return l;
        });

        return {
          ...s,
          totalStudySeconds: (s.totalStudySeconds || 0) + secondsLearned,
          lectures: updatedLectures
        };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects,
      studySessions: [newSessionRecord, ...(data.studySessions || [])]
    });

    // Reset all flags safely
    setShowFinishDialog(false);
    setIsStudying(false);
    setZenMode(false);
    setElapsedStudySecondsInSession(0);
    setSessionAccomplishment('');
  };

  // Quick preset setup
  const applyPreset = (studyMin, breakMin, roundsCount) => {
    setStudyMinutes(studyMin);
    setBreakMinutes(breakMin);
    setTotalRounds(roundsCount);
    setSessionMode('pomodoro');
  };

  // Add A4 Note Sheet
  const handleAddA4Sheet = (sheetColor) => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: `صفحة ${(currentLecture.notes || []).length + 1}`,
      color: sheetColor,
      paperStyle: 'ruled',
      content: '<p>اكتب ملاحظاتك ومراجعك هنا...</p>',
      createdAt: Date.now()
    };

    const updatedSubjects = (data.subjects || []).map((s) => {
      if (s.id === currentSubject.id) {
        const updatedLectures = (s.lectures || []).map((l) => {
          if (l.id === currentLecture.id) {
            return {
              ...l,
              notes: [...(l.notes || []), newNote]
            };
          }
          return l;
        });
        return { ...s, lectures: updatedLectures };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });

    setShowPalettePicker(false);
  };

  const handleUpdateNoteContent = (noteId, updatedFields) => {
    const updatedSubjects = (data.subjects || []).map((s) => {
      if (s.id === currentSubject.id) {
        const updatedLectures = (s.lectures || []).map((l) => {
          if (l.id === currentLecture.id) {
            const updatedNotes = (l.notes || []).map((n) => {
              if (n.id === noteId) {
                return { ...n, ...updatedFields, updatedAt: Date.now() };
              }
              return n;
            });
            return { ...l, notes: updatedNotes };
          }
          return l;
        });
        return { ...s, lectures: updatedLectures };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });
  };

  const handleSaveVoiceRecording = (newRec) => {
    const updatedSubjects = (data.subjects || []).map((s) => {
      if (s.id === currentSubject.id) {
        const updatedLectures = (s.lectures || []).map((l) => {
          if (l.id === currentLecture.id) {
            return {
              ...l,
              audioRecordings: [newRec, ...(l.audioRecordings || [])]
            };
          }
          return l;
        });
        return { ...s, lectures: updatedLectures };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });
  };

  const handleDeleteVoiceRecording = (recId) => {
    const updatedSubjects = (data.subjects || []).map((s) => {
      if (s.id === currentSubject.id) {
        const updatedLectures = (s.lectures || []).map((l) => {
          if (l.id === currentLecture.id) {
            return {
              ...l,
              audioRecordings: (l.audioRecordings || []).filter((r) => r.id !== recId)
            };
          }
          return l;
        });
        return { ...s, lectures: updatedLectures };
      }
      return s;
    });

    updateData({
      ...data,
      subjects: updatedSubjects
    });
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('هل تريد حذف صفحة الملاحظات هذه؟')) {
      const updatedSubjects = (data.subjects || []).map((s) => {
        if (s.id === currentSubject.id) {
          const updatedLectures = (s.lectures || []).map((l) => {
            if (l.id === currentLecture.id) {
              return {
                ...l,
                notes: (l.notes || []).filter((n) => n.id !== noteId)
              };
            }
            return l;
          });
          return { ...s, lectures: updatedLectures };
        }
        return s;
      });

      updateData({
        ...data,
        subjects: updatedSubjects
      });
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${isZenActive ? 'fixed inset-0 z-50 bg-slate-950 text-white p-6 overflow-y-auto' : ''}`}>
      {/* Top Breadcrumb & Navigation */}
      {!isZenActive && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setZenMode(false);
                onBack();
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="الرجوع إلى المادة"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-0.5">
                <span>{currentSubject.name}</span>
                <span>›</span>
                <span>المحاضرة</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {currentLecture.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي المذاكرة:</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white font-alexandria">
              {formatDurationHoursMinutes(currentLecture.totalStudySeconds || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Main Two Action Buttons (ابدأ مذاكرة & أضف ملاحظات) */}
      {!isStudying && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div className="text-right">
              <span className="block text-lg">ابدأ مذاكرة</span>
              <span className="block text-xs text-blue-100 font-normal">
                بومودورو متعدد الأشكال أو مؤقت مفتوح
              </span>
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPalettePicker(!showPalettePicker)}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#22c55e] hover:bg-emerald-600 text-white font-bold text-base shadow-md shadow-emerald-500/25 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-lg">أضف ملاحظات</span>
                <span className="block text-xs text-emerald-100 font-normal">
                  اختر لون الصفحة وأضف صفحة مسطرة A4
                </span>
              </div>
            </button>

            {showPalettePicker && (
              <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto sm:w-80 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 z-30 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-white">اختر لون ورقة الملاحظات:</span>
                  <button 
                    onClick={() => setShowPalettePicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SHEET_COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleAddA4Sheet(col.value)}
                      style={{ backgroundColor: col.value, borderColor: col.border }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold text-slate-700 hover:scale-102 transition-transform shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400" style={{ backgroundColor: col.value }} />
                      <span className={col.id === 'dark' ? 'text-white' : 'text-slate-800'}>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETUP MODAL WITH PRESETS */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                إعداد جلسة المذاكرة
              </h3>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Presets */}
            <div>
              <span className="block text-xs font-bold text-slate-500 mb-2">أنماط سريعة جاهزة:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(25, 5, 4)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    studyMinutes === 25 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  25 د / 5 راحة 🍅
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 10, 2)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    studyMinutes === 50 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  50 د / 10 راحة ⚡
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(90, 20, 2)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    studyMinutes === 90 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  90 د / 20 راحة 🚀
                </button>
              </div>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setSessionMode('pomodoro')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  sessionMode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                نظام بومودورو 🍅
              </button>
              <button
                type="button"
                onClick={() => setSessionMode('stopwatch')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  sessionMode === 'stopwatch'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                مؤقت مفتوح من صفر ⏱️
              </button>
            </div>

            {sessionMode === 'pomodoro' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1 text-center">
                      المذاكرة
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={studyMinutes}
                      onChange={(e) => setStudyMinutes(Number(e.target.value) || 25)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="block text-[10px] text-slate-400 text-center mt-0.5">دقيقة</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1 text-center">
                      الراحة
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(Number(e.target.value) || 5)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="block text-[10px] text-slate-400 text-center mt-0.5">دقيقة</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1 text-center">
                      الجولات
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={totalRounds}
                      onChange={(e) => setTotalRounds(Number(e.target.value) || 4)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="block text-[10px] text-slate-400 text-center mt-0.5">جولات</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 text-center space-y-2">
                <Timer className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">مؤقت تصاعدي يبدأ من 00:00</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  يبدأ المؤقت في العد التصاعدي، وعندما تنتهي اضغط على زر <strong className="text-emerald-600">"خلصت"</strong> ليتم حفظ وقتك المسجل مباشرة!
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLaunchSession}
                className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
              >
                بدء المذاكرة الآن
              </button>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE MULTI-SHAPE POMODORO SCREEN */}
      {isStudying && (
        <div className={`rounded-3xl p-6 sm:p-10 border-2 shadow-xl space-y-8 animate-in fade-in duration-200 ${
          isZenActive 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 text-slate-800 dark:text-white'
        }`}>
          {/* Top Status & Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                isBreakTime 
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200' 
                  : sessionMode === 'stopwatch' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
              }`}>
                {isBreakTime 
                  ? 'وقت الاستراحة ☕' 
                  : sessionMode === 'stopwatch' 
                    ? 'مؤقت مفتوح ⏱️' 
                    : `وقت التركيز 📚 (جولة ${currentRound} من ${totalRounds})`}
              </span>
            </div>

            {/* Ambient Sound & Focus Tools */}
            <div className="flex items-center gap-2">
              {/* Rain Sound */}
              <button
                onClick={() => handleAmbientChange('rain')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ambientMode === 'rain'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="صوت المطر الهادئ للتركيز"
              >
                <CloudRain className="w-4 h-4" />
                <span className="hidden md:inline">مطر 🌧️</span>
              </button>

              {/* Waves */}
              <button
                onClick={() => handleAmbientChange('waves')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ambientMode === 'waves'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="أمواج البحر الهادئة"
              >
                <Waves className="w-4 h-4" />
                <span className="hidden md:inline">أمواج 🌊</span>
              </button>

              {/* Binaural Beats */}
              <button
                onClick={() => handleAmbientChange('binaural')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ambientMode === 'binaural'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="موجات ألفا للتركيز الذهني 10Hz"
              >
                <Radio className="w-4 h-4" />
                <span className="hidden md:inline">موجات ألفا 🧠</span>
              </button>

              {/* Fullscreen Zen Mode */}
              <button
                onClick={() => setZenMode(!zenMode)}
                className={`p-2 rounded-xl transition-colors ${
                  isZenActive ? 'bg-slate-700 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={zenMode ? 'الخروج من وضع التركيز الكامل' : 'وضع التركيز الكامل (Zen)'}
              >
                {zenMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {/* Time Adjust Settings */}
              <button
                onClick={() => setShowTimerSettings(!showTimerSettings)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="تعديل سريع للوقت"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Adjust Settings Panel */}
          {showTimerSettings && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-4 text-xs animate-in fade-in">
              <span className="font-semibold">تعديل سريع للوقت:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimerSeconds((s) => s + 300)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  +5 دقائق
                </button>
                <button
                  onClick={() => setTimerSeconds((s) => Math.max(60, s - 300))}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  -5 دقائق
                </button>
              </div>
            </div>
          )}

          {/* THE MULTI-SHAPE POMODORO DISPLAY (Tomato, Circle, Hourglass, Tree, Neon, Flip) */}
          <PomodoroTimerDisplay
            seconds={timerSeconds}
            initialSeconds={initialPhaseSeconds}
            isRunning={isRunning}
            isBreakTime={isBreakTime}
            timerStyle={timerShape}
            onStyleChange={handleTimerShapeChange}
            sessionMode={sessionMode}
          />

          <div className="text-center text-xs opacity-70">
            الوقت المكتسب في هذه الجلسة: <strong className="font-bold">{formatDurationHoursMinutes(elapsedStudySecondsInSession)}</strong>
          </div>

          {/* Controls: (Start/Pause), Reset, and FINISH */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:scale-102 ${
                isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>إيقاف مؤقت (Stop)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>استئناف (Start)</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTimer}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
              title="إعادة بدء المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة بدأ</span>
            </button>

            {/* ZER KHILIST (زر خلصت مذاكرة) */}
            <button
              onClick={triggerFinishPrompt}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#22c55e] hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
            >
              <CheckCircle className="w-5 h-5" />
              <span>خلصت (إنهاء وحفظ الوقت)</span>
            </button>
          </div>
        </div>
      )}

      {/* SESSION FINISH DIALOG (ROBUST, NO BLACKOUT) */}
      {showFinishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form 
            onSubmit={handleSaveCompletedSession}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 text-slate-800 dark:text-white"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                <Award className="w-9 h-9 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                أحسنت يا بطل! تم إنهاء الجلسة 🎉
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أنجزت مذاكرة مدتها <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{formatDurationHoursMinutes(finishedSecondsToSave)}</strong> في هذه الجلسة.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ما الذي أنجزته أو تعلمته؟ (اختياري)
              </label>
              <input
                type="text"
                value={sessionAccomplishment}
                onChange={(e) => setSessionAccomplishment(e.target.value)}
                placeholder="مثال: فهمت الدرس الأول وحللت مسألتين..."
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                تأكيد وحفظ في الإحصائيات
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinishDialog(false);
                  setIsStudying(false);
                  setZenMode(false);
                }}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
              >
                تخطي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VOICE RECORDINGS SECTION */}
      {!isZenActive && (
        <AudioVoiceRecorder
          recordings={currentLecture.audioRecordings || []}
          onSaveRecording={handleSaveVoiceRecording}
          onDeleteRecording={handleDeleteVoiceRecording}
        />
      )}

      {/* SECTION: A4 LINED NOTEBOOK PAGES */}
      {!isZenActive && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                دفتر ملاحظات المحاضرة (A4)
              </h2>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {(currentLecture.notes || []).length} صفحة
              </span>
            </div>

            {!showPalettePicker && !isStudying && (
              <button
                onClick={() => setShowPalettePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>أضف صفحة جديدة</span>
              </button>
            )}
          </div>

          {(!currentLecture.notes || currentLecture.notes.length === 0) ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">لا توجد ملاحظات لهذه المحاضرة بعد</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                اضغط على زر <strong className="text-emerald-600">"أضف ملاحظات"</strong> بالأعلى لاختيار لون الورقة ونوع التسطير وإضافة صفحة مسطرة A4 لتدوين ملاحظاتك وروابطك!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentLecture.notes.map((note) => (
                <A4LinedNote
                  key={note.id}
                  note={note}
                  lectureTitle={currentLecture.name}
                  onUpdateContent={handleUpdateNoteContent}
                  onDeleteNote={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
