import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createNoteLocal, deleteNoteLocal } from '../reducers/noteSlice'

const Sidebar = ({ onFileClick }) => {
    const notes = useSelector((state) => state.notes?.items || [])
    const dispatch = useDispatch();

    const handleNewFile = () => {
        dispatch(createNoteLocal({ title: 'Untitled', content: '' }));
    }

    const handleDelete = (e, noteId) => {
        e.stopPropagation();
        dispatch(deleteNoteLocal(noteId));
    }

    return (
        <div className="w-64 bg-zinc-900 border-r border-white/5 flex flex-col h-full shrink-0">
            <div className="p-4 flex justify-between items-center group">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Explorer</span>
                <button
                    className="text-zinc-400 hover:text-white hover:bg-white/10 rounded p-1 transition-all"
                    onClick={handleNewFile}
                    title="New File"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="group flex items-center justify-between px-4 py-2 cursor-pointer text-sm text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent hover:border-purple-500 transition-all"
                        onClick={() => onFileClick(note)}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <span className="text-xs opacity-50 text-purple-500/50 group-hover:text-purple-500">#</span>
                            <span className="truncate">{note.title || 'Untitled'}</span>
                        </div>
                        <button
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-all"
                            onClick={(e) => handleDelete(e, note.id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar
