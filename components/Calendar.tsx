
import React from 'react';
import { Lesson } from '../types';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';

interface CalendarViewProps {
  lessons: Lesson[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

const CalendarView: React.FC<CalendarViewProps> = ({ lessons }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="grid grid-cols-7 border-b border-slate-100">
        <div className="p-4 border-r border-slate-100"></div>
        {DAYS.map(day => (
          <div key={day} className="p-4 text-center font-bold text-slate-700 text-sm border-r border-slate-100 bg-slate-50/30 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="relative overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-slate-200">
        <div className="grid grid-cols-7 relative">
          {/* Hour labels */}
          <div className="col-span-1">
            {HOURS.map(hour => (
              <div key={hour} className="h-20 border-b border-r border-slate-50 p-2 text-[10px] text-slate-400 font-medium">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="col-span-1 relative h-full border-r border-slate-50 last:border-r-0">
              {lessons
                .filter(l => l.dayOfWeek === day)
                .map(lesson => {
                  const [startH, startM] = lesson.startTime.split(':').map(Number);
                  const [endH, endM] = lesson.endTime.split(':').map(Number);
                  const top = (startH - 8) * 80 + (startM / 60) * 80;
                  const height = ((endH - startH) * 80) + ((endM - startM) / 60) * 80;

                  return (
                    <div 
                      key={lesson.id}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={`absolute left-1 right-1 rounded-xl p-2 text-[10px] overflow-hidden group transition-all hover:z-10 hover:shadow-lg ${
                        lesson.isConflict 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                      }`}
                    >
                      <div className="font-bold truncate mb-0.5">{lesson.subject}</div>
                      <div className="flex items-center gap-1 opacity-80 mb-0.5">
                        <Clock size={10} />
                        {lesson.startTime}
                      </div>
                      <div className="flex items-center gap-1 opacity-80">
                        <MapPin size={10} />
                        {lesson.location || 'N/A'}
                      </div>
                      {lesson.isConflict && (
                        <div className="absolute top-1 right-1 text-red-500">
                          <AlertTriangle size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              
              {HOURS.map(hour => (
                <div key={`${day}-${hour}`} className="h-20 border-b border-slate-50"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
