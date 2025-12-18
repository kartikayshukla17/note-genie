import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const API_URL = 'http://localhost:5001/notes';

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.notes;
});

export const syncNoteToServer = createAsyncThunk('notes/syncNote', async ({ id, title, content, isNew }) => {
    if (isNew) {
        const res = await axios.post(API_URL, { title, content }, { withCredentials: true });
        return { oldId: id, newNote: res.data.note };
    } else {
        const res = await axios.put(`${API_URL}/${id}`, { title, content }, { withCredentials: true });
        return { oldId: id, newNote: res.data.note };
    }
});

export const deleteNoteAsync = createAsyncThunk('notes/deleteNote', async (id) => {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    return id;
});

const noteSlice = createSlice({
    name: "notes",
    initialState: {
        items: [],
        pendingSync: [],
        loading: false,
        error: null
    },
    reducers: {
        clearNotes: (state) => {
            state.items = [];
            state.pendingSync = [];
        },

        createNoteLocal: (state, action) => {
            const newNote = {
                id: `local_${Date.now()}`,
                title: action.payload?.title || 'Untitled',
                content: action.payload?.content || '',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                isLocal: true
            };
            state.items.push(newNote);
            state.pendingSync.push(newNote.id);
        },

        updateNoteLocal: (state, action) => {
            const note = state.items.find((n) => n.id === action.payload.id);
            if (note) {
                note.title = action.payload.title;
                note.content = action.payload.content;
                note.lastUpdate = Date.now();
                if (!state.pendingSync.includes(note.id)) {
                    state.pendingSync.push(note.id);
                }
            }
        },

        deleteNoteLocal: (state, action) => {
            state.items = state.items.filter((note) => note.id !== action.payload);
            state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
        },

        markSynced: (state, action) => {
            state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                const serverNotes = action.payload || [];
                const localOnlyNotes = state.items.filter(n => n.isLocal);
                state.items = [...serverNotes, ...localOnlyNotes];
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                // Keep existing items when fetch fails (offline mode)
            })
            .addCase(syncNoteToServer.fulfilled, (state, action) => {
                const { oldId, newNote } = action.payload;
                const index = state.items.findIndex(n => n.id === oldId);
                if (index !== -1) {
                    state.items[index] = { ...newNote, isLocal: false };
                }
                state.pendingSync = state.pendingSync.filter(id => id !== oldId);
            })
            .addCase(deleteNoteAsync.fulfilled, (state, action) => {
                state.items = state.items.filter((note) => note.id !== action.payload);
            });
    }
});

export const { clearNotes, createNoteLocal, updateNoteLocal, deleteNoteLocal, markSynced } = noteSlice.actions;

export default noteSlice.reducer;