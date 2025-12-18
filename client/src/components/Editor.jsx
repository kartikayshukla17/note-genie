import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateNoteLocal, syncNoteToServer } from '../reducers/noteSlice'

const Editor = ({ activeFileId }) => {
    const dispatch = useDispatch()
    const note = useSelector((state) =>
        (state.notes?.items || []).find((n) => n.id === activeFileId)
    )
    const debounceRef = useRef(null)

    if (!note) return <div className="flex-1 flex items-center justify-center text-zinc-600">Select a file to start editing</div>

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            id: note.id,
            title: name === 'title' ? value : note.title,
            content: name === 'content' ? value : note.content
        };

        dispatch(updateNoteLocal(updatedData));

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const isNew = note.id.startsWith('local_');
            dispatch(syncNoteToServer({
                id: note.id,
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
            <div className="px-8 pt-8 pb-4">
                <input
                    className="bg-transparent text-3xl font-bold text-white w-full outline-none placeholder-zinc-700 font-sans tracking-tight"
                    name="title"
                    value={note.title}
                    onChange={handleChange}
                    placeholder="Untitled"
                    autoComplete="off"
                />
            </div>
            <textarea
                className="flex-1 bg-transparent text-base font-mono text-zinc-300 px-8 py-4 resize-none outline-none leading-relaxed selection:bg-purple-500/30 selection:text-purple-100"
                name="content"
                value={note.content}
                onChange={handleChange}
                placeholder="Start typing..."
                spellCheck="false"
            />
            <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
                {new Date(note.lastUpdate).toLocaleString()}
            </div>
        </div>
    )
}

export default Editor
