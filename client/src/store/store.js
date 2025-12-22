import { configureStore, combineReducers } from '@reduxjs/toolkit'
import noteSlice from "../reducers/noteSlice.js";
import userSlice from "../reducers/userSlice.js";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const migrate = (state) => {
  // Only migrate if state exists and needs migration
  if (!state || !state.notes) {
    return Promise.resolve({
      ...state,
      notes: {
        folders: [],
        pendingSync: [],
        loading: false,
        error: null
      }
    });
  }

  // Preserve existing data, just ensure structure is correct
  return Promise.resolve({
    ...state,
    notes: {
      folders: state.notes.folders || [],
      pendingSync: state.notes.pendingSync || [],
      loading: false,
      error: null
    }
  });
};

const persistConfig = {
  key: 'root',
  version: 5,
  storage,
  migrate,
}

const rootReducer = combineReducers({
  notes: noteSlice,
  user: userSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)