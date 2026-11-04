import React, { useState, useRef, useEffect } from 'react';
import { 
  Link2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Trash2, 
  ExternalLink, 
  Highlighter, 
  Printer, 
  Save, 
  Check, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Heading1, 
  Heading2, 
  Grid, 
  Columns, 
  AlignRight, 
  CheckSquare 
} from 'lucide-react';

export const PAPER_STYLES = [
  { id: 'ruled', label: 'مسطر عريض', icon: '📝' },
  { id: 'college', label: 'مسطر جامعي', icon: '📄' },
  { id: 'grid', label: 'شبكة مربعات', icon: '📐' },
  { id: 'dotted', label: 'نقاط (بوليت)', icon: '⁝' },
  { id: 'blank', label: 'أبيض سادة', icon: '⬜' }
];

export default function A4LinedNote({ 
  note, 
  onUpdateContent, 
  onDeleteNote, 
  lectureTitle 
}) {
  const editorRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [savedRange, setSavedRange] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(note.paperStyle || 'ruled');
  const [noteTitle, setNoteTitle] = useState(note.title || 'صفحة ملاحظات');

  // Load content safely
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (note.content || '')) {
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = note.content || '<p>ابدأ بكتابة الملاحظات والأفكار هنا...</p>';
      }
    }
  }, []);

  // Handle typing & autosave
  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onUpdateContent(note.id, {
      content: html,
      title: noteTitle,
      paperStyle: currentStyle
    });
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
  };

  const handleTitleChange = (newTitle) => {
    setNoteTitle(newTitle);
    if (!editorRef.current) return;
    onUpdateContent(note.id, {
      content: editorRef.current.innerHTML,
      title: newTitle,
      paperStyle: currentStyle
    });
  };

  const handleStyleChange = (styleId) => {
    setCurrentStyle(styleId);
    if (!editorRef.current) return;
    onUpdateContent(note.id, {
      content: editorRef.current.innerHTML,
      title: noteTitle,
      paperStyle: styleId
    });
  };

  // Format commands
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Open Link Modal with saved selection
  const handleOpenLinkModal = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
      setLinkText(selection.toString());
    } else {
      setSavedRange(null);
      setLinkText('');
    }
    setLinkUrl('https://');
    setShowLinkModal(true);
  };

  // Insert Link safely
  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let validUrl = linkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const textToDisplay = linkText.trim() || validUrl;

    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    const anchorHtml = `<a href="${validUrl}" target="_blank" rel="noopener noreferrer" title="${validUrl}">${textToDisplay} ↗</a>&nbsp;`;
    document.execCommand('insertHTML', false, anchorHtml);

    handleInput();
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handlePrint = () => {
    window.print();
  };

  const paperBgColor = note.color || '#FFFFFF';
  const isDarkPaper = paperBgColor === '#1E293B';

  return (
    <div className={`relative my-6 print:m-0 transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-8 bg-slate-900/80 backdrop-blur-md overflow-y-auto' : ''
    }`}>
      <div className={`max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-300 bg-white ${
        isFullscreen ? 'my-4' : ''
      }`}>
        {/* Paper Top Title & Style Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100/90 border-b border-slate-200 print:hidden text-xs">
          {/* Note Title Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="عنوان صفحة الملاحظات..."
              className="bg-transparent font-bold text-sm text-slate-800 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-blue-500 w-full"
            />
          </div>

          {/* Paper Style Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {PAPER_STYLES.map(style => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleChange(style.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  currentStyle === style.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={style.label}
              >
                <span>{style.icon}</span>
                <span className="hidden sm:inline">{style.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs"
              title={isFullscreen ? 'الخروج من الشاشة الكاملة' : 'وضع ملء الشاشة للتركيز'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 shadow-2xs"
              title="طباعة أو حفظ PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDeleteNote(note.id)}
              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs"
              title="حذف هذه الصفحة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 border-b border-slate-200 print:hidden text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-black shadow-2xs"
              title="عنوان رئيسي (H1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold shadow-2xs"
              title="عنوان فرعي (H2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<p>')}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-600 shadow-2xs text-[11px]"
              title="فقرة عادية"
            >
              عادي
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 shadow-2xs font-black"
              title="غامق (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 shadow-2xs italic font-serif"
              title="مائل (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 shadow-2xs"
              title="قائمة نقطية"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 shadow-2xs"
              title="قائمة رقمية"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCommand('hiliteColor', '#fef08a')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-600 shadow-2xs flex items-center gap-1"
              title="تظليل باللون الأصفر"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>

            {/* ADD LINK BUTTON */}
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold shadow-2xs transition-colors"
              title="إضافة رابط قابل للنقر في الملاحظة"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>إضافة رابط 🔗</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            {savedIndicator ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <Check className="w-3.5 h-3.5" />
                تم الحفظ محلياً
              </span>
            ) : (
              <span className="text-slate-400">حفظ تلقائي فوري</span>
            )}
          </div>
        </div>

        {/* Insert Link Dialog Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <form 
              onSubmit={handleInsertLink}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span>إدراج رابط في صفحة الملاحظات</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowLinkModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الرابط (ما يظهر على الصفحة)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="مثال: موقع الجامعة أو مقال الشرح"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عنوان الرابط (URL)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-left focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow"
                >
                  إدراج الرابط الآن
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Authentic A4 Ruled Notebook Paper Container */}
        <div 
          style={{ '--sheet-bg': paperBgColor }}
          className={`a4-lined-sheet p-8 sm:p-14 transition-all relative overflow-hidden ${
            isDarkPaper ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {/* Notebook Header Stamp */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10 text-[11px] text-slate-400 font-alexandria print:hidden">
            <span className="font-bold tracking-wider">{noteTitle || 'A4 LINED NOTEBOOK'}</span>
            <span>{lectureTitle}</span>
          </div>

          {/* The actual styled editable writing area */}
          <div 
            className={`paper-style-${currentStyle} pt-2 pl-4 pr-12`}
          >
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              suppressContentEditableWarning
              className="a4-editor-content focus:outline-none font-sans text-sm md:text-base leading-relaxed"
              style={{ 
                color: isDarkPaper ? '#F8FAFC' : '#1E293B',
                direction: 'rtl'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
