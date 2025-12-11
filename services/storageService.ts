
import { SavedProposal, AccountExecutive } from "../types";

// CONFIGURATION
// In a real deployment, this would be your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.your-taxdome-integrations.com';
const PROPOSAL_STORAGE_KEY = 'taxdome_proposals_v1';
const AE_STORAGE_KEY = 'taxdome_aes_list_v1';
const USE_CLOUD = false; // Set to true when you have a backend running

/**
 * SIMULATED CLOUD DELAY
 * This helps visualize how the app will behave with a real internet connection.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PROPOSALS ---

export const getSavedProposals = async (): Promise<SavedProposal[]> => {
  let proposals: SavedProposal[] = [];

  // 1. Fetch
  if (USE_CLOUD) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals`);
      if (!response.ok) throw new Error('Network response was not ok');
      proposals = await response.json();
    } catch (error) {
      console.warn("Cloud fetch failed, falling back to local storage (Offline Mode)", error);
    }
  }

  // 2. Local Fallback (Simulation)
  if (proposals.length === 0 && !USE_CLOUD) {
    await delay(600); // Simulate network latency
    try {
      const data = localStorage.getItem(PROPOSAL_STORAGE_KEY);
      if (data) proposals = JSON.parse(data);
    } catch (e) {
      console.error("Failed to load history", e);
      proposals = [];
    }
  }

  // 3. AUTO-DELETION POLICY (30 Days)
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const activeProposals = proposals.filter(p => {
    // If createdAt is missing (legacy), assume it's valid or use lastModified
    const dateToCheck = p.createdAt || p.lastModified || now;
    return (now - dateToCheck) < THIRTY_DAYS_MS;
  });

  // If we found expired items, clean them up
  if (activeProposals.length < proposals.length) {
    console.log(`Cleanup: Found ${proposals.length - activeProposals.length} expired proposals.`);
    
    // Identify expired IDs
    const expiredIds = proposals
      .filter(p => !activeProposals.includes(p))
      .map(p => p.id);

    // Delete them
    expiredIds.forEach(id => deleteProposalFromStorage(id).catch(err => console.error("Auto-delete failed", err)));
    
    // For local storage, we can just overwrite immediately to be clean
    if (!USE_CLOUD) {
      localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(activeProposals));
    }
  }

  return activeProposals;
};

export const saveProposalToStorage = async (proposal: SavedProposal): Promise<void> => {
  // 1. Try Cloud Save
  if (USE_CLOUD) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      if (!response.ok) throw new Error('Save failed');
      return; // Success
    } catch (error) {
      console.warn("Cloud save failed, saving locally", error);
    }
  }

  // 2. Local Fallback
  await delay(800); // Simulate network latency
  const currentData = localStorage.getItem(PROPOSAL_STORAGE_KEY);
  const current: SavedProposal[] = currentData ? JSON.parse(currentData) : [];
  
  const existingIndex = current.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    current[existingIndex] = proposal;
  } else {
    current.unshift(proposal); // Add to top
  }
  
  localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(current));
};

export const deleteProposalFromStorage = async (id: string): Promise<void> => {
  // 1. Try Cloud Delete
  if (USE_CLOUD) {
    try {
      await fetch(`${API_BASE_URL}/proposals/${id}`, { method: 'DELETE' });
      return;
    } catch (error) {
      console.warn("Cloud delete failed", error);
    }
  }

  // 2. Local Fallback
  await delay(400); 
  const currentData = localStorage.getItem(PROPOSAL_STORAGE_KEY);
  if (!currentData) return;

  const current: SavedProposal[] = JSON.parse(currentData);
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(filtered));
};

// --- ACCOUNT EXECUTIVES ---

export const getAccountExecutives = async (): Promise<AccountExecutive[]> => {
  let aes: AccountExecutive[] = [];

  // 1. Try Cloud Fetch
  if (USE_CLOUD) {
    try {
      const response = await fetch(`${API_BASE_URL}/account-executives`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.warn("AE Cloud fetch failed, falling back to local", error);
    }
  }

  // 2. Local Fallback
  await delay(300); // Short latency
  const data = localStorage.getItem(AE_STORAGE_KEY);
  if (data) {
    aes = JSON.parse(data);
  }
  
  return aes;
};

export const saveAccountExecutives = async (aes: AccountExecutive[]): Promise<void> => {
  // 1. Try Cloud Save (typically we'd PUT the whole list or POST individual, assuming PUT list here for sync)
  if (USE_CLOUD) {
    try {
      const response = await fetch(`${API_BASE_URL}/account-executives`, {
        method: 'PUT', // or POST depending on API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aes)
      });
      if (!response.ok) throw new Error('AE Save failed');
      return;
    } catch (error) {
      console.warn("AE Cloud save failed, saving locally", error);
    }
  }

  // 2. Local Fallback
  await delay(500);
  localStorage.setItem(AE_STORAGE_KEY, JSON.stringify(aes));
};
