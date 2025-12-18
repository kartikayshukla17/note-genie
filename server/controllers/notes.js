import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');


const getUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};


const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};


export const getNotes = (req, res) => {
    try {
        const users = getUsers();
        const user = users.find(u => u._id === req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ notes: user.notes || [] });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};


export const addNote = (req, res) => {
    try {
        const { title, content } = req.body;
        const users = getUsers();
        const userIndex = users.findIndex(u => u._id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        const newNote = {
            id: Date.now().toString(),
            title: title || 'Untitled',
            content: content || '',
            createdAt: Date.now(),
            lastUpdate: Date.now()
        };

        users[userIndex].notes.push(newNote);
        saveUsers(users);

        res.status(201).json({ note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};


export const updateNote = (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const users = getUsers();
        const userIndex = users.findIndex(u => u._id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        const noteIndex = users[userIndex].notes.findIndex(n => n.id === id);
        if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });

        users[userIndex].notes[noteIndex] = {
            ...users[userIndex].notes[noteIndex],
            title: title !== undefined ? title : users[userIndex].notes[noteIndex].title,
            content: content !== undefined ? content : users[userIndex].notes[noteIndex].content,
            lastUpdate: Date.now()
        };

        saveUsers(users);
        res.status(200).json({ note: users[userIndex].notes[noteIndex] });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};


export const deleteNote = (req, res) => {
    try {
        const { id } = req.params;
        const users = getUsers();
        const userIndex = users.findIndex(u => u._id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        const noteIndex = users[userIndex].notes.findIndex(n => n.id === id);
        if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });

        users[userIndex].notes.splice(noteIndex, 1);
        saveUsers(users);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};
