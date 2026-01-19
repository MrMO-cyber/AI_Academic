
import React, { useState } from 'react';
import { StudyMaterial } from '../types';
import { Upload, FileText, Search, Trash2, ExternalLink, MessageCircle, ChevronLeft, Loader2, Sparkles, Send } from 'lucide-react';
import { summarizeMaterial, chatWithMaterial } from '../services/gemini';

interface MaterialHubProps {
  materials: StudyMaterial[];
  onMaterialsChange: (mats: StudyMaterial[]) => void;
  onDelete: (id: string) => void;
}

const MaterialHub: React.FC<MaterialHubProps> = ({ materials, onMaterialsChange, onDelete }) => {
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSummarizing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const summary = await summarizeMaterial(base64, file.name, file.type);
        
        const newMaterial: StudyMaterial = {
          id: `mat-${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          content: base64, // Now storing the actual base64 content
          summary,
          uploadDate: Date.now()
        };

        onMaterialsChange([newMaterial, ...materials]);
        setIsSummarizing(false);
        setActiveMaterial(newMaterial);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsSummarizing(false);
      alert("Error processing document.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeMaterial) return;

    const currentInput = inputMessage;
    const userMsg = { role: 'user' as const, text: currentInput };
    
    // Optimistically update UI
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatting(true);

    try {
      // Use the history BEFORE the current message for the API call
      // The API call implementation will combine them correctly
      const response = await chatWithMaterial(
        chatHistory, 
        currentInput, 
        activeMaterial.content, 
        activeMaterial.mimeType
      );
      
      setChatHistory(prev => [...prev, { role: 'model' as const, text: response }]);
    } catch (e) {
      console.error("Chat error:", e);
      setChatHistory(prev => [...prev, { role: 'model' as const, text: "Sorry, I encountered an error processing your request. Please check your connection and try again." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (activeMaterial) {
    return (
      <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveMaterial(null); setChatHistory([]); }} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <ChevronLeft size={20} />
            Back to Library
          </button>
          <div className="flex gap-2">
            <button onClick={() => { if(confirm("Delete this material?")) { onDelete(activeMaterial.id); setActiveMaterial(null); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left: Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-8 overflow-y-auto shadow-sm scrollbar-thin scrollbar-thumb-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
                <Sparkles size={14} />
                AI-Generated Executive Summary
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{activeMaterial.name}</h2>
            </div>

            <section className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Core Objectives
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {activeMaterial.summary?.objectives}
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Key Results & Findings
              </h3>
              <p className="text-slate-600 leading-relaxed bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                {activeMaterial.summary?.results}
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Brief Explanation
              </h3>
              <p className="text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-6 py-2 italic">
                {activeMaterial.summary?.explanation}
              </p>
            </section>
          </div>

          {/* Right: AI Chatbot */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl min-h-[500px]">
             <div className="p-6 border-b border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500 rounded-xl text-white">
                    <MessageCircle size={20} />
                 </div>
                 <div>
                   <h3 className="text-white font-bold">Ask Academia Bot</h3>
                   <p className="text-slate-500 text-xs">AI assistant for {activeMaterial.name}</p>
                 </div>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
               {chatHistory.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Sparkles size={32} className="text-slate-400" />
                   </div>
                   <h4 className="text-white font-semibold mb-2">Ask a question</h4>
                   <p className="text-xs text-slate-400">Example: "What are the main formulas?" or "Explain the conclusion."</p>
                 </div>
               )}
               {chatHistory.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                     msg.role === 'user' 
                       ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-900/20' 
                       : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-sm'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {isChatting && (
                 <div className="flex justify-start">
                   <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-2">
                     <Loader2 size={16} className="animate-spin text-indigo-400" />
                     <span className="text-xs text-slate-400">Thinking...</span>
                   </div>
                 </div>
               )}
             </div>

             <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Type your question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isChatting && handleSendMessage()}
                    disabled={isChatting}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isChatting}
                    className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Study Hub</h2>
          <p className="text-slate-500">Intelligent summarization and material storage.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <label className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" onChange={handleFileUpload} />
            <Upload size={18} />
            Sync Material
          </label>
        </div>
      </div>

      {isSummarizing && (
        <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white space-y-4 shadow-xl">
           <Loader2 className="animate-spin mx-auto" size={48} />
           <h3 className="text-xl font-bold">Generating AI Summary...</h3>
           <p className="text-indigo-100 max-w-md mx-auto">Gemini is analyzing your document to extract core objectives and key findings. This usually takes a few seconds.</p>
        </div>
      )}

      {materials.length === 0 && !isSummarizing ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <FileText size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No materials yet</h3>
          <p className="text-slate-400 max-w-xs mx-auto">Upload study PDFs or Images to get automated summaries and an interactive chat assistant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(mat => (
            <div 
              key={mat.id} 
              onClick={() => setActiveMaterial(mat)}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={28} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                   {new Date(mat.uploadDate).toLocaleDateString()}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 truncate pr-4">{mat.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                {mat.summary?.objectives || 'Analyzing document...'}
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs">
                  <MessageCircle size={14} />
                  AI Chat Active
                </div>
                <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">
                  <ExternalLink size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialHub;
