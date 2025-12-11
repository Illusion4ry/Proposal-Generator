
import React, { useState, useEffect } from 'react';
import { FirmData, ProposalContent, SavedProposal } from './types';
import InputWizard from './components/InputWizard';
import DocumentEditor from './components/DocumentEditor';
import HistoryModal from './components/HistoryModal';
import PromptModal from './components/PromptModal';
import { 
  getSavedProposals, 
  saveProposalToStorage, 
  deleteProposalFromStorage,
  getCustomPrompt,
  saveCustomPrompt 
} from './services/storageService';
import { generateProposal } from './services/geminiService';
import { Layout, Settings2, History, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'editor'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [firmData, setFirmData] = useState<FirmData | null>(null);
  const [proposalContent, setProposalContent] = useState<ProposalContent | null>(null);
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null);
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);

  // Prompt Configuration State
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);

  // Load shared cloud prompt on mount
  useEffect(() => {
    const loadSharedPrompt = async () => {
      try {
        const remotePrompt = await getCustomPrompt();
        if (remotePrompt) setCustomPrompt(remotePrompt);
      } catch (err) {
        console.error("Failed to load shared prompt configuration");
      }
    };
    loadSharedPrompt();
  }, []);

  const handleSavePrompt = async (newPrompt: string) => {
    setCustomPrompt(newPrompt); // Optimistic update
    try {
      await saveCustomPrompt(newPrompt);
    } catch (error) {
      alert("Failed to save shared prompt to cloud. Changes may not persist for other users.");
    }
  };

  // Load history from Cloud
  const handleOpenHistory = async () => {
    setShowHistory(true);
    setIsLoadingHistory(true);
    try {
      const proposals = await getSavedProposals();
      setSavedProposals(proposals);
    } catch (error) {
      console.error("Failed to load proposals", error);
      alert("Could not connect to proposal database.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectHistoryItem = (proposal: SavedProposal) => {
    setFirmData(proposal.firmData);
    setProposalContent(proposal.content);
    setCurrentProposalId(proposal.id);
    setShowHistory(false);
    setView('editor');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this saved proposal from the cloud?")) {
      setIsLoadingHistory(true); 
      try {
        await deleteProposalFromStorage(id);
        // Refresh list
        const updated = await getSavedProposals();
        setSavedProposals(updated);
      } catch (e) {
        alert("Failed to delete proposal.");
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  const handleGenerate = async (data: FirmData) => {
    setIsGenerating(true);
    setFirmData(data);
    
    try {
      // Pass the custom prompt if it exists, otherwise undefined (which defaults to standard in service)
      const content = await generateProposal(data, customPrompt || undefined);
      setProposalContent(content);
      setCurrentProposalId(null); // Reset ID for new generation
      setView('editor');
    } catch (error) {
      alert("Failed to generate the proposal. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProposal = async (updatedContent: ProposalContent) => {
    if (!firmData) return;

    const timestamp = Date.now();
    const id = currentProposalId || `prop_${timestamp}`;
    
    const proposalToSave: SavedProposal = {
      id,
      createdAt: currentProposalId ? (savedProposals.find(p => p.id === id)?.createdAt || timestamp) : timestamp,
      lastModified: timestamp,
      firmData: firmData,
      content: updatedContent
    };

    try {
      await saveProposalToStorage(proposalToSave);
      setCurrentProposalId(id); // Ensure future saves update this record
      alert("Proposal saved to cloud successfully.");
    } catch (e) {
      alert("Failed to save proposal to cloud.");
    }
  };

  const handleBack = () => {
    setView('input');
  };

  const handleNewProposal = () => {
    setFirmData(null);
    setProposalContent(null);
    setCurrentProposalId(null);
    setView('input');
  };

  return (
    <div className="min-h-screen font-sans">
      <HistoryModal 
        isOpen={showHistory}
        isLoading={isLoadingHistory}
        onClose={() => setShowHistory(false)}
        proposals={savedProposals}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />

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
            <p className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
               Cloud Sync Active • Team Collaboration Mode
            </p>
            
            <div className="flex justify-center gap-3 mt-6">
              <button 
                onClick={() => setShowPromptSettings(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-full text-sm font-semibold hover:bg-taxdome-blue hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm border border-gray-200"
              >
                <Settings2 size={16} /> Customize Prompt
              </button>
              <button 
                onClick={handleOpenHistory}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-full text-sm font-semibold hover:bg-taxdome-blue hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm border border-gray-200"
              >
                <History size={16} /> History
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
          onSave={handleSaveProposal}
        />
      )}
    </div>
  );
};

export default App;
