import React from 'react'

const TabBar = ({ openFiles, activeFileId, onTabClick, onCloseTab }) => {
    return (
        <div className="flex bg-zinc-900/50 border-b border-white/5 shrink-0 overflow-x-auto custom-scrollbar backdrop-blur-sm">
            {openFiles.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                    <div
                        key={file.id}
                        className={`group flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-t-2 transition-all min-w-[120px] max-w-[200px] shrink-0
                            ${isActive
                                ? 'bg-zinc-800/50 text-purple-300 border-purple-500 font-medium'
                                : 'text-zinc-500 border-transparent hover:bg-zinc-800/30 hover:text-zinc-300'
                            }`}
                        onClick={() => onTabClick(file.id)}
                    >
                        <span className="truncate flex-1">{file.title || 'Untitled'}</span>
                        <span
                            className={`rounded-full p-0.5 hover:bg-white/10 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(file.id);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default TabBar
