import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateNoteLocal, updateNoteAsync } from '../reducers/noteSlice'

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

        // Update local state immediately for fast UI
        dispatch(updateNoteLocal(updatedData));

        // Debounce backend update to reduce API calls
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(updateNoteAsync(updatedData));
        }, 500);
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
            <div className="px-6 py-2 border-t border-white/5 text-xs text-zinc-600 flex justify-between bg-zinc-900/50 select-none backdrop-blur-sm">
                <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
                <div className="flex gap-2 text-zinc-700">|</div>
                <span>Last Updated: {new Date(note.lastUpdate).toLocaleString()}</span>
            </div>
        </div>
    )
}

export default Editor

