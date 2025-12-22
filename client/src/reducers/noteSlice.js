import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Recursive helper to find item in tree
const findItemInTree = (items, itemId) => {
    for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children && item.children.length > 0) {
            const found = findItemInTree(item.children, itemId);
            if (found) return found;
        }
    }
    return null;
};

// Recursive helper to delete item from tree
const deleteItemFromTree = (items, itemId) => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            items.splice(i, 1);
            return true;
        }
        if (items[i].children && items[i].children.length > 0) {
            if (deleteItemFromTree(items[i].children, itemId)) {
                return true;
            }
        }
    }
    return false;
};

export const fetchFolders = createAsyncThunk('notes/fetchFolders', async () => {
    const res = await axios.get(`${API_URL}/folders`, { withCredentials: true });
    return res.data.folders;
});

export const syncItemToServer = createAsyncThunk('notes/syncItem', async ({ id, type, name, title, content, parentId, isNew }) => {
    if (isNew) {
        const res = await axios.post(`${API_URL}/folders`, { type, name, title, content, parentId }, { withCredentials: true });
        return { oldId: id, newItem: res.data.item };
    } else {
        const res = await axios.put(`${API_URL}/folders/${id}`, { name, title, content }, { withCredentials: true });
        return { oldId: id, newItem: res.data.item };
    }
});

export const deleteItemAsync = createAsyncThunk('notes/deleteItem', async (id) => {
    await axios.delete(`${API_URL}/folders/${id}`, { withCredentials: true });
    return id;
});

const noteSlice = createSlice({
    name: "notes",
    initialState: {
        folders: [],
        pendingSync: [],
        loading: false,
        error: null
    },
    reducers: {
        clearNotes: (state) => {
            state.folders = [];
            state.pendingSync = [];
        },

        createItemLocal: (state, action) => {
            const { type, name, title, content, parentId, id } = action.payload;
            const newItem = {
                id: id || `local_${type}_${Date.now()}`,
                type,
                name: type === 'folder' ? (name || 'New Folder') : undefined,
                title: type === 'note' ? (title || 'Untitled') : undefined,
                content: type === 'note' ? (content || '') : undefined,
                children: type === 'folder' ? [] : undefined,
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                isLocal: true
            };

            if (parentId) {
                const parent = findItemInTree(state.folders, parentId);
                if (parent && parent.type === 'folder') {
                    parent.children.push(newItem);
                }
            } else {
                state.folders.push(newItem);
            }
            state.pendingSync.push(newItem.id);
        },

        updateItemLocal: (state, action) => {
            const { id, name, title, content } = action.payload;
            const item = findItemInTree(state.folders, id);
            if (item) {
                if (item.type === 'folder' && name !== undefined) {
                    item.name = name;
                } else if (item.type === 'note') {
                    if (title !== undefined) item.title = title;
                    if (content !== undefined) item.content = content;
                    item.lastUpdate = Date.now();
                }
                if (!state.pendingSync.includes(id)) {
                    state.pendingSync.push(id);
                }
            }
        },

        deleteItemLocal: (state, action) => {
            deleteItemFromTree(state.folders, action.payload);
            state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
        },

        markSynced: (state, action) => {
            state.pendingSync = state.pendingSync.filter((id) => id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFolders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFolders.fulfilled, (state, action) => {
                state.loading = false;
                const serverFolders = action.payload || [];
                const localOnlyItems = state.folders.filter(f => f.isLocal);
                state.folders = [...serverFolders, ...localOnlyItems];
            })
            .addCase(fetchFolders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(syncItemToServer.fulfilled, (state, action) => {
                const { oldId, newItem } = action.payload;
                const item = findItemInTree(state.folders, oldId);
                if (item) {
                    Object.assign(item, { ...newItem, isLocal: false });
                }
                state.pendingSync = state.pendingSync.filter(id => id !== oldId);
            })
            .addCase(deleteItemAsync.fulfilled, (state, action) => {
                deleteItemFromTree(state.folders, action.payload);
            });
    }
});

export const {
    clearNotes,
    createItemLocal,
    updateItemLocal,
    deleteItemLocal,
    markSynced
} = noteSlice.actions;

export default noteSlice.reducer;