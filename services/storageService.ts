import { SavedProposal } from "../types";

// CONFIGURATION
// In a real deployment, this would be your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.your-taxdome-integrations.com';
const STORAGE_KEY = 'taxdome_proposals_v1';
const USE_CLOUD = false; // Set to true when you have a backend running

/**
 * SIMULATED CLOUD DELAY
 * This helps visualize how the app will behave with a real internet connection.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSavedProposals = async (): Promise<SavedProposal[]> => {
  // 1. Try Cloud Fetch
  if (USE_CLOUD) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.warn("Cloud fetch failed, falling back to local storage (Offline Mode)", error);
    }
  }

  // 2. Local Fallback (Simulation)
  await delay(600); // Simulate network latency
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
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
  const currentData = localStorage.getItem(STORAGE_KEY);
  const current: SavedProposal[] = currentData ? JSON.parse(currentData) : [];
  
  const existingIndex = current.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    current[existingIndex] = proposal;
  } else {
    current.unshift(proposal); // Add to top
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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
  const currentData = localStorage.getItem(STORAGE_KEY);
  if (!currentData) return;

  const current: SavedProposal[] = JSON.parse(currentData);
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};