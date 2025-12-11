
import { SavedProposal, AccountExecutive } from "../types";

// CONFIGURATION
// Ensure this points to your shared team backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.your-taxdome-integrations.com';
// Detect if we are likely in a demo/dev environment without a real backend
const IS_DEMO_MODE = API_BASE_URL.includes('your-taxdome-integrations') || API_BASE_URL.includes('localhost');

// HELPER: Standard headers for JSON content
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// MOCK CLOUD STORAGE (In-Memory)
// Used to prevent app crash when no backend is connected, while complying with "No LocalStorage" policy.
const MOCK_DB = {
  proposals: [] as SavedProposal[],
  aes: [] as AccountExecutive[],
  prompt: null as string | null
};

// --- PROPOSALS (HISTORY) ---

export const getSavedProposals = async (): Promise<SavedProposal[]> => {
  if (IS_DEMO_MODE) {
    // Return mock data directly
    return MOCK_DB.proposals.sort((a, b) => b.lastModified - a.lastModified);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/proposals`, { headers });
    if (!response.ok) throw new Error(`Cloud fetch failed: ${response.statusText}`);
    
    const proposals: SavedProposal[] = await response.json();

    // AUTO-DELETION POLICY (30 Days)
    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const validProposals: SavedProposal[] = [];
    const expiredIds: string[] = [];

    proposals.forEach(p => {
      const dateToCheck = p.createdAt || p.lastModified || now;
      if ((now - dateToCheck) < THIRTY_DAYS_MS) {
        validProposals.push(p);
      } else {
        expiredIds.push(p.id);
      }
    });

    if (expiredIds.length > 0) {
      console.log(`Cloud Cleanup: Removing ${expiredIds.length} expired proposals.`);
      Promise.all(expiredIds.map(id => 
        fetch(`${API_BASE_URL}/proposals/${id}`, { method: 'DELETE' })
          .catch(err => console.error(`Failed to auto-delete ${id}`, err))
      ));
    }

    return validProposals.sort((a, b) => b.lastModified - a.lastModified);

  } catch (error) {
    console.warn("Failed to load proposals from cloud (Backend unreachable).");
    return []; 
  }
};

export const saveProposalToStorage = async (proposal: SavedProposal): Promise<void> => {
  if (IS_DEMO_MODE) {
    const idx = MOCK_DB.proposals.findIndex(p => p.id === proposal.id);
    if (idx >= 0) MOCK_DB.proposals[idx] = proposal;
    else MOCK_DB.proposals.push(proposal);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(proposal)
  });
  
  if (!response.ok) {
    throw new Error('Failed to save proposal to cloud');
  }
};

export const deleteProposalFromStorage = async (id: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    MOCK_DB.proposals = MOCK_DB.proposals.filter(p => p.id !== id);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete proposal from cloud');
  }
};

// --- ACCOUNT EXECUTIVES (TEAM) ---

export const getAccountExecutives = async (): Promise<AccountExecutive[]> => {
  if (IS_DEMO_MODE) {
    return [...MOCK_DB.aes];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/account-executives`, { headers });
    if (!response.ok) throw new Error('Failed to load team members');
    return await response.json();
  } catch (error) {
    console.warn("Cloud AE fetch failed (Backend unreachable). Returning empty list.");
    return [];
  }
};

export const saveAccountExecutives = async (aes: AccountExecutive[]): Promise<void> => {
  if (IS_DEMO_MODE) {
    MOCK_DB.aes = [...aes];
    return;
  }

  const response = await fetch(`${API_BASE_URL}/account-executives`, {
    method: 'PUT', 
    headers,
    body: JSON.stringify(aes)
  });

  if (!response.ok) throw new Error('Failed to save team members');
};

// --- GLOBAL SETTINGS (SHARED PROMPT) ---

export const getCustomPrompt = async (): Promise<string | null> => {
  if (IS_DEMO_MODE) {
    return MOCK_DB.prompt;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/settings/prompt`, { headers });
    if (response.status === 404) return null; 
    if (!response.ok) throw new Error('Failed to load settings');
    
    const data = await response.json();
    return data.value || null;
  } catch (error) {
    console.warn("Could not load shared prompt (Backend unreachable)");
    return null;
  }
};

export const saveCustomPrompt = async (promptTemplate: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    MOCK_DB.prompt = promptTemplate;
    return;
  }

  const response = await fetch(`${API_BASE_URL}/settings/prompt`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ value: promptTemplate })
  });

  if (!response.ok) throw new Error('Failed to save shared prompt');
};
