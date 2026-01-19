
export interface Lesson {
  id: string;
  subject: string;
  dayOfWeek: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  instructor?: string;
  isConflict?: boolean;
}

export interface StudyMaterial {
  id: string;
  name: string;
  mimeType: string;
  summary?: {
    objectives: string;
    results: string;
    explanation: string;
  };
  content: string; // Base64 content
  uploadDate: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AppView = 'dashboard' | 'calendar' | 'materials';
