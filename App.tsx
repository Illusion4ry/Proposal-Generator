
import React, { useState, useEffect } from 'react';
import { FirmData, ProposalContent } from './types';
import InputWizard from './components/InputWizard';
import DocumentEditor from './components/DocumentEditor';
import PromptModal from './components/PromptModal';
import { 
  getCustomPrompt,
  saveCustomPrompt 
} from './services/storageService';
import { generateProposal } from './services/geminiService';
import { Layout, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'editor'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [firmData, setFirmData] = useState<FirmData | null>(null);
  const [proposalContent, setProposalContent] = useState<ProposalContent | null>(null);

  // Prompt Configuration State
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);

  // Load custom prompt on mount
  useEffect(() => {
    const loadSharedPrompt = async () => {
      try {
        const localPrompt = await getCustomPrompt();
        if (localPrompt) setCustomPrompt(localPrompt);
      } catch (err) {
        console.error("Failed to load prompt configuration");
      }
    };
    loadSharedPrompt();
  }, []);

  const handleSavePrompt = async (newPrompt: string) => {
    setCustomPrompt(newPrompt); // Optimistic update
    try {
      await saveCustomPrompt(newPrompt);
    } catch (error) {
      alert("Failed to save prompt configuration locally.");
    }
  };

  const handleGenerate = async (data: FirmData) => {
    setIsGenerating(true);
    setFirmData(data);
    
    try {
      // Pass the custom prompt if it exists, otherwise undefined (which defaults to standard in service)
      const content = await generateProposal(data, customPrompt || undefined);
      setProposalContent(content);
      setView('editor');
    } catch (error) {
      alert("Failed to generate the proposal. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setView('input');
  };

  const handleNewProposal = () => {
    setFirmData(null);
    setProposalContent(null);
    setView('input');
  };

  return (
    <div className="min-h-screen font-sans">
      <PromptModal
        isOpen={showPromptSettings}
        onClose={() => setShowPromptSettings(false)}
        currentPrompt={customPrompt}
        onSave={handleSavePrompt}
      />

      {view === 'input' ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center py-12 px-4 relative overflow-hidden">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <header className="mb-8 text-center relative z-10">
            <div className="bg-white p-3 rounded-2xl shadow-sm inline-flex mb-4">
               <Layout className="text-taxdome-blue" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Proposal Generator</h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto mb-2">
              Create world-class TaxDome proposals in seconds using AI.
            </p>
            
            <div className="flex justify-center gap-3 mt-6">
              <button 
                onClick={() => setShowPromptSettings(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-full text-sm font-semibold hover:bg-taxdome-blue hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm border border-gray-200"
              >
                <Settings2 size={16} /> Customize Prompt
              </button>
            </div>
          </header>

          <main className="w-full relative z-10">
            <InputWizard 
              onSubmit={handleGenerate} 
              isGenerating={isGenerating} 
              initialData={firmData}
            />
          </main>
          
          <footer className="mt-12 text-sm text-gray-400">
            Powered by Gemini AI • TaxDome Sales Enablement
          </footer>
        </div>
      ) : (
        <DocumentEditor 
          firmData={firmData!} 
          content={proposalContent!} 
          onBack={handleBack}
          onNew={handleNewProposal}
        />
      )}
    </div>
  );
};

export default App;
