
import { SavedProposal, AccountExecutive } from "../types";

// Bumped to v2 to ensure new default AEs (like Edgar) load for existing users
const AE_STORAGE_KEY = 'taxdome_aes_local_v2';
const PROMPT_STORAGE_KEY = 'taxdome_prompt_local_v1';

const DEFAULT_AES: AccountExecutive[] = [
  { id: 'ae_edgar', name: 'Edgar Espinoza', email: 'edgar@taxdome.com' },
  { id: 'ae_1', name: 'Niko Witt', email: 'niko@taxdome.com' },
  { id: 'ae_2', name: 'Troy Stell', email: 'tstell@taxdome.com' },
  { id: 'ae_3', name: 'Eric Chen', email: 'echen@taxdome.com' },
  { id: 'ae_4', name: 'Korey Curtis', email: 'kcurtis@taxdome.com' },
  { id: 'ae_5', name: 'Denise Stewart', email: 'dstewart@taxdome.com' },
  { id: 'ae_6', name: 'Erika Sanchez', email: 'eramirez@taxdome.com' },
  { id: 'ae_7', name: 'Roberto Soto', email: 'rsoto@taxdome.com' },
  { id: 'ae_8', name: 'Dominique Barte', email: 'dbarte@taxdome.com' },
  { id: 'ae_9', name: 'Rushabh Kapadia', email: 'rkapadia@taxdome.com' },
  { id: 'ae_10', name: 'Gabriel Sarmiento', email: 'gmacias@taxdome.com' },
];

// --- ACCOUNT EXECUTIVES (LocalStorage) ---

export const getAccountExecutives = async (): Promise<AccountExecutive[]> => {
  try {
    const data = localStorage.getItem(AE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to parse AEs from local storage");
  }
  
  // Initialize with defaults if empty or error
  localStorage.setItem(AE_STORAGE_KEY, JSON.stringify(DEFAULT_AES));
  return DEFAULT_AES;
};

export const saveAccountExecutives = async (aes: AccountExecutive[]): Promise<void> => {
  localStorage.setItem(AE_STORAGE_KEY, JSON.stringify(aes));
};

// --- GLOBAL SETTINGS (Shared Prompt via LocalStorage) ---

export const getCustomPrompt = async (): Promise<string | null> => {
  return localStorage.getItem(PROMPT_STORAGE_KEY);
};

export const saveCustomPrompt = async (promptTemplate: string): Promise<void> => {
  localStorage.setItem(PROMPT_STORAGE_KEY, promptTemplate);
};

// --- HISTORY FUNCTIONS (Removed/Stubbed) ---

export const getSavedProposals = async (): Promise<SavedProposal[]> => {
  return [];
};

export const saveProposalToStorage = async (proposal: SavedProposal): Promise<void> => {
  // No-op
};

export const deleteProposalFromStorage = async (id: string): Promise<void> => {
  // No-op
};
