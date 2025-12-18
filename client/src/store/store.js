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
  return Promise.resolve(
    state && Array.isArray(state.notes)
      ? {
        ...state,
        notes: {
          items: [],
          pendingSync: [],
          loading: false,
          error: null
        }
      }
      : state && state.notes && !state.notes.pendingSync
        ? {
          ...state,
          notes: {
            ...state.notes,
            pendingSync: []
          }
        }
        : state
  );
};

const persistConfig = {
  key: 'root',
  version: 3,
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