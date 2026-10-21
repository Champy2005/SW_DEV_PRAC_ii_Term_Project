import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const savedSlice = createSlice({
  name: 'savedWorkshops',
  initialState: { ids: [] as string[] },
  reducers: {
    restoreSaved(state, action: PayloadAction<string[]>) {
      state.ids = [...new Set(action.payload)];
    },
    toggleSaved(state, action: PayloadAction<string>) {
      const index = state.ids.indexOf(action.payload);
      if (index < 0) state.ids.push(action.payload);
      else state.ids.splice(index, 1);
    },
  },
});

export const { restoreSaved, toggleSaved } = savedSlice.actions;
export const makeStore = () => configureStore({ reducer: { savedWorkshops: savedSlice.reducer } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
