import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const API_URL = 'http://localhost:5001/notes';


export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.notes;
});

export const createNote = createAsyncThunk('notes/createNote', async ({ title, content }) => {
    const res = await axios.post(API_URL, { title, content }, { withCredentials: true });
    return res.data.note;
});

export const updateNoteAsync = createAsyncThunk('notes/updateNote', async ({ id, title, content }) => {
    const res = await axios.put(`${API_URL}/${id}`, { title, content }, { withCredentials: true });
    return res.data.note;
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id) => {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    return id;
});

const noteSlice = createSlice({
    name: "notes",
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {
        clearNotes: (state) => {
            state.items = [];
        },

        updateNoteLocal: (state, action) => {
            const note = state.items.find((n) => n.id === action.payload.id);
            if (note) {
                note.title = action.payload.title;
                note.content = action.payload.content;
                note.lastUpdate = Date.now();
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createNote.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateNoteAsync.fulfilled, (state, action) => {
                const index = state.items.findIndex(n => n.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.items = state.items.filter((note) => note.id !== action.payload);
            });
    }
});

export const { clearNotes, updateNoteLocal } = noteSlice.actions;

export default noteSlice.reducer;