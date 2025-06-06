import { create } from 'zustand';
import { electionAPI } from '../utils/api';
import { useAuthStore } from './authStore'; // Import authStore

// Helper to map _id to id recursively for elections, positions, and candidates
const mapElectionData = (election) => {
  if (!election || typeof election !== 'object') return election;

  let mappedElection = { ...election };

  // Map _id to id for the main election object
  if (mappedElection._id && typeof mappedElection.id === 'undefined') {
    mappedElection.id = mappedElection._id.toString();
  }
  // Don't delete _id, as it might be used by other parts of the backend or for direct API calls

  // Map positions array
  if (Array.isArray(mappedElection.positions)) {
    mappedElection.positions = mappedElection.positions.map(position => {
      if (!position || typeof position !== 'object') return position;
      let mappedPosition = { ...position };
      if (mappedPosition._id && typeof mappedPosition.id === 'undefined') {
        mappedPosition.id = mappedPosition._id.toString();
      }

      // Map candidates array within each position
      if (Array.isArray(mappedPosition.candidates)) {
        mappedPosition.candidates = mappedPosition.candidates.map(candidate => {
          if (!candidate || typeof candidate !== 'object') return candidate;
          let mappedCandidate = { ...candidate };
          if (mappedCandidate._id && typeof mappedCandidate.id === 'undefined') {
            mappedCandidate.id = mappedCandidate._id.toString();
          }
          return mappedCandidate;
        });
      }
      return mappedPosition;
    });
  }
  return mappedElection;
};

// Helper to map _id to id for an array of election objects
const mapElectionsArray = (elections) => {
  if (Array.isArray(elections)) {
    return elections.map(mapElectionData);
  }
  // Return as is if not an array (e.g., could be null or already processed)
  return elections;
};

const useElectionStore = create((set, get) => ({
  elections: [],
  currentElection: null,
  loading: false,
  error: null,
  
  // Load elections from API
  loadElections: async () => {
    set({ loading: true, error: null });
    try {
      const electionsFromApi = await electionAPI.getAllElections();
      const elections = mapElectionsArray(electionsFromApi);
      set({ elections, loading: false });
      return elections;
    } catch (error) {
      console.error('[loadElections] Error:', error);
      set({ 
        error: error.response?.data?.msg || 'Failed to load elections', 
        loading: false 
      });
      return [];
    }
  },

  // Get active elections
  loadActiveElections: async () => {
    set({ loading: true, error: null });
    try {
      const electionsFromApi = await electionAPI.getActiveElections();
      const elections = mapElectionsArray(electionsFromApi);
      set({ elections, loading: false });
      return elections;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to load active elections', 
        loading: false 
      });
      return [];
    }
  },

  // Get election by ID
  getElection: async (id) => {
    set({ loading: true, error: null });
    try {
      const electionFromApi = await electionAPI.getElectionById(id);
      const election = mapElectionData(electionFromApi);
      set({ currentElection: election, loading: false });
      return election;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to get election', 
        loading: false 
      });
      return null;
    }
  },

  // Create a new election
  createElection: async (electionData) => {
    set({ loading: true, error: null });
    try {
      const newElectionFromApi = await electionAPI.createElection(electionData);
      const newElection = mapElectionData(newElectionFromApi);
      set(state => ({
        elections: [...state.elections, newElection],
        currentElection: newElection,
        loading: false,
      }));
      
      return newElection;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to create election', 
        loading: false 
      });
      throw error;
    }
  },

  // Update an existing election
  updateElection: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedElectionFromApi = await electionAPI.updateElection(id, updates); // id here is likely _id
      const updatedElection = mapElectionData(updatedElectionFromApi); // Ensure updatedElection has .id

      set(state => {
        const updatedElections = state.elections.map(e => 
          // Compare with id (which is _id from API) or e._id if present, or e.id if already mapped
          (e._id || e.id) === id ? updatedElection : e
        );
        
        return {
          elections: updatedElections,
          currentElection: (state.currentElection?._id || state.currentElection?.id) === id ? updatedElection : state.currentElection,
          loading: false,
        };
      });
      
      return updatedElection;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to update election', 
        loading: false 
      });
      throw error;
    }
  },

  // Delete an election
  deleteElection: async (id) => {
    set({ loading: true, error: null });
    try {
      await electionAPI.deleteElection(id);
      
      set(state => {
        const updatedElections = state.elections.filter(election => election.id !== id);
        
        return {
          elections: updatedElections,
          currentElection: state.currentElection?.id === id ? null : state.currentElection,
          loading: false,
        };
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to delete election', 
        loading: false 
      });
      throw error;
    }
  },

  // Fetch details for a single election (for polling updates)
  fetchElectionDetails: async (electionId) => {
    // Don't set global loading true for background polling, to avoid UI spinners on unrelated pages.
    // Individual components can manage their own loading state if needed.
    // set({ loading: true, error: null }); 
    try {
      const electionFromApi = await electionAPI.getElectionById(electionId);
      const updatedElection = mapElectionData(electionFromApi);

      set(state => {
        const newElections = state.elections.map(e => 
          e.id === updatedElection.id ? updatedElection : e
        );
        // If the election wasn't in the list, add it (though unlikely for polling scenario)
        if (!newElections.find(e => e.id === updatedElection.id)) {
          newElections.push(updatedElection);
        }

        return {
          elections: newElections,
          currentElection: state.currentElection?.id === updatedElection.id ? updatedElection : state.currentElection,
          // error: null, // Clear previous error if successful
        };
      });
      return updatedElection;
    } catch (error) {
      console.error(`[fetchElectionDetails] Error fetching election ${electionId}:`, error);
      // Avoid setting global error for background polling, as it might affect unrelated UI.
      // set({ error: error.response?.data?.msg || 'Failed to fetch election details' });
      // Propagate the error so the calling component can handle it if needed.
      throw error; 
    }
  },

  // Cast a vote
  castVote: async (voteData) => {
    // voteData should contain { electionId, positionId, candidateId, voterId }
    set({ loading: true, error: null });
    try {
      const response = await electionAPI.voteInElection(voteData.electionId, voteData.positionId, voteData.candidateId, voteData.voterId);
      set({ loading: false });
      // Refresh current user data to update their vote status
      try {
        await useAuthStore.getState().refreshCurrentUser();
      } catch (authError) {
        console.error('[castVote] Failed to refresh user data after voting:', authError);
        // Non-critical error, vote was cast, but user's local vote status might be stale
      }
      // For now, just return the response. The VotePage handles success UI.
      return response;
    } catch (error) {
      console.error('[castVote] Error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.msg || 'Failed to cast vote',
        loading: false
      });
      throw error; // Re-throw to be caught by VotePage.jsx
    }
  },

  // Get election results
  getElectionResults: async (id) => {
    set({ loading: true, error: null });
    try {
      const results = await electionAPI.getElectionResults(id);
      set({ loading: false });
      return results;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to get election results', 
        loading: false 
      });
      throw error;
    }
  },

  // Clear any errors
  clearError: () => set({ error: null })
}));

export default useElectionStore;
