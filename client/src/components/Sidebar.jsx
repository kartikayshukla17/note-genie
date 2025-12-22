import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createItemLocal, deleteItemLocal, updateItemLocal, syncItemToServer, deleteItemAsync } from '../reducers/noteSlice'
import ConfirmDialog from './ConfirmDialog'

const TreeItem = ({ item, onFileClick, selectedId, setSelectedId, dispatch, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renamingValue, setRenamingValue] = useState(item.name || item.title);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleClick = () => {
        if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
            setSelectedId(item.id);
        } else {
            onFileClick(item);
        }
    };

    const handleDoubleClick = () => {
        if (item.type === 'folder') {
            setIsRenaming(true);
        }
    };

    const handleRenameSubmit = () => {
        if (renamingValue.trim()) {
            dispatch(updateItemLocal({ id: item.id, name: renamingValue.trim() }));
            // Sync rename to server
            dispatch(syncItemToServer({
                id: item.id,
                type: 'folder',
                name: renamingValue.trim(),
                isNew: item.id.startsWith('local_')
            })).catch(() => { });
        }
        setIsRenaming(false);
    };

    const handleRenameCancel = () => {
        setRenamingValue(item.name || item.title);
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            handleRenameCancel();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        dispatch(deleteItemLocal(item.id));
        // Only sync to server if item is already synced (not local)
        if (!item.id.startsWith('local_')) {
            dispatch(deleteItemAsync(item.id)).catch(() => { });
        }
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                title={`Delete ${item.type === 'folder' ? 'Folder' : 'Note'}`}
                message={`Are you sure you want to delete "${item.type === 'folder' ? item.name : item.title}"?${item.type === 'folder' && item.children?.length > 0 ? ' All contents will be deleted.' : ''}`}
            />
            <div>
                <div
                    className={`group flex items-center justify-between px-${4 + level * 2} py-2 cursor-pointer text-sm text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 transition-all ${selectedId === item.id ? 'border-purple-500 bg-white/5' : 'border-transparent'}`}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                >
                    <div className="flex items-center gap-2 truncate flex-1">
                        {item.type === 'folder' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-yellow-500/70 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                <path d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.464 0 .909.184 1.237.513l1.414 1.414a.25.25 0 00.177.073h4.836c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0116.25 17H3.75A1.75 1.75 0 012 15.25V4.75z" />
                            </svg>
                        ) : (
                            <span className="text-xs opacity-50 text-purple-500/50 group-hover:text-purple-500 flex-shrink-0">#</span>
                        )}
                        {isRenaming ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={renamingValue}
                                onChange={(e) => setRenamingValue(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={handleRenameKeyDown}
                                className="bg-zinc-800 text-white px-1 py-0 rounded outline-none border border-purple-500 flex-1 min-w-0"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="truncate">{item.type === 'folder' ? item.name : item.title}</span>
                        )}
                    </div>
                    {!isRenaming && (
                        <div className="flex gap-1">
                            {item.type === 'folder' && (
                                <button
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-500/10 rounded text-zinc-500 hover:text-blue-400 transition-all flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsRenaming(true);
                                    }}
                                    title="Rename folder"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                                    </svg>
                                </button>
                            )}
                            <button
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
                                onClick={handleDelete}
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                {item.type === 'folder' && isExpanded && item.children && (
                    <div>
                        {item.children.map((child) => (
                            <TreeItem
                                key={child.id}
                                item={child}
                                onFileClick={onFileClick}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                dispatch={dispatch}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const Sidebar = ({ onFileClick }) => {
    const folders = useSelector((state) => state.notes?.folders || [])
    const dispatch = useDispatch();
    const [selectedId, setSelectedId] = useState(null);

    const handleNewFolder = () => {
        const id = `local_folder_${Date.now()}`;
        dispatch(createItemLocal({ id, type: 'folder', name: 'New Folder', parentId: selectedId }));
        dispatch(syncItemToServer({
            id,
            type: 'folder',
            name: 'New Folder',
            parentId: selectedId,
            isNew: true
        })).catch(() => { });
    };

    const handleNewNote = () => {
        const id = `local_note_${Date.now()}`;
        dispatch(createItemLocal({ id, type: 'note', title: 'Untitled', content: '', parentId: selectedId }));
        dispatch(syncItemToServer({
            id,
            type: 'note',
            title: 'Untitled',
            content: '',
            parentId: selectedId,
            isNew: true
        })).catch(() => { });
    };

    return (
        <div className="w-64 bg-zinc-900 border-r border-white/5 flex flex-col h-full shrink-0">
            <div className="p-4 flex justify-between items-center group">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Explorer</span>
                <div className="flex gap-1">
                    <button
                        className="text-zinc-400 hover:text-white hover:bg-white/10 rounded p-1 transition-all"
                        onClick={handleNewFolder}
                        title="New Folder"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                    </button>
                    <button
                        className="text-zinc-400 hover:text-white hover:bg-white/10 rounded p-1 transition-all"
                        onClick={handleNewNote}
                        title="New File"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {folders.map((item) => (
                    <TreeItem
                        key={item.id}
                        item={item}
                        onFileClick={onFileClick}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        dispatch={dispatch}
                    />
                ))}
            </div>
        </div>
    )
}

export default Sidebar
