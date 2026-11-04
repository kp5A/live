import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/HomeView';
import StudyCenterView from './components/StudyCenterView';
import SubjectDetailView from './components/SubjectDetailView';
import LectureDetailView from './components/LectureDetailView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';
import PinLockScreen from './components/PinLockScreen';
import CommandPalette from './components/CommandPalette';
import GpaCalculatorView from './components/GpaCalculatorView';
import { FlashcardsView, HabitsView } from './components/SimpleExtraViews';
import { loadStudentData, saveStudentData, getSavedPinHash } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => loadStudentData());
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Study hierarchy state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Security Lock state
  const [hasPin, setHasPin] = useState(Boolean(getSavedPinHash()));
  const [isLocked, setIsLocked] = useState(Boolean(getSavedPinHash()));

  // Theme state: 'light' | 'midnight' | 'sepia' | 'forest'
  const rawTheme = data.settings?.theme || 'light';
  const theme = rawTheme === 'dark' ? 'midnight' : rawTheme;
  const isDark = theme === 'midnight' || theme === 'forest';

  // Apply theme attributes to documentElement and body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme, isDark]);

  // Auto-save changes
  const updateData = (newData) => {
    setData(newData);
    saveStudentData(newData);
  };

  const handleToggleTheme = () => {
    // Quick toggle between Light and Midnight dark mode
    const nextTheme = isDark ? 'light' : 'midnight';
    updateData({
      ...data,
      settings: {
        ...(data.settings || {}),
        theme: nextTheme
      }
    });
  };

  useEffect(() => {
    setHasPin(Boolean(getSavedPinHash()));
  }, []);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedLecture(null);
  };

  const handleSelectLecture = (lecture, subject) => {
    setSelectedSubject(subject);
    setSelectedLecture(lecture);
  };

  const handleBackToStudyList = () => {
    setSelectedSubject(null);
    setSelectedLecture(null);
  };

  const handleBackToSubject = () => {
    setSelectedLecture(null);
  };

  // Quick Resume from Home page
  const handleQuickResume = (subjectId, lectureId) => {
    const sub = (data.subjects || []).find(s => s.id === subjectId);
    if (sub) {
      const lec = (sub.lectures || []).find(l => l.id === lectureId);
      if (lec) {
        setSelectedSubject(sub);
        setSelectedLecture(lec);
        setActiveTab('study');
      }
    }
  };

  // Navigation from Global Search
  const handleCommandPaletteNavigate = (type, payload) => {
    if (type === 'subject') {
      setSelectedSubject(payload.subject);
      setSelectedLecture(null);
      setActiveTab('study');
    } else if (type === 'lecture') {
      setSelectedSubject(payload.subject);
      setSelectedLecture(payload.lecture);
      setActiveTab('study');
    }
  };

  if (isLocked) {
    return <PinLockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 transition-colors">
      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={setIsSearchOpen}
        data={data}
        onNavigate={handleCommandPaletteNavigate}
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'study') {
            setSelectedSubject(null);
            setSelectedLecture(null);
          }
        }} 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
        theme={theme}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:mr-64 min-w-0 transition-all duration-300">
        {/* Mobile & Top Header */}
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          isLocked={isLocked}
          onLockNow={() => setIsLocked(true)}
          hasPin={hasPin}
          theme={theme}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView 
              data={data} 
              updateData={updateData} 
              onNavigateToStudy={() => setActiveTab('study')} 
              onQuickResumeLecture={handleQuickResume}
            />
          )}

          {activeTab === 'study' && (
            <>
              {selectedLecture ? (
                <LectureDetailView 
                  lecture={selectedLecture} 
                  subject={selectedSubject} 
                  onBack={handleBackToSubject} 
                  data={data} 
                  updateData={updateData} 
                />
              ) : selectedSubject ? (
                <SubjectDetailView 
                  subject={selectedSubject} 
                  onBack={handleBackToStudyList} 
                  onSelectLecture={handleSelectLecture} 
                  data={data} 
                  updateData={updateData} 
                />
              ) : (
                <StudyCenterView 
                  data={data} 
                  updateData={updateData} 
                  onSelectSubject={handleSelectSubject} 
                />
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <StudyCenterView 
              data={data} 
              updateData={updateData} 
              onSelectSubject={handleSelectSubject} 
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView data={data} updateData={updateData} />
          )}

          {activeTab === 'habits' && (
            <HabitsView data={data} updateData={updateData} />
          )}

          {activeTab === 'gpa' && (
            <GpaCalculatorView data={data} updateData={updateData} />
          )}

          {activeTab === 'stats' && (
            <StatisticsView data={data} />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              data={data} 
              updateData={updateData} 
              hasPin={hasPin} 
              setHasPin={setHasPin}
              onLockApp={() => setIsLocked(true)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
