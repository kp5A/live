import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  Trash2, 
  Volume2, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  HardDrive,
  Target,
  Palette,
  Sparkles
} from 'lucide-react';
import { 
  setSecurityPin, 
  verifySecurityPin, 
  playChimeSound, 
  getStorageUsageKB 
} from '../utils/storage';

export const SYSTEM_THEMES = [
  {
    id: 'light',
    name: 'فاتح عصري',
    nameEn: 'Modern Light',
    desc: 'خلفية نقية وكروت بيضاء كلاسيكية مريحة',
    previewBg: '#F8FAFC',
    previewCard: '#FFFFFF',
    previewBorder: '#E2E8F0',
    previewText: '#0F172A',
    previewDesc: '#64748B',
    previewAccent: '#22C55E'
  },
  {
    id: 'midnight',
    name: 'سواد الليل الفاخر (OLED)',
    nameEn: 'Midnight Dark',
    desc: 'سواد ليلي عميق مريح للعين مع أزرق نيون هادئ',
    previewBg: '#0B0F17',
    previewCard: '#111827',
    previewBorder: '#1F2937',
    previewText: '#F8FAFC',
    previewDesc: '#94A3B8',
    previewAccent: '#3B82F6'
  },
  {
    id: 'sepia',
    name: 'الورق الدافئ (Sepia)',
    nameEn: 'Warm Sepia',
    desc: 'درجات ورق الكتب والروايات الكلاسيكية',
    previewBg: '#F5EFE6',
    previewCard: '#FAF6F0',
    previewBorder: '#E6DCB8',
    previewText: '#2D241E',
    previewDesc: '#786551',
    previewAccent: '#D97706'
  },
  {
    id: 'forest',
    name: 'غابة الزمرد (Forest)',
    nameEn: 'Emerald Forest',
    desc: 'درجات زمردية هادئة تحفز التركيز والاسترخاء',
    previewBg: '#061410',
    previewCard: '#0B211B',
    previewBorder: '#16382E',
    previewText: '#ECFDF5',
    previewDesc: '#6EE7B7',
    previewAccent: '#10B981'
  }
];

export default function SettingsView({ 
  data, 
  updateData, 
  hasPin, 
  setHasPin, 
  onLockApp 
}) {
  const currentThemeId = data.settings?.theme || 'light';

  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState({ text: '', type: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const importFileRef = useRef(null);
  const storageUsage = getStorageUsageKB();

  // Change Theme
  const handleSelectTheme = (themeId) => {
    updateData({
      ...data,
      settings: {
        ...(data.settings || {}),
        theme: themeId
      }
    });
  };

  // Setup / Update PIN
  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinMessage({ text: 'يجب أن يتكون رمز المرور من 4 أرقام على الأقل', type: 'error' });
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinMessage({ text: 'رمز المرور غير متطابق', type: 'error' });
      return;
    }

    if (hasPin) {
      const isOldCorrect = await verifySecurityPin(oldPinInput);
      if (!isOldCorrect) {
        setPinMessage({ text: 'رمز المرور القديم غير صحيح', type: 'error' });
        return;
      }
    }

    await setSecurityPin(pinInput);
    setHasPin(true);
    setPinInput('');
    setConfirmPinInput('');
    setOldPinInput('');
    setPinMessage({ text: 'تم تفعيل رمز قفل الأمان بنجاح! 🔒', type: 'success' });
  };

  // Remove PIN
  const handleRemovePin = async () => {
    if (!oldPinInput) {
      setPinMessage({ text: 'يرجى إدخال رمز المرور الحالي لإلغاء القفل', type: 'error' });
      return;
    }
    const isCorrect = await verifySecurityPin(oldPinInput);
    if (!isCorrect) {
      setPinMessage({ text: 'رمز المرور غير صحيح', type: 'error' });
      return;
    }

    await setSecurityPin(null);
    setHasPin(false);
    setOldPinInput('');
    setPinMessage({ text: 'تم إلغاء رمز المرور بنجاح', type: 'success' });
  };

  // Change Daily Study Goal
  const handleDailyGoalChange = (minutes) => {
    updateData({
      ...data,
      dailyGoalMinutes: minutes
    });
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `live-study-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.subjects || parsed.tasks)) {
          updateData(parsed);
          alert('تم استيراد النسخة الاحتياطية بنجاح!');
        } else {
          alert('ملف النسخة الاحتياطية غير صالح.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف. تأكد أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          الإعدادات والأمان
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          إدارة الثيمات الأربعة، الخصوصية العالية، رمز القفل، والنسخ الاحتياطي
        </p>
      </div>

      {/* SECTION: 4 THEMES PICKER (ثيمات الموقع الـ 4) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            مظهر الموقع (4 ثيمات متكاملة)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          اختر الثيم الأنسب لراحتك البصرية أثناء المذاكرة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {SYSTEM_THEMES.map((th) => {
            const isSelected = currentThemeId === th.id;

            return (
              <div
                key={th.id}
                onClick={() => handleSelectTheme(th.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                  isSelected 
                    ? 'border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                style={{ backgroundColor: th.previewCard }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10" 
                      style={{ backgroundColor: th.previewAccent }}
                    />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {th.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>مفعل</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {th.desc}
                </p>

                {/* Theme Palette Preview Swatch */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: th.previewBg }} title="الخلفية" />
                  <div className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: th.previewCard }} title="البطاقات" />
                  <div className="w-6 h-6 rounded-lg shadow-2xs" style={{ backgroundColor: th.previewAccent }} title="التمييز" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Status Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
            أعلى معايير الخصوصية: حفظ محلي 100%
          </h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            جميع بياناتك وموادك ومحاضراتك وملاحظاتك وأوقات المذاكرة محفوظة بالكامل داخل المتصفح على جهازك فقط. لا يتم إرسال أي معلومة لأي خادم خارجي على الإطلاق.
          </p>
        </div>
      </div>

      {/* Daily Goal Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            الهدف الدراسي اليومي
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          حدد عدد الساعات التي ترغب في مذاكرتها يومياً لتتبع تقدمك في الصفحة الرئيسية:
        </p>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {[60, 90, 120, 180, 240, 300].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleDailyGoalChange(mins)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                (data.dailyGoalMinutes || 120) === mins
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
              }`}
            >
              {mins / 60} ساعات ({mins} دقيقة)
            </button>
          ))}
        </div>
      </div>

      {/* PIN Security Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              قفل الأمان برمز مرور (PIN Lock)
            </h2>
          </div>
          {hasPin && (
            <button
              onClick={onLockApp}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm"
            >
              قفل الشاشة الآن 🔒
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك تعيين رمز سري مكون من 4 أرقام لمنع أي شخص يستخدم جهازك من الاطلاع على مذاكرتك وملاحظاتك الخاصة.
        </p>

        {pinMessage.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${
            pinMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {pinMessage.text}
          </div>
        )}

        <form onSubmit={handleSetPin} className="space-y-3 max-w-sm">
          {hasPin && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                رمز المرور الحالي
              </label>
              <input
                type="password"
                maxLength={6}
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                placeholder="****"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              {hasPin ? 'رمز المرور الجديد' : 'تعيين رمز مرور جديد'}
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="مثال: 1234"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              تأكيد رمز المرور
            </label>
            <input
              type="password"
              maxLength={6}
              value={confirmPinInput}
              onChange={(e) => setConfirmPinInput(e.target.value)}
              placeholder="أعد إدخال الرمز"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-colors"
            >
              {hasPin ? 'تحديث رمز المرور' : 'تفعيل القفل السري'}
            </button>

            {hasPin && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors"
              >
                إلغاء القفل
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Local Storage Space Meter & Backup */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>النسخ الاحتياطي ومساحة التخزين</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span>المساحة المستخدمة: {storageUsage} KB</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك تنزيل نسخة احتياطية كاملة من جميع موادك وملاحظاتك لاستعادتها على أي جهاز آخر في أي وقت.
        </p>

        <input
          type="file"
          ref={importFileRef}
          onChange={handleImportBackup}
          accept=".json"
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <button
            onClick={() => importFileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد نسخة سابقة</span>
          </button>
        </div>
      </div>

      {/* Audio alerts test */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-500" />
              <span>أصوات منبه البومودورو وجلسات المذاكرة</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              أصوات هادئة ونقية تم توليدها محلياً بالكامل عبر تقنية Web Audio API.
            </p>
          </div>
          <button
            onClick={() => playChimeSound('bell')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-semibold text-xs transition-colors"
          >
            تجربة الرنين 🔔
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl p-6 border border-rose-200 dark:border-rose-900 space-y-3">
        <h2 className="text-base font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>منطقة الخطر: حذف كافة البيانات</span>
        </h2>
        <p className="text-xs text-rose-700 dark:text-rose-400">
          سيؤدي هذا إلى مسح كافة المواد والمحاضرات والملاحظات المخزنة محلياً على هذا الجهاز والبدء من الصفر.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح جميع البيانات المحلية</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-300">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">هل أنت متأكد تماماً؟ لا يمكن التراجع!</span>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
            >
              نعم، امسح كل شيء
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
