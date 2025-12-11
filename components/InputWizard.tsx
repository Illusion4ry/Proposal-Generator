
import React, { useState, useEffect } from 'react';
import { FirmData, PlanType, FEATURE_CATEGORIES, ONBOARDING_PACKAGES, AccountExecutive } from '../types';
import { getAccountExecutives, saveAccountExecutives } from '../services/storageService';
import { Loader2, ArrowRight, Check, Sparkles, Building, Users, FileText, AlertCircle, Rocket, Globe, UserCheck, Mail, Plus, Trash2, X, ChevronDown, Cloud } from 'lucide-react';

interface Props {
  onSubmit: (data: FirmData) => void;
  isGenerating: boolean;
  initialData?: FirmData | null;
}

const DEFAULT_AE: AccountExecutive = {
  id: 'default_ae',
  name: 'Edgar Espinoza',
  email: 'edgar@taxdome.com'
};

const InputWizard: React.FC<Props> = ({ onSubmit, isGenerating, initialData }) => {
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(FEATURE_CATEGORIES)[0]);
  
  // Account Executive State
  const [availableAes, setAvailableAes] = useState<AccountExecutive[]>([]);
  const [isLoadingAes, setIsLoadingAes] = useState(true);
  const [showAeModal, setShowAeModal] = useState(false);
  const [newAeName, setNewAeName] = useState('');
  const [newAeEmail, setNewAeEmail] = useState('');
  const [aeToDelete, setAeToDelete] = useState<string | null>(null);

  const [data, setData] = useState<FirmData>(initialData || {
    firmName: '',
    contactName: '',
    firmSize: 1,
    language: 'English',
    selectedPlan: PlanType.PRO,
    selectedOnboarding: ONBOARDING_PACKAGES[0],
    features: [],
    transcript: '',
    additionalContext: '',
    accountExecutive: DEFAULT_AE
  });

  // Load AEs from storage service (Cloud/Local)
  useEffect(() => {
    const loadAes = async () => {
      setIsLoadingAes(true);
      try {
        const aes = await getAccountExecutives();
        if (aes && aes.length > 0) {
          setAvailableAes(aes);
          // If no AE selected yet, pick first one
          if (data.accountExecutive.id === DEFAULT_AE.id && !initialData) {
              setData(prev => ({ ...prev, accountExecutive: aes[0] }));
          }
        } else {
          // Initialize with default if empty
          const initial = [DEFAULT_AE];
          setAvailableAes(initial);
          await saveAccountExecutives(initial);
          setData(prev => ({ ...prev, accountExecutive: initial[0] }));
        }
      } catch (e) {
        console.error("Error loading AEs", e);
        setAvailableAes([DEFAULT_AE]);
      } finally {
        setIsLoadingAes(false);
      }
    };
    
    loadAes();
  }, []); // Run once on mount

  // Reset or load data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        language: initialData.language || 'English',
        accountExecutive: initialData.accountExecutive || DEFAULT_AE
      });
      setStep(1); 
    }
  }, [initialData]);

  // Auto-switch away from Essentials if user count increases
  useEffect(() => {
    if (data.firmSize > 1 && data.selectedPlan === PlanType.ESSENTIALS) {
      setData(prev => ({ ...prev, selectedPlan: PlanType.PRO }));
    }
  }, [data.firmSize, data.selectedPlan]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleFeature = (feat: string) => {
    setData(prev => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter(f => f !== feat)
        : [...prev.features, feat]
    }));
  };

  const handleAddAe = async () => {
    if (!newAeName || !newAeEmail) return;
    const newAe: AccountExecutive = {
      id: `ae_${Date.now()}`,
      name: newAeName,
      email: newAeEmail
    };
    const updated = [...availableAes, newAe];
    setAvailableAes(updated); // Optimistic update
    
    // Save to cloud/storage
    await saveAccountExecutives(updated);

    setData(prev => ({ ...prev, accountExecutive: newAe }));
    setNewAeName('');
    setNewAeEmail('');
    // Keep inputs clear but allow user to add more or close manually
  };

  const handleRemoveAe = (id: string) => {
    if (availableAes.length <= 1) {
      alert("You must have at least one Account Executive.");
      return;
    }
    setAeToDelete(id);
  };

  const confirmDeleteAe = async () => {
    if (!aeToDelete) return;
    const updated = availableAes.filter(ae => ae.id !== aeToDelete);
    setAvailableAes(updated); // Optimistic update
    
    // Save to cloud/storage
    await saveAccountExecutives(updated);
    
    // If we deleted the currently selected one, select the first available
    if (data.accountExecutive.id === aeToDelete) {
      setData(prev => ({ ...prev, accountExecutive: updated[0] }));
    }
    setAeToDelete(null);
  };
  
  const handleQuickTest = () => {
    const sampleData: FirmData = {
      firmName: 'Summit Tax & Accounting',
      contactName: 'David Williams',
      firmSize: 5,
      language: 'English',
      selectedPlan: PlanType.BUSINESS,
      selectedOnboarding: ONBOARDING_PACKAGES[1], // Guided
      features: [
        "Workflow Automation",
        "Client Portal",
        "Unlimited e-Signatures",
        "CRM",
        "Auto-reminders"
      ],
      transcript: "We are spending too much time chasing clients for documents. We need a system that sends automatic reminders. We also want a secure portal for clients to upload files.",
      additionalContext: "Client values time-saving automation above all else.",
      accountExecutive: availableAes[0] || DEFAULT_AE
    };
    onSubmit(sampleData);
  };

  const isStep1Valid = data.firmName && data.contactName && data.firmSize > 0 && data.accountExecutive;
  const isStep2Valid = data.features.length > 0;
  
  // Total steps reduced to 3
  const TOTAL_STEPS = 3;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 relative">
      
      {/* Delete Confirmation Modal */}
      {aeToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setAeToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                   <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Team Member?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-gray-800">{availableAes.find(a => a.id === aeToDelete)?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setAeToDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteAe}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                  >
                    Remove
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* AE Manager Modal */}
      {showAeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowAeModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 Manage Account Executives 
                 <Cloud size={16} className="text-taxdome-blue" />
              </h3>
              <button onClick={() => setShowAeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow mb-6 pr-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Team Members</h4>
              <div className="space-y-2">
                {availableAes.map(ae => (
                  <div key={ae.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{ae.name}</div>
                      <div className="text-xs text-gray-500">{ae.email}</div>
                    </div>
                    {availableAes.length > 1 && (
                      <button 
                        onClick={() => handleRemoveAe(ae.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 bg-white flex-shrink-0">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add New Member</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={newAeName}
                    onChange={e => setNewAeName(e.target.value)}
                    placeholder="e.g. Sarah Smith"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={newAeEmail}
                    onChange={e => setNewAeEmail(e.target.value)}
                    placeholder="e.g. sarah@taxdome.com"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button 
                  onClick={handleAddAe}
                  disabled={!newAeName || !newAeEmail}
                  className="w-full py-3 bg-taxdome-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8 flex justify-between items-center relative max-w-xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              step >= s ? 'bg-taxdome-blue text-white shadow-lg scale-110' : 'bg-white text-gray-400 border border-gray-200'
            }`}
          >
            {step > s ? <Check size={20} /> : s}
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-xl min-h-[550px] flex flex-col justify-between transition-all duration-500 relative overflow-hidden">
        
        {/* Loading Overlay */}
        {isGenerating && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center border border-gray-100 transform animate-in zoom-in-95 duration-300">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-blue-50 p-4 rounded-full text-taxdome-blue">
                            <Loader2 size={40} className="animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Proposal</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        AI is analyzing your requirements and fetching real-time pricing from taxdome.com...
                    </p>
                </div>
            </div>
        )}

        <div>
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Firm & Plan Details</h2>
                <p className="text-gray-500">Configure the basics for the quote.</p>
              </div>

              <div className="space-y-5 max-w-2xl mx-auto">
                
                {/* Language Selection */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Proposal Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['English', 'Spanish'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setData({...data, language: lang as 'English' | 'Spanish'})}
                        className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          data.language === lang 
                          ? 'bg-taxdome-blue text-white border-taxdome-blue shadow-md' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                         <Globe size={16} /> {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Firm Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Acme Accounting"
                        value={data.firmName}
                        onChange={e => setData({...data, firmName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Client Contact</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all"
                        placeholder="e.g. John Doe"
                        value={data.contactName}
                        onChange={e => setData({...data, contactName: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Number of Users</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all"
                      value={data.firmSize}
                      onChange={e => setData({...data, firmSize: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div className="group relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">TaxDome Plan</label>
                    <div className="relative">
                       <select
                        value={data.selectedPlan}
                        onChange={e => setData({...data, selectedPlan: e.target.value as PlanType})}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                       >
                         {Object.values(PlanType).map((plan) => (
                           <option 
                            key={plan} 
                            value={plan} 
                            disabled={plan === PlanType.ESSENTIALS && data.firmSize > 1}
                           >
                             {plan} {plan === PlanType.ESSENTIALS && data.firmSize > 1 ? '(Solo only)' : ''}
                           </option>
                         ))}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <ChevronDown size={16} />
                       </div>
                    </div>
                     {data.firmSize > 1 && data.selectedPlan === PlanType.ESSENTIALS && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Auto-switched to Pro (Essentials is solo only)
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1 flex justify-between items-center">
                    <span>Account Executive</span>
                    <button 
                      onClick={() => setShowAeModal(true)}
                      className="text-taxdome-blue text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Manage Team
                    </button>
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      value={data.accountExecutive?.id}
                      onChange={e => {
                        const selected = availableAes.find(ae => ae.id === e.target.value);
                        if (selected) setData({...data, accountExecutive: selected});
                      }}
                      disabled={isLoadingAes}
                      className="w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {availableAes.map(ae => (
                        <option key={ae.id} value={ae.id}>
                          {ae.name}
                        </option>
                      ))}
                    </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                         {isLoadingAes ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                     </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-6">
               <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Needs & Context</h2>
                <p className="text-gray-500">Select major features and provide context.</p>
              </div>

              {/* Feature Selection Tabs */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(FEATURE_CATEGORIES).map(cat => {
                    const count = FEATURE_CATEGORIES[cat as keyof typeof FEATURE_CATEGORIES].filter(f => data.features.includes(f)).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                          activeCategory === cat
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {cat}
                        {count > 0 && (
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                             activeCategory === cat ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1 bg-gray-50/50 rounded-2xl min-h-[160px] content-start">
                   {FEATURE_CATEGORIES[activeCategory as keyof typeof FEATURE_CATEGORIES].map(feat => (
                     <button
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all text-left flex items-start justify-between border group ${
                          data.features.includes(feat)
                            ? 'bg-blue-50/50 border-blue-200 text-taxdome-blue'
                            : 'bg-white border-transparent hover:border-gray-200 text-gray-600 shadow-sm'
                        }`}
                     >
                       <span className="leading-snug">{feat}</span>
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                         data.features.includes(feat) ? 'bg-taxdome-blue border-taxdome-blue' : 'border-gray-300 bg-white'
                       }`}>
                          {data.features.includes(feat) && <Check size={10} className="text-white" />}
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1 flex items-center gap-2">
                      <FileText size={16} /> Call Transcript
                    </label>
                    <textarea
                      className="w-full p-4 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all h-[120px] text-sm resize-none"
                      placeholder="Paste discovery call transcript here..."
                      value={data.transcript}
                      onChange={e => setData({...data, transcript: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1 flex items-center gap-2">
                       <Mail size={16} /> Executive Context (Private)
                    </label>
                    <textarea
                      className="w-full p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all h-[120px] text-sm resize-none"
                      placeholder="Enter specific notes for the AI (e.g. 'Emphasize time savings', 'Client is price sensitive', etc.)"
                      value={data.additionalContext}
                      onChange={e => setData({...data, additionalContext: e.target.value})}
                    />
                  </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Onboarding & Implementation</h2>
                <p className="text-gray-500">Select the level of support needed to get them up and running.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ONBOARDING_PACKAGES.map((pkg) => (
                   <button
                    key={pkg.id}
                    onClick={() => setData({...data, selectedOnboarding: pkg})}
                    className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col h-full relative ${
                      data.selectedOnboarding.id === pkg.id
                        ? 'bg-blue-50 border-taxdome-blue shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                   >
                     <div className="flex justify-between items-start mb-3 w-full">
                        <div className={`p-2 rounded-lg ${data.selectedOnboarding.id === pkg.id ? 'bg-white text-taxdome-blue' : 'bg-gray-100 text-gray-500'}`}>
                           <Rocket size={20} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          data.selectedOnboarding.id === pkg.id ? 'border-taxdome-blue' : 'border-gray-300'
                        }`}>
                          {data.selectedOnboarding.id === pkg.id && <div className="w-2.5 h-2.5 rounded-full bg-taxdome-blue" />}
                        </div>
                     </div>
                     
                     <div className="mb-4">
                       <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                       <div className="text-2xl font-bold text-taxdome-blue mt-1">{pkg.priceDisplay}</div>
                       <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Ideal for: {pkg.idealFor}</div>
                     </div>

                     <ul className="space-y-2 mt-auto">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                     </ul>
                   </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleQuickTest}
              disabled={isGenerating}
              type="button"
              className="px-5 py-2.5 rounded-xl text-gray-400 font-medium hover:text-taxdome-blue hover:bg-blue-50 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate a sample proposal with dummy data"
            >
              <Sparkles size={16} /> Quick Demo
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => onSubmit(data)}
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl bg-taxdome-blue text-white font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Generating Proposal...
                </>
              ) : (
                <>
                  Generate Proposal <Sparkles size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputWizard;
