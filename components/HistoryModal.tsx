import React from 'react';
import { SavedProposal } from '../types';
import { X, Calendar, User, FileText, Trash2, ArrowRight, Loader2, Cloud } from 'lucide-react';

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  proposals: SavedProposal[];
  onSelect: (proposal: SavedProposal) => void;
  onDelete: (id: string) => void;
}

const HistoryModal: React.FC<Props> = ({ isOpen, isLoading, onClose, proposals, onSelect, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Proposal History <Cloud size={16} className="text-taxdome-blue" />
            </h2>
            <p className="text-sm text-gray-500">Access your team's saved quotes</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 relative min-h-[300px]">
          {isLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-white/80 z-10">
               <Loader2 size={32} className="animate-spin text-taxdome-blue mb-2" />
               <p className="text-sm">Syncing with cloud...</p>
             </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No saved proposals found.</p>
              <p className="text-sm">Generate a proposal and click "Save" to sync it to the cloud.</p>
            </div>
          ) : (
            proposals.map((p) => (
              <div 
                key={p.id} 
                className="group border border-gray-100 rounded-xl p-4 hover:border-taxdome-blue hover:shadow-md transition-all bg-white relative"
              >
                <div className="flex justify-between items-start">
                  <div className="cursor-pointer flex-grow" onClick={() => onSelect(p)}>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{p.firmData.firmName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} /> {p.firmData.contactName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(p.lastModified).toLocaleDateString()}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {p.firmData.selectedPlan}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-4">
                     <button
                        onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete from Cloud"
                     >
                        <Trash2 size={16} />
                     </button>
                     <button
                        onClick={() => onSelect(p)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-taxdome-blue transition-colors"
                     >
                        Open <ArrowRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;