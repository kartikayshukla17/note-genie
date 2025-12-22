import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import Editor from './components/Editor'
import Auth from './pages/Auth'
import ConfirmDialog from './components/ConfirmDialog'
import { logout } from './reducers/userSlice'
import { fetchFolders, clearNotes } from './reducers/noteSlice'


const App = () => {
  const dispatch = useDispatch()
  const folders = useSelector((state) => state.notes?.folders || [])
  const { currentUser } = useSelector((state) => state.user)
  const [openFileIds, setOpenFileIds] = useState([])
  const [activeFileId, setActiveFileId] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchFolders()).catch(() => { });
    } else {
      dispatch(clearNotes());
    }
  }, [currentUser, dispatch]);


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

  useEffect(() => {
    const allNotes = [];
    const collectNotes = (items) => {
      items.forEach(item => {
        if (item.type === 'note') allNotes.push(item);
        if (item.children) collectNotes(item.children);
      });
    };
    collectNotes(folders);

    if (allNotes.length > openFileIds.length) {
      const newNote = allNotes[allNotes.length - 1];
      if (newNote && !openFileIds.includes(newNote.id)) {
        setOpenFileIds([...openFileIds, newNote.id]);
        setActiveFileId(newNote.id);
      }
    }
  }, [folders]);


  if (!currentUser) {
    return <Auth />
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    setShowDropdown(false)
  }

  const confirmLogout = () => {
    dispatch(logout())
    setShowLogoutConfirm(false)
  }

  const handleFileClick = (note) => {

    if (!openFileIds.includes(note.id)) {
      setOpenFileIds([...openFileIds, note.id])
    }
    setActiveFileId(note.id)
  }

  const handleTabClick = (id) => {
    setActiveFileId(id)
  }

  const handleCloseTab = (id) => {
    const newOpenFileIds = openFileIds.filter((fid) => fid !== id)
    setOpenFileIds(newOpenFileIds)

    if (activeFileId === id) {
      if (newOpenFileIds.length > 0) {
        setActiveFileId(newOpenFileIds[newOpenFileIds.length - 1])
      } else {
        setActiveFileId(null)
      }
    }
  }


  const openFiles = openFileIds.map(id => findNoteInTree(folders, id)).filter(Boolean)

  return (
    <>
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmButtonText="Logout"
      />
      <div className="h-screen w-screen bg-zinc-950 flex text-zinc-300 overflow-hidden font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed md:relative z-50 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <Sidebar onFileClick={(note) => { handleFileClick(note); setSidebarOpen(false); }} />
        </div>

        <div className="flex-1 flex flex-col bg-zinc-900/50 m-1 md:m-2 rounded-xl shadow-2xl overflow-hidden border border-white/5 ring-1 ring-black/20 relative z-10 backdrop-blur-sm">

          <div className="flex items-center justify-between border-b border-white/5">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-3 text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <TabBar
              openFiles={openFiles}
              activeFileId={activeFileId}
              onTabClick={handleTabClick}
              onCloseTab={handleCloseTab}
            />

            <div className="relative px-4">
              <button
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="font-medium">{currentUser.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded-lg shadow-xl border border-white/10 py-1 min-w-[150px] z-50">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-white/5">
                    {currentUser.email}
                  </div>
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {activeFileId ? (
              <Editor activeFileId={activeFileId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 select-none">
                <div className="mb-4 text-6xl opacity-20 grayscale">✨</div>
                <p className="text-lg font-medium">Select a file to view</p>
                <p className="text-sm opacity-50">or create a new one using the + button</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App