import express from 'express';
import { getFolders, createItem, updateItem, deleteItem } from '../controllers/folders.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getFolders);
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

export default router;
