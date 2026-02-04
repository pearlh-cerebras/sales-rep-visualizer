import { createSlice } from '@reduxjs/toolkit';
import { DealDecay } from '../types';
import { calculateDecay } from '../engine/decayEngine';
import { mockDeals } from '../data/deals';
import { generateSuggestions } from '../engine/suggestionEngine';

interface DecayState {
  decayScores: DealDecay[];
  loading: boolean;
}

const initialState: DecayState = {
  decayScores: [],
  loading: false,
};

const decaySlice = createSlice({
  name: 'decay',
  initialState,
  reducers: {
    regenerateDecay: (state) => {
      const suggestions = generateSuggestions(mockDeals);
      state.decayScores = calculateDecay(mockDeals, suggestions);
    },
  },
});

export const { regenerateDecay } = decaySlice.actions;
export default decaySlice.reducer;