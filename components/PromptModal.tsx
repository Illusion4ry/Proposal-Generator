import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Code } from 'lucide-react';
import { DEFAULT_PROMPT_TEMPLATE } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string | null;
  onSave: (newPrompt: string) => void;
}

const PromptModal: React.FC<Props> = ({ isOpen, onClose, currentPrompt, onSave }) => {
  const [promptText, setPromptText] = useState(DEFAULT_PROMPT_TEMPLATE);

  useEffect(() => {
    if (isOpen) {
      setPromptText(currentPrompt || DEFAULT_PROMPT_TEMPLATE);
    }
  }, [isOpen, currentPrompt]);

  const handleReset = () => {
    if (confirm("Reset prompt to original default?")) {
      setPromptText(DEFAULT_PROMPT_TEMPLATE);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Code size={20} className="text-taxdome-blue" /> AI Prompt Configuration
            </h2>
            <p className="text-sm text-gray-500">Edit the background instructions used by Gemini.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow p-0 relative bg-gray-50">
          <div className="absolute inset-0 flex flex-col">
            <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 text-xs text-blue-700 flex flex-wrap gap-4 font-mono">
               <span>Available Variables:</span>
               <span className="bg-white px-1.5 rounded border border-blue-200">{`{{firmName}}`}</span>
               <span className="bg-white px-1.5 rounded border border-blue-200">{`{{firmSize}}`}</span>
               <span className="bg-white px-1.5 rounded border border-blue-200">{`{{selectedPlan}}`}</span>
               <span className="bg-white px-1.5 rounded border border-blue-200">{`{{transcript}}`}</span>
               <span className="bg-white px-1.5 rounded border border-blue-200">{`{{language}}`}</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="flex-grow w-full p-6 font-mono text-sm leading-relaxed outline-none resize-none bg-white text-gray-800"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <RotateCcw size={16} /> Reset to Default
          </button>
          <div className="flex gap-3">
             <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
             >
               Cancel
             </button>
             <button
              onClick={() => { onSave(promptText); onClose(); }}
              className="flex items-center gap-2 px-6 py-2 bg-taxdome-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg shadow-blue-500/20"
             >
               <Save size={18} /> Save Configuration
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;