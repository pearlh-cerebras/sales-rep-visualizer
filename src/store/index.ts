import { configureStore } from '@reduxjs/toolkit';
import dealsReducer from './dealsSlice';
import suggestionsReducer from './suggestionsSlice';
import actionsReducer from './actionsSlice';
import decayReducer from './decaySlice';
import summaryReducer from './summarySlice';
import { mockDeals } from '../data/deals';
import { generateSuggestions } from '../engine/suggestionEngine';
import { generateActions } from '../engine/actionEngine';
import { calculateDecay } from '../engine/decayEngine';
import { generatePipelineSummary } from '../engine/summaryEngine';

const initialSuggestions = generateSuggestions(mockDeals);
const initialActions = generateActions(mockDeals, initialSuggestions);
const initialDecay = calculateDecay(mockDeals, initialSuggestions);
const initialSummary = generatePipelineSummary(mockDeals, initialSuggestions);

export const store = configureStore({
  reducer: {
    deals: dealsReducer,
    suggestions: suggestionsReducer,
    actions: actionsReducer,
    decay: decayReducer,
    summary: summaryReducer,
  },
  preloadedState: {
    actions: { actions: initialActions, loading: false },
    decay: { decayScores: initialDecay, loading: false },
    summary: { summary: initialSummary, loading: false },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;