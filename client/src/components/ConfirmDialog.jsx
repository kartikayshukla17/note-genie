import React from 'react'

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, confirmButtonText = 'Delete' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
            <div
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-zinc-300 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
