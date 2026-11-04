import React, { useState } from 'react';
import { Lock, BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
import { verifySecurityPin } from '../utils/storage';

export default function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await verifySecurityPin(pin);
    if (isValid) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyClick = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112239] text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-xs w-full text-center space-y-6 animate-in fade-in zoom-in-95">
        {/* Brand */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <BookOpen className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black font-alexandria tracking-wider">Live</h1>
          <p className="text-xs text-slate-300">مساعد الطالب الذكي • قفل الأمان</p>
        </div>

        {/* Lock Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
            <Lock className="w-4 h-4" />
            <span>أدخل رمز المرور السري</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-3 py-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > i 
                    ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400/50' 
                    : 'border-slate-500'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold animate-bounce">
              رمز المرور غير صحيح. حاول مجدداً!
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyClick(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold font-alexandria transition-all border border-slate-700/50 text-white"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-sm font-semibold transition-all flex items-center justify-center"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick(0)}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold font-alexandria transition-all border border-slate-700/50 text-white"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length < 4}
            className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center"
          >
            دخول
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>حماية محلية كاملة 100%</span>
        </div>
      </div>
    </div>
  );
}
