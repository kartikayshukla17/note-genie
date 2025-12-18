import User from '../models/User.js';

export const getNotes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ notes: user.notes || [] });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const addNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const newNote = {
            id: Date.now().toString(),
            title: title || 'Untitled',
            content: content || '',
            createdAt: Date.now(),
            lastUpdate: Date.now()
        };

        user.notes.push(newNote);
        await user.save();

        res.status(201).json({ note: newNote });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const noteIndex = user.notes.findIndex(n => n.id === id);
        if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });

        user.notes[noteIndex].title = title !== undefined ? title : user.notes[noteIndex].title;
        user.notes[noteIndex].content = content !== undefined ? content : user.notes[noteIndex].content;
        user.notes[noteIndex].lastUpdate = Date.now();

        await user.save();
        res.status(200).json({ note: user.notes[noteIndex] });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const noteIndex = user.notes.findIndex(n => n.id === id);
        if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });

        user.notes.splice(noteIndex, 1);
        await user.save();

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
