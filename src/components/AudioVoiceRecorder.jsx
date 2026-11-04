import React, { useState, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Volume2, 
  Radio, 
  Plus, 
  AlertCircle 
} from 'lucide-react';

export default function AudioVoiceRecorder({ 
  recordings = [], 
  onSaveRecording, 
  onDeleteRecording 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceTitle, setVoiceTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result;
          const newRecording = {
            id: 'rec-' + Date.now(),
            title: voiceTitle.trim() || `ملاحظة صوتية ${recordings.length + 1}`,
            dataUrl: base64Data,
            durationSeconds: recordingSeconds,
            createdAt: Date.now()
          };
          onSaveRecording(newRecording);
          setVoiceTitle('');
          setRecordingSeconds(0);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setErrorMsg('تعذر الوصول إلى الميكروفون. يرجى منح إذن استخدام الميكروفون للمتصفح.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatSecs = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">
            الملاحظات الصوتية للمحاضرة (Voice Memos) 🎙️
          </h3>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
          {recordings.length} تسجيلات
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recording Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRecording ? (
            <input
              type="text"
              value={voiceTitle}
              onChange={(e) => setVoiceTitle(e.target.value)}
              placeholder="عنوان التسجيل (مثال: شرح المسألة 2)..."
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 w-full sm:w-60"
            />
          ) : (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm animate-pulse">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>جارِ التسجيل الآن: {formatSecs(recordingSeconds)}</span>
            </div>
          )}
        </div>

        <div>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-102"
            >
              <Mic className="w-4 h-4" />
              <span>ابدأ تسجيل صوتي</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all animate-bounce"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>إيقاف وحفظ التسجيل</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio Recordings List */}
      {recordings.length > 0 ? (
        <div className="space-y-2.5">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  {rec.title}
                </h4>
                <span className="text-[10px] text-slate-400">
                  المدة: {formatSecs(rec.durationSeconds || 0)} • {new Date(rec.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <audio
                  controls
                  src={rec.dataUrl}
                  className="h-8 max-w-[240px] rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => onDeleteRecording(rec.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="حذف التسجيل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-2">
          لا توجد تسجيلات صوتية لهذه المحاضرة بعد.
        </p>
      )}
    </div>
  );
}
