import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deal } from '../types';
import { mockDeals } from '../data/deals';

interface DealsState {
  deals: Deal[];
  loading: boolean;
}

const initialState: DealsState = {
  deals: mockDeals,
  loading: false,
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    updateDealStage: (state, action: PayloadAction<{ dealId: string; stage: Deal['stage'] }>) => {
      const deal = state.deals.find(d => d.id === action.payload.dealId);
      if (deal) {
        deal.stage = action.payload.stage;
      }
    },
    updateDealNextStep: (state, action: PayloadAction<{ dealId: string; nextStep: string }>) => {
      const deal = state.deals.find(d => d.id === action.payload.dealId);
      if (deal) {
        deal.nextStep = action.payload.nextStep;
      }
    },
  },
});

export const { updateDealStage, updateDealNextStep } = dealsSlice.actions;
export default dealsSlice.reducer;