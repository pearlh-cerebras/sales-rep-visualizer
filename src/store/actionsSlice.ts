import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Action } from '../types';
import { generateActions } from '../engine/actionEngine';
import { mockDeals } from '../data/deals';
import { generateSuggestions } from '../engine/suggestionEngine';

interface ActionsState {
  actions: Action[];
  loading: boolean;
}

const initialState: ActionsState = {
  actions: [],
  loading: false,
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    completeAction: (state, action: PayloadAction<string>) => {
      const actionItem = state.actions.find(a => a.id === action.payload);
      if (actionItem) {
        actionItem.completedAt = new Date();
      }
    },
    snoozeAction: (state, action: PayloadAction<{ id: string; until: Date }>) => {
      const actionItem = state.actions.find(a => a.id === action.payload.id);
      if (actionItem) {
        actionItem.dueBy = action.payload.until;
      }
    },
    regenerateActions: (state) => {
      const suggestions = generateSuggestions(mockDeals);
      state.actions = generateActions(mockDeals, suggestions);
    },
  },
});

export const { completeAction, snoozeAction, regenerateActions } = actionsSlice.actions;
export default actionsSlice.reducer;