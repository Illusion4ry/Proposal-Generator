import React, { useState, useEffect } from 'react';
import { FirmData, PlanType, FEATURE_CATEGORIES, ONBOARDING_PACKAGES } from '../types';
import { Loader2, ArrowRight, Check, Sparkles, Building, Users, FileText, AlertCircle, Shield, Zap, Briefcase, Star, LayoutGrid, MessageSquare, PlusCircle, Rocket, History, Globe, Settings2 } from 'lucide-react';

interface Props {
  onSubmit: (data: FirmData) => void;
  isGenerating: boolean;
  initialData?: FirmData | null;
  onOpenHistory: () => void;
  onOpenPromptSettings: () => void;
}

const InputWizard: React.FC<Props> = ({ onSubmit, isGenerating, initialData, onOpenHistory, onOpenPromptSettings }) => {
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(FEATURE_CATEGORIES)[0]);
  
  const [data, setData] = useState<FirmData>(initialData || {
    firmName: '',
    contactName: '',
    firmSize: 1,
    language: 'English',
    selectedPlan: PlanType.PRO,
    selectedOnboarding: ONBOARDING_PACKAGES[0],
    features: [],
    transcript: '',
    additionalContext: ''
  });

  // Reset or load data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        language: initialData.language || 'English' // Default to English for old saves
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

  const isStep1Valid = data.firmName && data.contactName && data.firmSize > 0;
  const isStep2Valid = data.features.length > 0;

  const PLAN_DETAILS = [
    {
      id: PlanType.ESSENTIALS,
      icon: Zap,
      label: "Essentials",
      price: "$800",
      description: "Core tools to manage daily tasks & clients. Unlimited CRM, portal, storage & e-signatures.",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      activeBorder: "border-gray-600",
      disabled: data.firmSize > 1
    },
    {
      id: PlanType.PRO,
      icon: LayoutGrid,
      label: "Pro",
      price: "$1000",
      description: "Better visibility & seamless collaboration. Includes workflow automation, API & IRS integrations.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeBorder: "border-blue-600",
      disabled: false
    },
    {
      id: PlanType.BUSINESS,
      icon: Star,
      label: "Business",
      price: "$1200",
      description: "For scaling teams. Advanced automation, team oversight, 365-day activity feed & premium support.",
      color: "text-yellow-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      activeBorder: "border-amber-400",
      disabled: false,
      isPopular: true
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button 
          onClick={onOpenPromptSettings}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-gray-600 rounded-full text-sm font-medium hover:bg-white hover:text-taxdome-blue hover:shadow-md transition-all border border-gray-100"
        >
          <Settings2 size={16} /> Customize Prompt
        </button>
        <button 
          onClick={onOpenHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-gray-600 rounded-full text-sm font-medium hover:bg-white hover:text-taxdome-blue hover:shadow-md transition-all border border-gray-100"
        >
          <History size={16} /> History
        </button>
      </div>

      <div className="mb-8 flex justify-between items-center relative max-w-xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
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

      <div className="glass-panel p-8 rounded-3xl shadow-xl min-h-[600px] flex flex-col justify-between transition-all duration-500">
        <div>
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Firm Details</h2>
                <p className="text-gray-500">Let's start with the basics.</p>
              </div>

              <div className="space-y-5 max-w-lg mx-auto">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Proposal Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['English', 'Spanish'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setData({...data, language: lang as 'English' | 'Spanish'})}
                        className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Contact Person</label>
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

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Number of Users</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taxdome-blue focus:border-transparent outline-none transition-all"
                    value={data.firmSize}
                    onChange={e => setData({...data, firmSize: parseInt(e.target.value) || 0})}
                  />
                   {data.firmSize > 1 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 ml-1">
                      <AlertCircle size={12} /> Essentials plan is strictly for solo users.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-6">
               <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Needs & Context</h2>
                <p className="text-gray-500">Select major features and provide context for the proposal.</p>
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
                       <MessageSquare size={16} /> Executive Context (Private)
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
                <h2 className="text-2xl font-bold text-gray-900">Plan Selection</h2>
                <p className="text-gray-500">Which TaxDome plan are we quoting?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {PLAN_DETAILS.map((plan) => {
                  const Icon = plan.icon;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => !plan.disabled && setData({...data, selectedPlan: plan.id})}
                      disabled={plan.disabled}
                      className={`relative p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group ${
                        data.selectedPlan === plan.id
                          ? `${plan.activeBorder} ${plan.bgColor}`
                          : `bg-white hover:border-gray-300 ${plan.borderColor}`
                      } ${plan.disabled ? 'opacity-50 cursor-not-allowed grayscale bg-gray-100' : 'hover:shadow-md'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        data.selectedPlan === plan.id ? 'bg-white shadow-sm' : 'bg-gray-50'
                      }`}>
                         <Icon className={plan.disabled ? 'text-gray-400' : plan.color} size={24} />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`font-bold text-lg ${plan.disabled ? 'text-gray-500' : 'text-gray-900'}`}>{plan.label}</h3>
                          {plan.isPopular && !plan.disabled && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                               <Sparkles size={10} fill="white"/> Most Popular
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${plan.disabled ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                          {plan.description}
                        </p>
                         <div className={`text-xs font-semibold mt-2 ${plan.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                            Approx. {plan.price}/year per seat
                         </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        data.selectedPlan === plan.id ? plan.activeBorder : 'border-gray-300'
                      }`}>
                        {data.selectedPlan === plan.id && <div className={`w-3 h-3 rounded-full ${plan.color.replace('text-', 'bg-')}`} />}
                      </div>

                      {plan.disabled && (
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                           <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg font-medium flex items-center gap-2">
                             <AlertCircle size={14} /> Only available for 1 User
                           </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                <Sparkles size={20} className="mt-0.5 flex-shrink-0" />
                <p>The AI will verify these prices in real-time on taxdome.com to ensure your quote for <strong>{data.firmSize} users</strong> is 100% accurate.</p>
              </div>
            </div>
          )}

          {step === 4 && (
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
            <div></div> 
          )}

          {step < 4 ? (
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