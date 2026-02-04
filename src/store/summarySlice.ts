import { createSlice } from '@reduxjs/toolkit';
import { PipelineSummary } from '../types';
import { generatePipelineSummary } from '../engine/summaryEngine';
import { mockDeals } from '../data/deals';
import { generateSuggestions } from '../engine/suggestionEngine';

interface SummaryState {
  summary: PipelineSummary | null;
  loading: boolean;
}

const initialState: SummaryState = {
  summary: null,
  loading: false,
};

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {
    regenerateSummary: (state) => {
      const suggestions = generateSuggestions(mockDeals);
      state.summary = generatePipelineSummary(mockDeals, suggestions);
    },
  },
});

export const { regenerateSummary } = summarySlice.actions;
export default summarySlice.reducer;