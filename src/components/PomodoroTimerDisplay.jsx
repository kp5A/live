import React from 'react';
import { formatTimerDigital } from '../utils/storage';

export const TIMER_STYLES = [
  { id: 'ring', name: 'حلقة مضيئة' },
  { id: 'flip', name: 'ساعة استوديو' },
  { id: 'minimal', name: 'تركيز نقي' },
  { id: 'dial', name: 'كرونوغراف' },
  { id: 'hourglass', name: 'ساعة رملية' }
];

export default function PomodoroTimerDisplay({ 
  seconds, 
  initialSeconds, 
  isRunning, 
  isBreakTime, 
  timerStyle = 'ring', 
  onStyleChange,
  sessionMode 
}) {
  const isStopwatch = sessionMode === 'stopwatch';
  
  // Percent (0 to 100)
  const percent = isStopwatch 
    ? Math.min(100, (seconds % 3600) / 36)
    : initialSeconds > 0 
      ? Math.max(0, Math.min(100, ((initialSeconds - seconds) / initialSeconds) * 100))
      : 0;

  const digitalTime = formatTimerDigital(seconds);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const padM = String(minutes).padStart(2, '0');
  const padS = String(secs).padStart(2, '0');

  // SVG Ring calculation (Radius 88 -> Circumference = 2 * PI * 88 ~= 552.92)
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  // Active theme gradient colors
  const accentColor = isBreakTime ? '#F59E0B' : '#2563EB';
  const accentColorEnd = isBreakTime ? '#EF4444' : '#06B6D4';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 select-none w-full">
      {/* Sleek Style Switcher Buttons */}
      <div className="flex items-center flex-wrap justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-w-full">
        {TIMER_STYLES.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => onStyleChange(st.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timerStyle === st.id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-102'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {st.name}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. GLOW RING (حلقة مضيئة احترافية بتدرج ناعم ونبض هادئ) */}
      {/* ------------------------------------------------------------- */}
      {timerStyle === 'ring' && (
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle animated aura pulse when running */}
          {isRunning && (
            <div 
              className="absolute inset-4 rounded-full opacity-20 animate-pulse pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`
              }}
            />
          )}

          <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ringProgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accentColor} />
                <stop offset="100%" stopColor={accentColorEnd} />
              </linearGradient>
            </defs>

            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800/80"
              strokeWidth="10"
              fill="none"
            />

            {/* Progress track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#ringProgGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
              {isBreakTime ? 'وقت الاستراحة' : isStopwatch ? 'مؤقت مفتوح' : 'تركيز ومذاكرة'}
            </span>
            <div className="text-5xl sm:text-6xl font-black font-alexandria tracking-tight text-slate-900 dark:text-white tabular-nums drop-shadow-xs">
              {digitalTime}
            </div>
            <div className="mt-2.5 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {Math.round(percent)}%
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. STUDIO FLIP CLOCK (ساعة الاستوديو الرقمية الحديثة) */}
      {/* ------------------------------------------------------------- */}
      {timerStyle === 'flip' && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-5">
          {/* Flip cards container */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Minutes Card */}
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl border border-slate-800 relative overflow-hidden">
                {/* Horizontal split hairline */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-950/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] z-10" />
                {/* Top sheen */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="text-5xl sm:text-6xl font-black font-alexandria tracking-tight tabular-nums z-0">
                  {padM}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                الدقائق
              </span>
            </div>

            {/* Glowing Colon Separator */}
            <div className="flex flex-col gap-2.5 pb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'} transition-colors`} />
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'} transition-colors`} />
            </div>

            {/* Seconds Card */}
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl border border-slate-800 relative overflow-hidden">
                {/* Horizontal split hairline */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-950/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] z-10" />
                {/* Top sheen */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="text-5xl sm:text-6xl font-black font-alexandria tracking-tight tabular-nums z-0 text-blue-400">
                  {padS}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                الثواني
              </span>
            </div>
          </div>

          {/* Progress bar under flip clock */}
          <div className="w-full max-w-xs space-y-1.5">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isBreakTime ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>{isBreakTime ? 'استراحة' : 'جلسة مذاكرة'}</span>
              <span>{Math.round(percent)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. NORDIC MINIMAL ZEN (تركيز نقي بدون أي مشتتات) */}
      {/* ------------------------------------------------------------- */}
      {timerStyle === 'minimal' && (
        <div className="w-full max-w-md py-6 flex flex-col items-center justify-center space-y-5">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-alexandria tracking-tighter text-slate-900 dark:text-white tabular-nums select-none drop-shadow-xs">
            {digitalTime}
          </div>

          <div className="w-full max-w-xs space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isBreakTime ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
              <span>{isBreakTime ? 'وقت الراحة' : 'جلسة تركيز نقي'}</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{Math.round(percent)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CHRONOGRAPH DIAL (كرونوغراف دقيق بمؤشر دقائق وساعة سويسرية) */}
      {/* ------------------------------------------------------------- */}
      {timerStyle === 'dial' && (
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* SVG Precision Dial with 60 ticks */}
          <svg className="w-full h-full" viewBox="0 0 240 240">
            {/* Outer dial ring */}
            <circle cx="120" cy="120" r="110" className="stroke-slate-200 dark:stroke-slate-700/80" strokeWidth="2" fill="none" />
            
            {/* 60 Minute / Second Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const angle = (i * 6) * (Math.PI / 180);
              const rOuter = 106;
              const rInner = isMajor ? 94 : 100;
              const x1 = 120 + rOuter * Math.sin(angle);
              const y1 = 120 - rOuter * Math.cos(angle);
              const x2 = 120 + rInner * Math.sin(angle);
              const y2 = 120 - rInner * Math.cos(angle);

              const tickPercent = (i / 60) * 100;
              const isPassed = tickPercent <= percent;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isPassed ? (isBreakTime ? '#F59E0B' : '#2563EB') : 'currentColor'}
                  className={isPassed ? '' : 'text-slate-300 dark:text-slate-700'}
                  strokeWidth={isMajor ? 2.5 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Rotating indicator needle */}
            {(() => {
              const needleAngle = (percent / 100) * 360;
              const rad = (needleAngle * Math.PI) / 180;
              const nx = 120 + 85 * Math.sin(rad);
              const ny = 120 - 85 * Math.cos(rad);

              return (
                <g className="transition-all duration-300">
                  <line
                    x1="120"
                    y1="120"
                    x2={nx}
                    y2={ny}
                    stroke={isBreakTime ? '#EF4444' : '#2563EB'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  {/* Needle tip indicator */}
                  <circle cx={nx} cy={ny} r="4" fill={isBreakTime ? '#EF4444' : '#2563EB'} />
                </g>
              );
            })()}

            {/* Center Dial Hub */}
            <circle cx="120" cy="120" r="10" className="fill-slate-800 dark:fill-slate-200" />
            <circle cx="120" cy="120" r="5" className="fill-blue-500" />
          </svg>

          {/* Center Digital Display Hub */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="mt-14 px-3 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black font-alexandria text-slate-900 dark:text-white tabular-nums tracking-tight">
                {digitalTime}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              CHRONO DIAL
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. GEOMETRIC HOURGLASS (ساعة رملية هندسية عصرية بتدفق الرمل) */}
      {/* ------------------------------------------------------------- */}
      {timerStyle === 'hourglass' && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-4">
          <div className="relative w-36 h-48 flex items-center justify-center">
            {/* Geometric Hourglass SVG */}
            <svg className="w-full h-full drop-shadow-md" viewBox="0 0 120 160">
              <defs>
                <linearGradient id="sandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isBreakTime ? '#F59E0B' : '#3B82F6'} />
                  <stop offset="100%" stopColor={isBreakTime ? '#D97706' : '#1D4ED8'} />
                </linearGradient>
                <clipPath id="topBulb">
                  <polygon points="20,16 100,16 60,78" />
                </clipPath>
                <clipPath id="bottomBulb">
                  <polygon points="60,82 100,144 20,144" />
                </clipPath>
              </defs>

              {/* Hourglass Glass Silhouette */}
              <polygon 
                points="20,16 100,16 60,78 60,82 100,144 20,144 60,82 60,78" 
                className="fill-slate-100 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700" 
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Top Bulb Sand (Decreases as time elapses) */}
              {/* Remaining sand height from bottom of top bulb (y=78) upwards */}
              {(() => {
                const sandRemainFactor = Math.max(0, 1 - (percent / 100));
                const topSandY = 16 + (62 * (1 - sandRemainFactor));
                return (
                  <rect
                    x="20"
                    y={topSandY}
                    width="80"
                    height="70"
                    fill="url(#sandGrad)"
                    clipPath="url(#topBulb)"
                    className="transition-all duration-500 ease-out"
                  />
                );
              })()}

              {/* Center Falling Sand Stream (Active when running) */}
              {isRunning && (
                <line
                  x1="60"
                  y1="76"
                  x2="60"
                  y2="140"
                  stroke={isBreakTime ? '#F59E0B' : '#3B82F6'}
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
              )}

              {/* Bottom Bulb Sand (Accumulates as time passes) */}
              {(() => {
                const sandFilledFactor = percent / 100;
                const bottomSandY = 144 - (62 * sandFilledFactor);
                return (
                  <rect
                    x="20"
                    y={bottomSandY}
                    width="80"
                    height="70"
                    fill="url(#sandGrad)"
                    clipPath="url(#bottomBulb)"
                    className="transition-all duration-500 ease-out"
                  />
                );
              })()}

              {/* Wooden / Metallic Top & Bottom Stands */}
              <rect x="14" y="10" width="92" height="7" rx="3" className="fill-slate-700 dark:fill-slate-300" />
              <rect x="14" y="143" width="92" height="7" rx="3" className="fill-slate-700 dark:fill-slate-300" />
            </svg>
          </div>

          {/* Digital Time & Badge under hourglass */}
          <div className="text-center space-y-1">
            <div className="text-5xl sm:text-6xl font-black font-alexandria tracking-tight text-slate-900 dark:text-white tabular-nums">
              {digitalTime}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{isBreakTime ? 'استراحة' : 'جلسة تركيز'}</span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{Math.round(percent)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
