import express from 'express';
import { getNotes, addNote, updateNote, deleteNote } from '../controllers/notes.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// All routes are protected
router.get('/', verifyToken, getNotes);
router.post('/', verifyToken, addNote);
router.put('/:id', verifyToken, updateNote);
router.delete('/:id', verifyToken, deleteNote);

export default router;
