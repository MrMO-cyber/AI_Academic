
import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Lesson } from '../types';
import { parseScheduleFromPDF } from '../services/gemini';

interface ScheduleParserProps {
  onParsed: (lessons: Lesson[]) => void;
}

const ScheduleParser: React.FC<ScheduleParserProps> = ({ onParsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [draftLessons, setDraftLessons] = useState<Lesson[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const lessons = await parseScheduleFromPDF(base64);
        setDraftLessons(lessons);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("Error parsing schedule. Please try again.");
    }
  };

  const confirmSchedule = () => {
    onParsed(draftLessons);
    setDraftLessons([]);
    setFileName(null);
  };

  const updateDraftLesson = (id: string, field: keyof Lesson, value: any) => {
    setDraftLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-lg mb-1">Upload Schedule</h3>
        <p className="text-xs text-slate-500">Supported format: PDF</p>
      </div>

      <div className="p-6">
        {!draftLessons.length && !isUploading && (
          <label className="group block border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer text-center">
            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
            <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all">
              <Upload size={24} />
            </div>
            <p className="font-semibold text-slate-700">Drop PDF schedule here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse files</p>
          </label>
        )}

        {isUploading && (
          <div className="py-12 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
            <p className="font-semibold text-slate-700">Analyzing Schedule...</p>
            <p className="text-xs text-slate-400 mt-1">Extracting classes via Gemini AI</p>
          </div>
        )}

        {draftLessons.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl text-sm font-semibold">
              <FileText size={16} />
              {fileName}
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {draftLessons.map((lesson) => (
                <div key={lesson.id} className={`p-3 rounded-xl border ${lesson.isConflict ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-white shadow-sm'}`}>
                  <input 
                    className="w-full font-bold text-sm bg-transparent focus:outline-none mb-1" 
                    value={lesson.subject} 
                    onChange={(e) => updateDraftLesson(lesson.id, 'subject', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <select 
                      className="text-xs bg-slate-100 p-1 rounded focus:outline-none"
                      value={lesson.dayOfWeek}
                      onChange={(e) => updateDraftLesson(lesson.id, 'dayOfWeek', e.target.value)}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="text-xs bg-slate-100 p-1 rounded focus:outline-none" 
                      value={lesson.startTime}
                      onChange={(e) => updateDraftLesson(lesson.id, 'startTime', e.target.value)}
                    />
                  </div>
                  {lesson.isConflict && (
                    <div className="flex items-center gap-1 text-red-600 text-[10px] mt-2 font-bold uppercase tracking-wider">
                      <AlertCircle size={10} />
                      Conflict Detected
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setDraftLessons([])}
                className="flex-1 py-2 text-slate-500 text-sm font-semibold hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSchedule}
                className="flex-[2] py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700"
              >
                <CheckCircle2 size={16} />
                Save Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleParser;
