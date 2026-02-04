import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrioritySuggestion } from '../types';
import { generateSuggestions } from '../engine/suggestionEngine';
import { mockDeals } from '../data/deals';

interface SuggestionsState {
  suggestions: PrioritySuggestion[];
  loading: boolean;
}

const initialState: SuggestionsState = {
  suggestions: generateSuggestions(mockDeals),
  loading: false,
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    acceptSuggestion: (state, action: PayloadAction<{ dealId: string }>) => {
      const suggestion = state.suggestions.find(s => s.dealId === action.payload.dealId);
      if (suggestion) {
        suggestion.accepted = true;
      }
    },
    rejectSuggestion: (state, action: PayloadAction<{ dealId: string }>) => {
      const suggestion = state.suggestions.find(s => s.dealId === action.payload.dealId);
      if (suggestion) {
        suggestion.rejected = true;
      }
    },
    regenerateSuggestions: (state) => {
      state.suggestions = generateSuggestions(mockDeals);
    },
  },
});

export const { acceptSuggestion, rejectSuggestion, regenerateSuggestions } = suggestionsSlice.actions;
export default suggestionsSlice.reducer;