
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, BookOpen, LayoutDashboard, Bell, Trash2, FilePlus, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { AppView, Lesson, StudyMaterial } from './types';
import ScheduleParser from './components/ScheduleParser';
import CalendarView from './components/Calendar';
import MaterialHub from './components/MaterialHub';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [schedule, setSchedule] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('academia_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('academia_materials');
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem('academia_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('academia_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }

    const interval = setInterval(() => {
      checkAlerts();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [schedule]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const checkAlerts = () => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    schedule.forEach(lesson => {
      if (lesson.dayOfWeek === currentDay) {
        const [lHour, lMin] = lesson.startTime.split(':').map(Number);
        const lessonDate = new Date();
        lessonDate.setHours(lHour, lMin, 0, 0);
        
        const diffMinutes = Math.floor((lessonDate.getTime() - now.getTime()) / 60000);

        if (diffMinutes === 15) {
          new Notification(`Upcoming Class: ${lesson.subject}`, {
            body: `Starting in 15 mins at ${lesson.location}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/3589/3589030.png'
          });
        }
      }
    });
  };

  const handleClearSchedule = () => {
    if (confirm("Are you sure you want to clear your entire schedule?")) {
      setSchedule([]);
    }
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            AcademiaSmart
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'calendar' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar size={20} />
            My Calendar
          </button>
          <button 
            onClick={() => setCurrentView('materials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'materials' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen size={20} />
            Study Materials
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          {!notificationsEnabled && (
            <button 
              onClick={requestNotificationPermission}
              className="w-full flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 text-sm rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Bell size={16} />
              Enable Alerts
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold capitalize text-slate-800">
            {currentView === 'dashboard' ? 'Welcome Back!' : currentView.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
               <Bell size={18} />
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              JD
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Actions & Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                  <h2 className="text-3xl font-bold mb-2">Academic Hub</h2>
                  <p className="opacity-90 mb-6">Your AI-powered study companion is ready. Upload your schedule or materials to begin.</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setCurrentView('calendar')}
                      className="px-6 py-2 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                      <FilePlus size={18} />
                      Sync Schedule
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Calendar size={24} />
                      </div>
                      <ChevronRight className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Calendar</h3>
                    <p className="text-slate-500 text-sm mb-4">{schedule.length} active classes tracked.</p>
                    <button onClick={() => setCurrentView('calendar')} className="text-indigo-600 font-semibold text-sm">View Schedule</button>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                        <BookOpen size={24} />
                      </div>
                      <ChevronRight className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Materials</h3>
                    <p className="text-slate-500 text-sm mb-4">{materials.length} summarized documents.</p>
                    <button onClick={() => setCurrentView('materials')} className="text-indigo-600 font-semibold text-sm">Open Hub</button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Upcoming Next</h3>
                      <button className="text-indigo-600 text-sm font-semibold">Refresh</button>
                   </div>
                   <div className="space-y-4">
                     {schedule.slice(0, 3).map(lesson => (
                       <div key={lesson.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-indigo-600 border border-slate-100">
                             {lesson.dayOfWeek.substring(0, 3)}
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-800">{lesson.subject}</h4>
                             <p className="text-sm text-slate-500">{lesson.startTime} - {lesson.endTime} • {lesson.location}</p>
                           </div>
                         </div>
                         {lesson.isConflict && (
                           <div className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                             <AlertCircle size={14} />
                             Conflict
                           </div>
                         )}
                       </div>
                     ))}
                     {schedule.length === 0 && (
                       <div className="text-center py-10 text-slate-400">
                         <p>No classes scheduled yet.</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              {/* Right Column: Mini Material List */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <h3 className="font-bold text-lg mb-4">Recent Materials</h3>
                  <div className="space-y-3">
                    {materials.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <BookOpen size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-semibold text-sm truncate">{m.name}</h4>
                          <p className="text-xs text-slate-400">{new Date(m.uploadDate).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors" size={16} />
                      </div>
                    ))}
                    {materials.length === 0 && (
                       <div className="text-center py-8 text-slate-400 italic text-sm">
                        Sync your first document
                       </div>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                   <div className="relative z-10">
                     <h3 className="font-bold text-lg mb-2">Smart Reminders</h3>
                     <p className="text-indigo-100 text-sm mb-4">You'll receive push notifications 15 minutes before every lecture.</p>
                     <div className="flex items-center gap-2 bg-indigo-500/30 p-2 rounded-xl border border-white/10">
                       <Bell size={16} />
                       <span className="text-xs font-medium">Automatic Alert System Active</span>
                     </div>
                   </div>
                   <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Class Schedule</h2>
                  <p className="text-slate-500">Manage your weekly academic sessions.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleClearSchedule}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 font-medium"
                  >
                    <Trash2 size={18} />
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1">
                  <ScheduleParser onParsed={(newLessons) => setSchedule(prev => [...prev, ...newLessons])} />
                </div>
                <div className="xl:col-span-3">
                  <CalendarView lessons={schedule} />
                </div>
              </div>
            </div>
          )}

          {currentView === 'materials' && (
            <MaterialHub materials={materials} onMaterialsChange={setMaterials} onDelete={deleteMaterial} />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-50">
        <button onClick={() => setCurrentView('dashboard')} className={`p-2 rounded-xl ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setCurrentView('calendar')} className={`p-2 rounded-xl ${currentView === 'calendar' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
          <Calendar size={24} />
        </button>
        <button onClick={() => setCurrentView('materials')} className={`p-2 rounded-xl ${currentView === 'materials' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
          <BookOpen size={24} />
        </button>
      </nav>
    </div>
  );
};

export default App;
