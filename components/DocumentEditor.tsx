import React, { useRef, useState, useEffect } from 'react';
import { FirmData, ProposalContent } from '../types';
import { Download, Printer, ArrowLeft, Edit3, CheckCircle, Check, Loader2, Plus, Trash2, Globe, Rocket, Info, PlusCircle, Save, Cloud } from 'lucide-react';

interface Props {
  firmData: FirmData;
  content: ProposalContent;
  onBack: () => void;
  onNew: () => void;
  onSave: (content: ProposalContent) => Promise<void>;
}

// Editable Text Component that updates parent state
const EditableText: React.FC<{ 
  value: string; 
  tag: React.ElementType; 
  className?: string;
  multiline?: boolean;
  onUpdate: (val: string) => void;
  placeholder?: string;
}> = ({ value, tag: Tag, className, onUpdate, placeholder }) => {
  const contentRef = useRef<HTMLElement>(null);

  const handleBlur = () => {
    if (contentRef.current) {
      onUpdate(contentRef.current.innerHTML);
    }
  };

  return (
    <Tag
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-2 focus:ring-taxdome-blue/20 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
      data-placeholder={placeholder}
    />
  );
};

const DocumentEditor: React.FC<Props> = ({ firmData, content, onBack, onNew, onSave }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalContent>(content);
  // Default expiration date: Today + 7 days
  const [expirationDate, setExpirationDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync prop changes if they occur (rare in this flow, but good practice)
  useEffect(() => {
    setProposalData(content);
  }, [content]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(proposalData);
    setIsSaving(false);
  };

  const handleDownload = async () => {
    if (!containerRef.current || typeof window === 'undefined') return;
    
    // @ts-ignore
    if (!window.html2pdf) {
      alert("PDF generator is loading... please try again in a moment.");
      return;
    }

    setIsDownloading(true);

    // Wait for state update to remove gaps/shadows before capturing
    setTimeout(async () => {
      const element = containerRef.current;
      const opt = {
        margin: 0,
        filename: `${firmData.firmName.replace(/\s+/g, '_')}_TaxDome_Proposal.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, // Maximum quality
        html2canvas: { 
          scale: 2, // A bit lower scale than 3 to prevent huge files, usually sufficient for screen -> pdf
          useCORS: true, 
          letterRendering: true, 
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
      } catch (e) {
        console.error("PDF Generation Error", e);
        alert("Error generating PDF.");
      } finally {
        setIsDownloading(false);
      }
    }, 500); 
  };

  // Helper to update deeply nested state
  const updateContent = (section: 'executiveSummary' | 'quote', field: string, value: any) => {
    setProposalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateOnboarding = (field: string, value: any) => {
    setProposalData(prev => ({
      ...prev,
      quote: {
        ...prev.quote,
        onboarding: {
          ...prev.quote.onboarding,
          [field]: value
        }
      }
    }));
  };

  // Array helpers
  const addItem = (section: 'executiveSummary' | 'quote', listName: 'keyBenefits' | 'featuresList') => {
    const currentList = proposalData[section][listName] as string[];
    updateContent(section, listName, [...currentList, "New item - click to edit"]);
  };

  const removeItem = (section: 'executiveSummary' | 'quote', listName: 'keyBenefits' | 'featuresList', index: number) => {
    const currentList = proposalData[section][listName] as string[];
    const newList = [...currentList];
    newList.splice(index, 1);
    updateContent(section, listName, newList);
  };

  const updateItem = (section: 'executiveSummary' | 'quote', listName: 'keyBenefits' | 'featuresList', index: number, value: string) => {
    const currentList = proposalData[section][listName] as string[];
    const newList = [...currentList];
    newList[index] = value;
    updateContent(section, listName, newList);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 pb-20 font-sans print:bg-white print:pb-0 print:h-auto print:overflow-visible">
      {/* Toolbar */}
      <div className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 no-print shadow-sm ${isDownloading ? 'hidden' : ''}`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              title="Edit Proposal Details"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-semibold text-gray-900">Proposal Editor</h1>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
              <Edit3 size={12} /> Live Editing
            </span>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:text-taxdome-blue hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all font-medium text-sm mr-2 disabled:opacity-70 disabled:cursor-wait"
            >
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
               {isSaving ? "Saving..." : "Save"}
            </button>
             <button 
              onClick={onNew}
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-taxdome-blue hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm mr-2"
            >
              <PlusCircle size={16} /> New
            </button>
             <button 
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <Printer size={16} /> Print
            </button>
             <button 
              onClick={handleDownload}
              type="button"
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-taxdome-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-70 disabled:cursor-wait shadow-md shadow-blue-500/20"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div 
        ref={containerRef} 
        className={`print-container items-center mx-auto transition-all ${isDownloading ? 'pdf-mode block' : 'flex flex-col gap-8 max-w-[210mm] print:block print:max-w-none'}`}
      >
        
        {/* PAGE 1: Executive Summary */}
        <div className={`print-page w-full bg-white relative overflow-hidden flex flex-col ${isDownloading ? '' : 'shadow-2xl min-h-[297mm] print:shadow-none'}`}>
            
            {/* TaxDome Brand Header */}
            <div className="bg-taxdome-dark text-white page-padding py-12 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-taxdome-blue opacity-10 rounded-bl-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="text-5xl font-extrabold text-white mb-6 tracking-tight">TaxDome</div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Proposal for {firmData.firmName}</h1>
                        <p className="text-gray-400 text-lg font-light">Prepared for {firmData.contactName}</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-4">
                           <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Date</div>
                           <div className="font-medium">{new Date().toLocaleDateString()}</div>
                        </div>
                        <div>
                           <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Valid Until</div>
                           <EditableText 
                              tag="div" 
                              value={expirationDate} 
                              onUpdate={(val) => setExpirationDate(val)}
                              className="font-medium"
                           />
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-padding pt-12 flex-grow">
                {/* Executive Summary Content */}
                <div className="prose prose-lg max-w-none">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                      <div className="w-1 h-8 bg-taxdome-blue rounded-full"></div>
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider m-0">Executive Summary</h2>
                    </div>
                    
                    <EditableText 
                        tag="h3" 
                        value={proposalData.executiveSummary.title}
                        onUpdate={(val) => updateContent('executiveSummary', 'title', val)}
                        className="text-3xl font-bold text-gray-900 mb-8 font-sans leading-tight"
                    />
                    
                    <div className="text-gray-600 leading-relaxed space-y-6 mb-12 text-[1.05rem]">
                       <EditableText 
                            tag="div" 
                            value={proposalData.executiveSummary.body} 
                            onUpdate={(val) => updateContent('executiveSummary', 'body', val)}
                            multiline
                        />
                    </div>

                    <div className="bg-taxdome-light rounded-2xl p-8 border border-blue-50 avoid-break">
                        <h3 className="text-taxdome-dark font-bold mb-6 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-taxdome-blue">
                              <Globe size={20} />
                            </div>
                            Key Strategic Benefits
                        </h3>
                        <ul className="space-y-4">
                            {proposalData.executiveSummary.keyBenefits.map((benefit, i) => (
                                <li key={i} className="group flex items-start gap-4 relative pl-2">
                                    <div className="w-2 h-2 rounded-full bg-taxdome-blue mt-2.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <EditableText 
                                            tag="span" 
                                            value={benefit} 
                                            onUpdate={(val) => updateItem('executiveSummary', 'keyBenefits', i, val)}
                                            className="text-gray-700 block"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeItem('executiveSummary', 'keyBenefits', i)}
                                        className={`absolute -right-8 top-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all no-print ${isDownloading ? 'hidden' : ''}`}
                                        title="Remove item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => addItem('executiveSummary', 'keyBenefits')}
                            className={`mt-6 flex items-center gap-2 text-sm font-medium text-taxdome-blue hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors no-print ${isDownloading ? 'hidden' : ''}`}
                        >
                            <Plus size={16} /> Add Benefit
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Footer Page 1 */}
            <div className="page-padding py-8 mt-auto border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>TaxDome Proposal</span>
                <span>{new Date().getFullYear()}</span>
            </div>
        </div>

        {/* PAGE 2: Quote */}
        <div className={`print-page w-full bg-white relative overflow-visible flex flex-col ${isDownloading ? '' : 'shadow-2xl min-h-[297mm] print:shadow-none'}`}>
            
             {/* Header */}
             <div className="bg-gray-50 page-padding py-10 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                 <span className="text-2xl font-bold text-gray-400 tracking-tight">TaxDome</span>
                <div className="text-xl font-bold text-gray-900">Investment Quote</div>
            </div>

            {/* Content Body */}
            <div className="page-padding py-10 flex-grow">
                <div className="grid grid-cols-1 gap-8">
                    
                    {/* Plan Card */}
                    <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-lg shadow-gray-100/50 avoid-break">
                        <div className="bg-taxdome-dark text-white p-6 flex justify-between items-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
                            <h2 className="text-2xl font-bold relative z-10">{proposalData.quote.planName}</h2>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold relative z-10">Subscription</span>
                        </div>
                        <div className="p-8 bg-white">
                            <div className="flex items-baseline mb-3">
                                <EditableText 
                                    tag="span" 
                                    value={proposalData.quote.pricePerUser} 
                                    onUpdate={(val) => updateContent('quote', 'pricePerUser', val)}
                                    className="text-4xl font-bold text-taxdome-blue tracking-tight"
                                />
                                <span className="text-gray-500 ml-2 text-lg font-medium">/ user / year</span>
                            </div>
                            <EditableText 
                                tag="p" 
                                value={proposalData.quote.billingFrequency} 
                                onUpdate={(val) => updateContent('quote', 'billingFrequency', val)}
                                className="text-gray-400 text-sm font-medium mb-8 uppercase tracking-wide"
                            />
                            
                            <div className="border-t border-gray-100 pt-6">
                                 <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest text-gray-400">Plan Inclusions</h4>
                                 <ul className="grid grid-cols-1 gap-3">
                                    {proposalData.quote.featuresList.map((feat, i) => (
                                        <li key={i} className="group flex items-center gap-3 relative">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Check size={12} className="text-green-600" />
                                            </div>
                                            <div className="flex-grow text-sm">
                                                <EditableText 
                                                    tag="span" 
                                                    value={feat} 
                                                    onUpdate={(val) => updateItem('quote', 'featuresList', i, val)}
                                                    className="text-gray-700"
                                                />
                                            </div>
                                             <button 
                                                onClick={() => removeItem('quote', 'featuresList', i)}
                                                className={`absolute -right-8 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all no-print ${isDownloading ? 'hidden' : ''}`}
                                                title="Remove item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </li>
                                    ))}
                                 </ul>
                                  <button 
                                    onClick={() => addItem('quote', 'featuresList')}
                                    className={`mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-taxdome-blue hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors no-print ${isDownloading ? 'hidden' : ''}`}
                                >
                                    <Plus size={14} /> Add Feature
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Onboarding Card */}
                    <div className="border border-blue-100 bg-blue-50/30 rounded-3xl p-6 flex justify-between items-center relative avoid-break">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-taxdome-blue flex items-center justify-center">
                                <Rocket size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                                    <EditableText 
                                        tag="span" 
                                        value={proposalData.quote.onboarding.name} 
                                        onUpdate={(val) => updateOnboarding('name', val)}
                                    />
                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wide">Implementation</span>
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1 mt-2">
                                     {proposalData.quote.onboarding.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                            <EditableText 
                                                tag="span" 
                                                value={f} 
                                                onUpdate={(val) => {
                                                    const newFeat = [...proposalData.quote.onboarding.features];
                                                    newFeat[i] = val;
                                                    updateOnboarding('features', newFeat);
                                                }}
                                            />
                                        </li>
                                     ))}
                                </ul>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-400 uppercase font-bold mb-1">One-time Fee</div>
                             <EditableText 
                                tag="span" 
                                value={proposalData.quote.onboarding.price} 
                                onUpdate={(val) => updateOnboarding('price', val)}
                                className="text-2xl font-bold text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Total Calculation */}
                    <div className="bg-taxdome-light rounded-2xl p-8 border border-blue-100/50 avoid-break">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Investment Summary</h3>
                        
                        <div className="flex justify-between items-center mb-3 text-gray-600 text-sm">
                            <span>Annual Software ({firmData.firmSize} users)</span>
                            <EditableText 
                                tag="span" 
                                value={proposalData.quote.softwareTotal || '$0'} 
                                onUpdate={(val) => updateContent('quote', 'softwareTotal', val)}
                                className="font-medium"
                            />
                        </div>
                        
                        <div className="flex justify-between items-center mb-6 text-gray-600 text-sm">
                            <span>Implementation & Onboarding</span>
                             <span className="font-medium">{proposalData.quote.onboarding.price}</span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                             <div>
                                <div className="text-sm text-gray-500">Estimated First Year Total</div>
                                <div className="text-xs text-gray-400 font-light">Includes recurring + one-time fees</div>
                             </div>
                            <EditableText 
                                tag="span" 
                                value={proposalData.quote.totalAnnualCost} 
                                onUpdate={(val) => updateContent('quote', 'totalAnnualCost', val)}
                                className="text-4xl font-bold text-taxdome-blue"
                            />
                        </div>
                    </div>

                    {/* Closing & Signature - ALL IN ONE BLOCK TO AVOID SPLITTING */}
                     <div className="mt-8 text-center avoid-break">
                        <EditableText 
                            tag="p" 
                            value={proposalData.quote.closingStatement} 
                            onUpdate={(val) => updateContent('quote', 'closingStatement', val)}
                            className="text-lg font-medium text-gray-600 italic max-w-2xl mx-auto"
                        />
                        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between px-12 opacity-60">
                            <div className="text-center group cursor-pointer">
                                <div className="h-12 border-b border-gray-300 w-48 mb-2 group-hover:border-gray-400 transition-colors"></div>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Signature</span>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="h-12 border-b border-gray-300 w-48 mb-2 group-hover:border-gray-400 transition-colors"></div>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Date</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

             {/* Footer Page 2 - Using natural flow (mt-auto) so it follows content */}
            <div className="page-padding py-8 mt-auto border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>TaxDome Proposal</span>
                <span>{new Date().getFullYear()}</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentEditor;