// Local storage keys
const STORAGE_KEY = 'live_student_data_v2';
const PIN_KEY = 'live_student_pin_v2';

// Initial default seed data
const DEFAULT_DATA = {
  dailyGoalMinutes: 120, // 2 hours
  gpaScale: 4.0, // 4.0 or 5.0
  settings: {
    theme: 'light',
    soundEnabled: true,
    chimeSound: 'bell',
    tickSoundEnabled: false,
    ambientSound: 'none',
    ambientVolume: 0.25,
    autoStartBreaks: false,
    longBreakInterval: 4,
    longBreakMinutes: 15,
    autoLockMinutes: 0
  },
  exams: [
    {
      id: 'exam-1',
      subjectId: 'sub-1',
      subjectName: 'Air law',
      title: 'امتحان منتصف الفصل - قوانين الطيران',
      dateTime: new Date(Date.now() + 86400000 * 6 + 3600000 * 4).toISOString(),
      color: '#EF4444'
    },
    {
      id: 'exam-2',
      subjectId: 'sub-2',
      subjectName: 'Oop',
      title: 'الاختبار العملي لمادة OOP',
      dateTime: new Date(Date.now() + 86400000 * 12 + 3600000 * 8).toISOString(),
      color: '#A855F7'
    }
  ],
  subjects: [
    {
      id: 'sub-1',
      name: 'Air law',
      studyTime: 25,
      breakTime: 5,
      rounds: 4,
      targetHours: 10,
      creditHours: 3,
      expectedGrade: 'A',
      color: '#EF4444',
      totalStudySeconds: 3600,
      lectures: [
        {
          id: 'lec-1-1',
          subjectId: 'sub-1',
          name: 'المحاضرة 1: مقدمة في قوانين الطيران الدولي',
          status: 'completed',
          color: '#EF4444',
          totalStudySeconds: 2400,
          sessions: [
            {
              id: 'sess-1',
              timestamp: Date.now() - 3600000 * 3,
              durationSeconds: 1500,
              mode: 'pomodoro',
              note: 'فهم اتفاقية شيكاغو والقوانين الأساسية'
            },
            {
              id: 'sess-2',
              timestamp: Date.now() - 3600000 * 1,
              durationSeconds: 900,
              mode: 'stopwatch',
              note: 'مراجعة الملحق 2 الخاص بقواعد الجو'
            }
          ],
          audioRecordings: [],
          notes: [
            {
              id: 'note-1-1',
              title: 'ملخص اتفاقية شيكاغو 1944',
              paperStyle: 'ruled',
              color: '#FFFFFF',
              content: '<h2>قوانين اتفاقية شيكاغو 1944</h2><p>أهم البنود والمبادئ الأساسية للسيادة الجوية للدول وسلامة الطيران المدني الدولي.</p><p>المرجع الرسمي: <a href="https://www.icao.int" target="_blank" rel="noopener noreferrer">منظمة الطيران المدني الدولي (ICAO) ↗</a></p><ul><li>المادة 1: لكل دولة سيادة كاملة ومطلقة على الفضاء الجوي فوق إقليمها.</li><li>المادة 5: حق الطيران غير المنتظم للرحلات التجارية الخاصة.</li></ul><p><strong>ملاحظة هامة:</strong> مراجعة الملحق 2 الخاص بقواعد الجو ومسارات الملاحة قبل الامتحان.</p>',
              createdAt: Date.now() - 3600000 * 3
            }
          ]
        },
        {
          id: 'lec-1-2',
          subjectId: 'sub-1',
          name: 'Air law 2 L2: مسؤوليات الناقل الجوي',
          status: 'in_progress',
          color: '#3B82F6',
          totalStudySeconds: 1200,
          sessions: [
            {
              id: 'sess-3',
              timestamp: Date.now() - 3600000 * 20,
              durationSeconds: 1200,
              mode: 'pomodoro',
              note: 'معاهدة وارسو وتعديلاتها'
            }
          ],
          audioRecordings: [],
          notes: []
        }
      ]
    },
    {
      id: 'sub-2',
      name: 'Oop',
      studyTime: 25,
      breakTime: 5,
      rounds: 4,
      targetHours: 15,
      creditHours: 4,
      expectedGrade: 'A+',
      color: '#A855F7',
      totalStudySeconds: 1800,
      lectures: [
        {
          id: 'lec-2-1',
          subjectId: 'sub-2',
          name: 'Classes & Inheritance',
          status: 'in_progress',
          color: '#A855F7',
          totalStudySeconds: 1800,
          sessions: [
            {
              id: 'sess-4',
              timestamp: Date.now() - 86400000 * 2,
              durationSeconds: 1800,
              mode: 'pomodoro',
              note: 'شرح Polymorphism و Abstract Classes'
            }
          ],
          audioRecordings: [],
          notes: []
        }
      ]
    }
  ],
  stickyNotes: [
    { id: 'sn-1', text: 'Khaki\n٢.٣٦/١١/٢', color: '#FEF08A' },
    { id: 'sn-2', text: 'Koka\n٢.٣٦/١١/٢', color: '#FEF08A' },
    { id: 'sn-3', text: 'Ôaaa\n٢.٣٦/١١/٢', color: '#BBF7D0' },
    { id: 'sn-4', text: 'Foddw\n٢.٣٦/١١/٢', color: '#FEF08A' },
    { id: 'sn-5', text: 'Ffff\n٢.٣٦/١١/٢', color: '#FBCFE8' },
    { id: 'sn-6', text: 'Nniirooo\n٢.٣٦/١١/٢', color: '#FBCFE8' },
    { id: 'sn-7', text: 'Ffollaaae\n٢.٣٦/١١/٢', color: '#FED7AA' }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Air law 2 L2: دراسة مسؤوليات الناقل الجوي',
      category: 'دراسة',
      priority: 'عالية',
      duration: '60 دقيقه',
      subjectId: 'sub-1',
      lectureId: 'lec-1-2',
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 'task-2',
      title: 'حل تمارين OOP على الـ Inheritance',
      category: 'مراجعة',
      priority: 'متوسطة',
      duration: '45 دقيقه',
      subjectId: 'sub-2',
      lectureId: 'lec-2-1',
      completed: true,
      createdAt: Date.now() - 86400000
    }
  ],
  flashcards: [
    {
      id: 'fc-1',
      subjectId: 'sub-1',
      question: 'ما هي معاهدة شيكاغو للطيران المدني؟',
      answer: 'معاهدة أُبرمت عام 1944 لوضع القواعد الدولية للسلامة والسيادة الجوية والنقل الجوي المدني وإنشاء منظمة ICAO.',
      difficulty: 'medium',
      repetitions: 2
    },
    {
      id: 'fc-2',
      subjectId: 'sub-2',
      question: 'ما هو مبدأ التغليف (Encapsulation) في OOP؟',
      answer: 'تجميع المتغيرات والدوال داخل وحدة واحدة (Class) وإخفاء التفاصيل الداخلية باستخدام Access Modifiers.',
      difficulty: 'easy',
      repetitions: 4
    },
    {
      id: 'fc-3',
      subjectId: 'sub-2',
      question: 'ما الفرق بين Overloading و Overriding؟',
      answer: 'Overloading: دوال بنفس الاسم في نفس الكلاس مع اختلاف البارامترات. Overriding: إعادة كتابة دالة في الكلاس الابن موروثة من الكلاس الأب.',
      difficulty: 'hard',
      repetitions: 1
    }
  ],
  weeklySchedule: [
    { day: 'السبت', items: [{ time: '09:00 - 11:00', title: 'Air law - قاعة 3', color: '#EF4444' }] },
    { day: 'الأحد', items: [{ time: '11:30 - 01:30', title: 'Oop - معمل الحاسب', color: '#A855F7' }] },
    { day: 'الإثنين', items: [{ time: '10:00 - 12:00', title: 'Air law 2', color: '#EF4444' }] },
    { day: 'الثلاثاء', items: [{ time: '01:00 - 03:00', title: 'مراجعة وتطبيقات OOP', color: '#A855F7' }] },
    { day: 'الأربعاء', items: [] },
    { day: 'الخميس', items: [{ time: '04:00 - 06:00', title: 'جلسة مذاكرة حرة بومودورو', color: '#22C55E' }] },
    { day: 'الجمعة', items: [] }
  ],
  habits: [
    { id: 'h1', title: 'مذاكرة 50 دقيقة على الأقل', streak: 4, weekDays: [true, true, true, true, false, false, false] },
    { id: 'h2', title: 'مراجعة الملاحظات بعد كل محاضرة', streak: 2, weekDays: [true, false, true, false, false, false, false] },
    { id: 'h3', title: 'حل تطبيق عملي أو مسائل', streak: 5, weekDays: [true, true, true, true, true, false, false] },
    { id: 'h4', title: 'شرب 2 لتر ماء أثناء المذاكرة', streak: 7, weekDays: [true, true, true, true, true, true, true] }
  ],
  scheduleImage: null,
  studySessions: [
    {
      id: 'sess-1',
      subjectId: 'sub-1',
      lectureId: 'lec-1-1',
      subjectName: 'Air law',
      lectureName: 'المحاضرة 1: مقدمة في قوانين الطيران الدولي',
      durationSeconds: 1500,
      timestamp: Date.now() - 3600000 * 3,
      mode: 'pomodoro',
      note: 'فهم اتفاقية شيكاغو'
    },
    {
      id: 'sess-2',
      subjectId: 'sub-1',
      lectureId: 'lec-1-1',
      subjectName: 'Air law',
      lectureName: 'المحاضرة 1: مقدمة في قوانين الطيران الدولي',
      durationSeconds: 900,
      timestamp: Date.now() - 3600000 * 1,
      mode: 'stopwatch',
      note: 'مراجعة الملحق 2'
    },
    {
      id: 'sess-3',
      subjectId: 'sub-1',
      lectureId: 'lec-1-2',
      subjectName: 'Air law',
      lectureName: 'Air law 2 L2: مسؤوليات الناقل الجوي',
      durationSeconds: 1200,
      timestamp: Date.now() - 3600000 * 20,
      mode: 'pomodoro',
      note: 'معاهدة وارسو'
    },
    {
      id: 'sess-4',
      subjectId: 'sub-2',
      lectureId: 'lec-2-1',
      subjectName: 'Oop',
      lectureName: 'Classes & Inheritance',
      durationSeconds: 1800,
      timestamp: Date.now() - 86400000 * 2,
      mode: 'pomodoro',
      note: 'Polymorphism'
    }
  ],
  habitsCompletedCount: 2
};

export function loadStudentData() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const oldV1 = localStorage.getItem('live_student_data_v1');
      if (oldV1) raw = oldV1;
    }

    if (!raw) {
      saveStudentData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed };
  } catch (e) {
    console.error('Error loading student data:', e);
    return DEFAULT_DATA;
  }
}

export function saveStudentData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving student data:', e);
  }
}

export function getStorageUsageKB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    return (new Blob([raw]).size / 1024).toFixed(1);
  } catch (e) {
    return '0';
  }
}

export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'live_salt_student_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSavedPinHash() {
  return localStorage.getItem(PIN_KEY);
}

export async function setSecurityPin(pin) {
  if (!pin) {
    localStorage.removeItem(PIN_KEY);
    return;
  }
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_KEY, hash);
}

export async function verifySecurityPin(pin) {
  const saved = getSavedPinHash();
  if (!saved) return true;
  const hash = await hashPin(pin);
  return hash === saved;
}

export function formatDurationHoursMinutes(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0h 0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function formatTimerDigital(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateStudyStreak(sessions = []) {
  if (!sessions || sessions.length === 0) return 0;
  const activeDays = new Set(
    sessions.map(s => {
      const d = new Date(s.timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  let streak = 0;
  let checkDate = new Date();
  const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  if (!activeDays.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (activeDays.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getSevenDaysBreakdown(sessions = []) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const dayName = days[d.getDay()];
    const daySessions = sessions.filter(s => s.timestamp >= d.getTime() && s.timestamp < nextDay.getTime());
    const totalMinutes = Math.round(daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60);

    result.push({
      dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
      dayName: i === 0 ? 'اليوم' : dayName,
      minutes: totalMinutes,
      sessionsCount: daySessions.length
    });
  }

  return result;
}

export function getExamCountdown(targetDateString) {
  const target = new Date(targetDateString).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, isPast: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, isPast: false };
}

// GPA Point Matrix (4.0 Scale)
export const GRADE_POINTS_4 = {
  'A+': 4.0, 'A': 3.75, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
};

export function calculateGPA(subjects = []) {
  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach(s => {
    const credits = Number(s.creditHours) || 3;
    const grade = s.expectedGrade || 'A';
    const point = GRADE_POINTS_4[grade] ?? 3.5;

    totalPoints += point * credits;
    totalCredits += credits;
  });

  if (totalCredits === 0) return '0.00';
  return (totalPoints / totalCredits).toFixed(2);
}

// Export study sessions as Excel-friendly CSV with UTF-8 BOM
export function exportSessionsToCSV(sessions = []) {
  let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens Arabic correctly
  csvContent += 'المادة,المحاضرة,المدة (دقائق),النوع,الملاحظات والإنجاز,التاريخ والوقت\n';

  sessions.forEach(s => {
    const date = new Date(s.timestamp).toLocaleString('ar-EG');
    const mins = Math.round((s.durationSeconds || 0) / 60);
    const mode = s.mode === 'stopwatch' ? 'مؤقت مفتوح' : 'بومودورو';
    const note = (s.note || '').replace(/"/g, '""');

    csvContent += `"${s.subjectName || ''}","${s.lectureName || ''}",${mins},"${mode}","${note}","${date}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `live-study-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// Audio System: Chime, Mechanical Ticking, Ambient Noise
// ----------------------------------------------------------------------------
let ambientAudioNode = null;
let ambientAudioCtx = null;
let ambientGainNode = null;
let tickAudioCtx = null;

export function playTickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!tickAudioCtx) tickAudioCtx = new AudioContext();

    const now = tickAudioCtx.currentTime;
    const osc = tickAudioCtx.createOscillator();
    const gain = tickAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.04, now); // very subtle click
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(tickAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  } catch (e) {}
}

export function playChimeSound(type = 'bell') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    } else {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.25);
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.0);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function startAmbientSound(mode = 'rain', volume = 0.25) {
  stopAmbientSound();
  if (mode === 'none') return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    ambientAudioCtx = new AudioContext();

    if (mode === 'binaural') {
      const oscL = ambientAudioCtx.createOscillator();
      const oscR = ambientAudioCtx.createOscillator();
      const merger = ambientAudioCtx.createChannelMerger(2);
      ambientGainNode = ambientAudioCtx.createGain();

      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.value = 210;
      oscR.frequency.value = 220;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(ambientGainNode);
      ambientGainNode.gain.value = volume * 0.4;
      ambientGainNode.connect(ambientAudioCtx.destination);

      oscL.start();
      oscR.start();
      ambientAudioNode = { oscL, oscR };
      return;
    }

    const bufferSize = ambientAudioCtx.sampleRate * 2;
    const buffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.05;
    }

    const noiseSource = ambientAudioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ambientAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = mode === 'rain' ? 850 : mode === 'waves' ? 450 : 1300;

    ambientGainNode = ambientAudioCtx.createGain();
    ambientGainNode.gain.value = volume;

    noiseSource.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(ambientAudioCtx.destination);

    noiseSource.start();
    ambientAudioNode = { noiseSource, filter };
  } catch (e) {
    console.warn('Could not start ambient focus noise:', e);
  }
}

export function setAmbientVolume(vol) {
  if (ambientGainNode) {
    ambientGainNode.gain.value = Math.max(0, Math.min(1, vol));
  }
}

export function stopAmbientSound() {
  if (ambientAudioNode) {
    try {
      if (ambientAudioNode.noiseSource) ambientAudioNode.noiseSource.stop();
      if (ambientAudioNode.oscL) ambientAudioNode.oscL.stop();
      if (ambientAudioNode.oscR) ambientAudioNode.oscR.stop();
    } catch (e) {}
    ambientAudioNode = null;
  }
  if (ambientAudioCtx) {
    try {
      ambientAudioCtx.close();
    } catch (e) {}
    ambientAudioCtx = null;
  }
}
