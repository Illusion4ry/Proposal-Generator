import React, { useState } from 'react';
import { FirmData, ProposalContent } from './types';
import InputWizard from './components/InputWizard';
import DocumentEditor from './components/DocumentEditor';
import { generateProposal } from './services/geminiService';
import { Layout } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'editor'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [firmData, setFirmData] = useState<FirmData | null>(null);
  const [proposalContent, setProposalContent] = useState<ProposalContent | null>(null);

  const handleGenerate = async (data: FirmData) => {
    setIsGenerating(true);
    setFirmData(data);
    
    try {
      const content = await generateProposal(data);
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
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              Create world-class TaxDome proposals in seconds using AI.
            </p>
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