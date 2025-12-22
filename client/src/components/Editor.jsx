import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateItemLocal, syncItemToServer } from '../reducers/noteSlice'

// Helper to find note in tree
const findNoteInTree = (items, noteId) => {
    for (const item of items) {
        if (item.id === noteId) return item;
        if (item.children && item.children.length > 0) {
            const found = findNoteInTree(item.children, noteId);
            if (found) return found;
        }
    }
    return null;
};

const Editor = ({ activeFileId }) => {
    const dispatch = useDispatch()
    const folders = useSelector((state) => state.notes?.folders || [])
    const note = findNoteInTree(folders, activeFileId)
    const debounceRef = useRef(null)

    if (!note || note.type !== 'note') {
        return <div className="flex-1 flex items-center justify-center text-zinc-600">Select a file to start editing</div>
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            id: note.id,
            title: name === 'title' ? value : note.title,
            content: name === 'content' ? value : note.content
        };

        dispatch(updateItemLocal(updatedData));

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const isNew = note.id.startsWith('local_');
            dispatch(syncItemToServer({
                id: note.id,
                type: 'note',
                title: updatedData.title,
                content: updatedData.content,
                isNew
            })).catch(() => {
                // Sync failed (offline) - data is still saved locally via redux-persist
            });
        }, 1000);
    }

    return (
        <div className="flex-1 flex flex-col h-full relative">
            <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2 md:pb-4">
                <input
                    className="bg-transparent text-xl md:text-3xl font-bold text-white w-full outline-none placeholder-zinc-700 font-sans tracking-tight"
                    name="title"
                    value={note.title || ''}
                    onChange={handleChange}
                    placeholder="Untitled"
                    autoComplete="off"
                />
            </div>
            <textarea
                className="flex-1 bg-transparent text-sm md:text-base font-mono text-zinc-300 px-4 md:px-8 py-2 md:py-4 resize-none outline-none leading-relaxed selection:bg-purple-500/30 selection:text-purple-100"
                name="content"
                value={note.content || ''}
                onChange={handleChange}
                placeholder="Start typing..."
                spellCheck="false"
            />
            <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 text-xs text-zinc-600">
                {new Date(note.lastUpdate).toLocaleString()}
            </div>
        </div>
    )
}

export default Editor
